const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

// ── AI 配置（通过 Railway 环境变量注入）──
// 支持多端点自动降级：Mimo（国内优先）→ OpenRouter（全球可用）
const _hasMimoKey   = !!process.env.MIMO_API_KEY;
const _hasORKey     = !!process.env.OPENROUTER_API_KEY;
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '60000', 10);

// ── AI Provider 配置列表（按优先级排序）──
const AI_PROVIDERS = [];

if (_hasMimoKey) {
  AI_PROVIDERS.push({
    name: 'Xiaomi Mimo',
    endpoint: process.env.MIMO_ENDPOINT || 'https://api.mimo.xiaomi.com/v1/chat/completions',
    model: process.env.MIMO_MODEL || 'prompt-generator-lite',
    key: process.env.MIMO_API_KEY,
    isGlobal: false  // 国内端点，海外可能不可达
  });
}

if (_hasORKey) {
  AI_PROVIDERS.push({
    name: 'OpenRouter',
    endpoint: process.env.OR_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions',
    model: process.env.OR_MODEL || 'anthropic/claude-opus-4',
    key: process.env.OPENROUTER_API_KEY,
    isGlobal: true   // 全球可达
  });
}

// 兼容旧变量：单端点模式（无环境变量时）
if (AI_PROVIDERS.length === 0 && process.env.AI_API_KEY) {
  AI_PROVIDERS.push({
    name: 'Legacy',
    endpoint: process.env.AI_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions',
    model: process.env.AI_MODEL || 'anthropic/claude-opus-4',
    key: process.env.AI_API_KEY,
    isGlobal: true
  });
}

// ── Football-Data.org 配置 ──
const FD_API_KEY    = process.env.FD_API_KEY    || '';
const FD_BASE_URL   = 'https://api.football-data.org';
const FD_VERSION    = '/v4';

// ── 内存缓存：避免超出免费版 10次/分钟限制 ──
const _fdCache = new Map();
const FD_CACHE_TTL = 60 * 1000; // 缓存60秒

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>404</title></head><body><h1>404</h1></body></html>');
    }
    if (['.js', '.css', '.png', '.jpg', '.svg'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// ── 解析请求体 ──
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch(e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// ── HTTP 请求封装（支持 https）──
function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const transport = options.protocol === 'https:' ? https : require('http');
    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('AI服务连接超时')); });
    req.setTimeout(AI_TIMEOUT_MS);
    if (postData) req.write(postData);
    req.end();
  });
}

// ── /api/analyze — AI 大模型分析代理端点（支持多 Provider 自动降级）──
async function handleAnalyze(req, res) {
  // 设置 CORS（允许前端跨域调用）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 检查后端是否配置了至少一个 AI Provider
  if (AI_PROVIDERS.length === 0) {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      ok: false,
      error: 'UNCONFIGURED',
      message: '⚠️ 大模型服务暂未上线，请稍后再试或使用「复制提示词模式」手动分析'
    }));
  }

  let body;
  try {
    body = await parseBody(req);
  } catch(e) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: false, error: 'BAD_REQUEST', message: '请求数据格式错误' }));
  }

  const promptText = body.prompt || '';
  if (!promptText) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: false, error: 'BAD_REQUEST', message: '缺少分析内容' }));
  }

  // ── 按优先级尝试各 Provider，自动降级 ──
  // 用户可通过 body.provider 指定优先使用的 Provider
  const requestedProvider = body.provider || '';
  let providersToTry = AI_PROVIDERS;

  if (requestedProvider && requestedProvider !== 'auto') {
    // 用户指定了特定 Provider，将其放在首位（其余仍作为降级备选）
    const matched = AI_PROVIDERS.filter(p =>
      p.name.toLowerCase().includes(requestedProvider.toLowerCase())
    );
    const others = AI_PROVIDERS.filter(p =>
      !p.name.toLowerCase().includes(requestedProvider.toLowerCase())
    );
    providersToTry = matched.concat(others);

    if (matched.length === 0) {
      console.log(`[AI Proxy] 用户指定的 Provider "${requestedProvider}" 未找到，使用默认顺序`);
      providersToTry = AI_PROVIDERS;
    } else {
      console.log(`[AI Proxy] 用户指定 Provider: ${matched[0].name}，降级顺序: ${others.map(o => o.name).join(', ') || '无'}`);
    }
  }

  const postData = JSON.stringify({
    messages: [
      { role: 'system', content: '你是世界顶级足球分析师，精通FIFA世界杯赛事分析。请基于提供的数据给出专业、准确的分析和比分预测。回答使用中文。' },
      { role: 'user', content: promptText }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  for (let i = 0; i < providersToTry.length; i++) {
    const provider = providersToTry[i];
    
    try {
      const result = await _callAIProvider(provider, postData, promptText.length);

      // 成功响应
      if (result.status === 200) {
        const aiData = JSON.parse(result.body);
        const content = aiData.choices?.[0]?.message?.content || '';

        if (!content) {
          console.warn(`[AI Proxy] ${provider.name} 返回空内容，尝试下一个...`);
          continue; // 尝试下一个 Provider
        }

        console.log(`[AI Proxy] ✅ ${provider.name} (${provider.model}) 分析成功, 内容长度: ${content.length}`);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ 
          ok: true, 
          content: content, 
          model: `${provider.name} · ${provider.model}`,
          provider: provider.name 
        }));
      }

      // HTTP 错误（非连接错误）
      console.error(`[AI Proxy] ${provider.name} 返回 HTTP ${result.status}:`, result.body.substring(0, 300));
      
      // 429 限流：直接报错，不降级（其他 provider 可能也限流）
      if (result.status === 429) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
          ok: false,
          error: 'RATE_LIMITED',
          message: '⚠️ 大模型当前负载过高，暂时无法响应，请稍后再试或切换到「复制提示词模式」'
        }));
      }

      // 其他 HTTP 错误：尝试下一个 Provider
      if (i < providersToTry.length - 1) {
        console.log(`[AI Proxy] ${provider.name} 失败(HTTP ${result.status}), 降级到 ${providersToTry[i+1].name}...`);
        continue;
      }

      // 最后一个 Provider 也失败了
      let errMsg = '大模型返回错误';
      try {
        const errJson = JSON.parse(result.body);
        errMsg = errJson.error?.message || errJson.message || `HTTP ${result.status}`;
      } catch(e) {}

      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        ok: false,
        error: 'AI_ERROR',
        message: `❌ 大模型分析失败（${errMsg}），请稍后再试或使用「复制提示词模式」手动分析`
      }));

    } catch(err) {
      const isConnectionErr = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT'].includes(err.code)
                            || err.message.includes('timeout')
                            || err.message.includes('超时');

      console.error(`[AI Proxy] ${provider.name} 调用异常: [${err.code || 'ERR'}] ${err.message}`);

      // 连接类错误 → 自动降级到下一个 Provider
      if (isConnectionErr && i < providersToTry.length - 1) {
        console.log(`[AI Proxy] ${provider.name} 连接失败, 自动降级 → ${providersToTry[i+1].name}`);
        continue;
      }

      // 最后一个 Provider 也失败了
      let userMessage = '⚠️ 大模型服务暂时不可用，请稍后再试';
      if (err.message.includes('timeout') || err.message.includes('超时')) {
        userMessage = '⚠️ 大模型响应超时，可能当前负载较高，请稍后再试';
      } else if (err.code === 'ENOTFOUND') {
        userMessage = `⚠️ ${provider.name} 域名不可达（服务器位于海外）`;
      } else if (err.code === 'ECONNREFUSED') {
        userMessage = `⚠️ ${provider.name} 拒绝连接`;
      }

      res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        ok: false,
        error: 'SERVICE_UNAVAILABLE',
        message: userMessage + '，或使用「复制提示词模式」手动分析'
      }));
    }
  }
}

// ── 单次调用 AI Provider ──
function _callAIProvider(provider, postData, promptLength) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(provider.endpoint);
    const options = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
        'Accept': 'application/json',
        'HTTP-Referer': 'https://wc2026.up.railway.app',
        'X-Title': 'WC2026 Predictor'
      },
      timeout: AI_TIMEOUT_MS
    };

    // 注入 model 到 POST 数据
    let dataToSend = postData;
    try {
      const parsed = JSON.parse(postData);
      parsed.model = provider.model;
      dataToSend = JSON.stringify(parsed);
    } catch(e) {}

    console.log(`[AI Proxy] → ${provider.name} | Model: ${provider.model} | Prompt: ${promptLength} chars`);

    const transport = options.protocol === 'https:' ? https : require('http');
    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`${provider.name} 连接超时`)); });
    req.setTimeout(AI_TIMEOUT_MS);
    req.write(dataToSend);
    req.end();
  });
}

// ── /api/fd/* — Football-Data.org 通用代理端点 ──
async function handleFootballData(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (!FD_API_KEY) {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      error: 'UNCONFIGURED',
      message: '⚠️ Football-Data API 未配置（缺少 FD_API_KEY 环境变量）'
    }));
  }

  // 提取路径: /api/fd/competitions/WC/matches → /v4/competitions/WC/matches
  const apiPath = req.url.replace(/^\/api\/fd/, FD_VERSION);
  const cacheKey = `fd:${req.url.split('?')[0]}`;

  // 检查缓存
  const cached = _fdCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < FD_CACHE_TTL) {
    console.log(`[FD Proxy] CACHE HIT: ${apiPath}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(cached.data);
  }

  try {
    const fdUrl = `${FD_BASE_URL}${apiPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
    const parsed = new URL(fdUrl);

    const fdOptions = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'X-Auth-Token': FD_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    const result = await httpRequest(fdOptions);

    if (result.status === 429) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'RATE_LIMITED', message: 'API 请求频率超限，请稍后再试' }));
    }

    if (result.status >= 400) {
      console.error(`[FD Proxy] HTTP ${result.status}: ${result.body.substring(0, 200)}`);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      return res.end(result.body);
    }

    // 缓存结果
    _fdCache.set(cacheKey, { data: result.body, ts: Date.now() });

    console.log(`[FD Proxy] ✅ ${apiPath} (${result.body.length} bytes)`);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(result.body);

  } catch(err) {
    console.error('[FD Proxy] 请求失败:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'PROXY_ERROR', message: err.message }));
  }
}

// ── /api/scores — 实时比分聚合端点 ──
async function handleScores(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (!FD_API_KEY) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'UNCONFIGURED',
      matches: [],
      total: 0,
      finished: 0,
      inPlay: 0,
      fetchTime: new Date().toISOString(),
      message: 'Football-Data API 未配置'
    }));
  }

  const cacheKey = 'fd:scores';
  const cached = _fdCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 30 * 1000) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(cached.data);
  }

  try {
    // 获取世界杯比赛数据
    const wcUrl = `${FD_BASE_URL}${FD_VERSION}/competitions/WC/matches?status=FINISHED,IN_PLAY,PAUSED,TIMED,SCHEDULED&limit=80`;
    const parsed = new URL(wcUrl);

    const options = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'X-Auth-Token': FD_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    const result = await httpRequest(options);

    if (result.status !== 200 && result.status !== 207) {
      res.writeHead(result.status || 502, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'API_ERROR',
        matches: [],
        total: 0,
        finished: 0,
        inPlay: 0,
        fetchTime: new Date().toISOString()
      }));
    }

    let data;
    try {
      data = JSON.parse(result.body);
    } catch(e) {
      throw new Error('Invalid JSON from football-data.org');
    }

    const matches = data.matches || [];
    const finished = matches.filter(m => m.status === 'FINISHED').length;
    const inPlay = matches.filter(m => ['IN_PLAY', 'PAUSED'].includes(m.status)).length;

    const responsePayload = JSON.stringify({
      ok: true,
      matches: matches.map(m => ({
        homeTeam: m.homeTeam?.shortName || m.homeTeam?.name,
        awayTeam: m.awayTeam?.shortName || m.awayTeam?.name,
        status: m.status,
        score: m.score || {},
        minute: m.minute || null,
        utcDate: m.utcDate || null
      })),
      total: matches.length,
      finished,
      inPlay,
      fetchTime: new Date().toISOString(),
      fetchTimeBeijing: new Date(Date.now() + 8*60*60*1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    });

    _fdCache.set(cacheKey, { data: responsePayload, ts: Date.now() });

    console.log(`[Scores] ✅ ${matches.length} 场比赛 (完赛${finished}/进行中${inPlay})`);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(responsePayload);

  } catch(err) {
    console.error('[Scores] 获取失败:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'FETCH_ERROR',
      message: err.message,
      matches: [],
      total: 0,
      finished: 0,
      inPlay: 0,
      fetchTime: new Date().toISOString()
    }));
  }
}
const server = http.createServer(async (req, res) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Health check
  if (req.url === '/health' || req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', ts: new Date().toISOString() }));
  }

  // AI 分析代理端点
  if (req.url.startsWith('/api/analyze')) {
    return handleAnalyze(req, res);
  }

  // 服务状态诊断端点（仅返回布尔值，不暴露密钥）
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      services: {
        ai: {
          configured: AI_PROVIDERS.length > 0,
          providerCount: AI_PROVIDERS.length,
          providers: AI_PROVIDERS.map(p => ({
            name: p.name,
            endpoint: p.endpoint.replace(/\/v1\/chat\/completions$/, '/...'),
            model: p.model,
            isGlobal: p.isGlobal
          }))
        },
        footballData: { configured: !!FD_API_KEY, version: 'v4', cacheTTL: `${FD_CACHE_TTL/1000}s` }
      }
    }));
  }

  // Football-Data.org 代理端点（通用路径）
  if (req.url.startsWith('/api/fd/')) {
    return handleFootballData(req, res);
  }

  // 实时比分聚合端点
  if (req.url.startsWith('/api/scores')) {
    return handleScores(req, res);
  }

  // 其他 API 路由
  if (req.url.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not_found' }));
  }

  // 静态文件服务
  let urlPath = req.url.split('?')[0];
  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  const fullPath = path.join(__dirname, filePath);

  // Prevent directory traversal
  const resolved = path.resolve(fullPath);
  if (!resolved.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  serveFile(fullPath, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WC2026 Server running on port ${PORT}`);
  console.log(`   AI Providers: ${AI_PROVIDERS.length} configured`);
  AI_PROVIDERS.forEach((p, i) => {
    console.log(`     [${i + 1}] ${p.name} | Model: ${p.model} | Global: ${p.isGlobal ? 'Yes' : 'No (CN-only)'}`);
  });
  if (AI_PROVIDERS.length === 0) {
    console.log(`     ⚠️ No AI providers configured! Set MIMO_API_KEY or OPENROUTER_API_KEY`);
  }
  console.log(`   Football-Data: v4 | Key: ${!!FD_API_KEY} | Cache TTL: ${FD_CACHE_TTL/1000}s`);
});
