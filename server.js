// ============================================
// server.js — API 代理服务器 v2
// 所有 API 密钥仅存在于此文件（服务端），客户端永远看不到
// 端点：
//   GET  /api/scores           → 实时比分（从 football-data.org 获取，30秒缓存）
//   POST /api/ai-analysis      → AI 分析（Claude Opus / MiMo 双模型）
//   POST /api/ai-intelligence  → AI 情报（Claude Opus）
//   GET  /api/fd/*             → football-data.org 原始代理（兼容旧代码）
//   GET  /*                    → 静态文件
// ============================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// ════════════════════════════════════════════
//  API 密钥（仅服务端可见，客户端永远获取不到）
// ════════════════════════════════════════════

// football-data.org（实时比分数据源）
// 密钥通过环境变量配置，切勿硬编码！
const FD_API_KEY = process.env.FD_API_KEY || '';
const FD_BASE = 'api.football-data.org';

// OpenRouter — Claude Opus 4.7（替换原 DeepSeek）
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE = 'openrouter.ai';
const CLAUDE_MODEL = 'anthropic/claude-opus-4.7';

// 小米 MiMo（第二模型）
const MIMO_API_KEY = process.env.MIMO_API_KEY || '';
const MIMO_BASE = 'api.xiaomimimo.com';
const MIMO_MODEL = 'mimo-v2.5-pro';

// ════════════════════════════════════════════
//  缓存（避免超出 football-data.org 免费版 10次/分钟 限制）
// ════════════════════════════════════════════

let _scoresCache = null;
let _scoresCacheTime = 0;
const SCORES_CACHE_TTL = 30 * 1000; // 30秒缓存

// ════════════════════════════════════════════
//  MIME 类型
// ════════════════════════════════════════════

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ════════════════════════════════════════════
//  工具函数
// ════════════════════════════════════════════

function makeHttpsRequest(hostname, port, reqPath, method, headers, body) {
  return new Promise((resolve, reject) => {
    const options = { hostname, port: port || 443, path: reqPath, method: method || 'GET', headers: headers || {} };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
  });
}

// ════════════════════════════════════════════
//  API 端点处理
// ════════════════════════════════════════════

// ── GET /api/scores → 从 football-data.org 获取实时比分 ──
async function handleScores(res) {
  // 检查缓存
  const now = Date.now();
  if (_scoresCache && (now - _scoresCacheTime) < SCORES_CACHE_TTL) {
    console.log(`[Scores] 返回缓存数据 (${Math.floor((now - _scoresCacheTime) / 1000)}秒前)`);
    sendJSON(res, 200, _scoresCache);
    return;
  }

  try {
    console.log('[Scores] 从 football-data.org 获取最新数据...');
    const apiPath = '/v4/competitions/WC/matches?status=FINISHED,IN_PLAY,PAUSED,TIMED,SCHEDULED&limit=80';
    const result = await makeHttpsRequest(FD_BASE, 443, apiPath, 'GET', {
      'X-Auth-Token': FD_API_KEY,
      'User-Agent': 'WC2026-Predictor/2.0',
    });

    if (result.statusCode !== 200) {
      throw new Error(`football-data.org HTTP ${result.statusCode}: ${result.body.substring(0, 200)}`);
    }

    const rawData = JSON.parse(result.body);
    if (!rawData.matches || rawData.matches.length === 0) {
      throw new Error('No matches returned from API');
    }

    // 处理为网站格式（与 live-scores.json 相同格式）
    const matches = rawData.matches.map(m => ({
      homeTeam: m.homeTeam?.shortName || m.homeTeam?.name || 'Unknown',
      awayTeam: m.awayTeam?.shortName || m.awayTeam?.name || 'Unknown',
      status: m.status,
      utcDate: m.utcDate,
      score: {
        fullTime: m.score?.fullTime || { home: null, away: null },
        halfTime: m.score?.halfTime || { home: null, away: null },
      },
      minute: m.minute || null,
      venue: m.venue || null,
    }));

    const finished = matches.filter(m => m.status === 'FINISHED');
    const inPlay = matches.filter(m => ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status));
    const scheduled = matches.filter(m => ['TIMED', 'SCHEDULED'].includes(m.status));

    const bjNow = new Date(Date.now() + 8 * 3600000);
    const output = {
      fetchTime: new Date().toISOString(),
      fetchTimeBeijing: bjNow.toISOString().replace('T', ' ').substring(0, 19) + ' (北京时间)',
      total: matches.length,
      finished: finished.length,
      inPlay: inPlay.length,
      scheduled: scheduled.length,
      matches: matches,
    };

    // 更新缓存
    _scoresCache = output;
    _scoresCacheTime = now;

    console.log(`[Scores] ✅ 获取成功: ${output.total}场 (完赛${output.finished}/进行${output.inPlay}/待赛${output.scheduled})`);
    sendJSON(res, 200, output);

  } catch (e) {
    console.error('[Scores] ❌ 获取失败:', e.message);
    // 如果有缓存（即使过期），返回缓存
    if (_scoresCache) {
      console.log('[Scores] 返回过期缓存作为降级');
      sendJSON(res, 200, { ..._scoresCache, _stale: true });
    } else {
      sendJSON(res, 502, { error: 'Failed to fetch scores', message: e.message });
    }
  }
}

// ── POST /api/ai-analysis → AI 分析代理 ──
async function handleAIAnalysis(req, res) {
  try {
    const bodyStr = await readBody(req);
    const params = JSON.parse(bodyStr);

    const model = params.model || 'claude'; // 'claude' | 'mimo'
    const systemPrompt = params.system || '你是一位世界顶级足球分析师。';
    const userPrompt = params.user || '';
    const maxTokens = params.max_tokens || 800;
    const temperature = params.temperature ?? 0.7;

    if (!userPrompt) {
      sendJSON(res, 400, { error: 'Missing user prompt' });
      return;
    }

    let result;

    if (model === 'claude') {
      // ── Claude Opus 4.7 via OpenRouter ──
      console.log('[AI] 调用 Claude Opus 4.7 via OpenRouter...');
      const payload = JSON.stringify({
        model: CLAUDE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        stream: false,
      });

      result = await makeHttpsRequest(OPENROUTER_BASE, 443, '/api/v1/chat/completions', 'POST', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://wc2026-predictor.app',
        'X-Title': 'WC2026 AI Predictor',
      }, payload);

    } else if (model === 'mimo') {
      // ── MiMo via xiaomimimo.com ──
      console.log('[AI] 调用 MiMo-V2.5-Pro...');
      const payload = JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        stream: false,
      });

      result = await makeHttpsRequest(MIMO_BASE, 443, '/v1/chat/completions', 'POST', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_API_KEY}`,
      }, payload);

    } else {
      sendJSON(res, 400, { error: `Unknown model: ${model}` });
      return;
    }

    if (result.statusCode !== 200) {
      console.error(`[AI] ${model} HTTP ${result.statusCode}: ${result.body.substring(0, 300)}`);
      sendJSON(res, result.statusCode, {
        error: true,
        message: `${model} API error: HTTP ${result.statusCode}`,
        fallback: true,
      });
      return;
    }

    const data = JSON.parse(result.body);
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      sendJSON(res, 200, { error: true, message: 'AI returned empty content', fallback: true });
      return;
    }

    console.log(`[AI] ✅ ${model} 分析完成 (${data.usage?.total_tokens || 0} tokens)`);
    sendJSON(res, 200, {
      error: false,
      content: content,
      tokens: data.usage?.total_tokens || 0,
      model: data.model || model,
    });

  } catch (e) {
    console.error('[AI] ❌ 分析失败:', e.message);
    sendJSON(res, 500, { error: true, message: e.message, fallback: true });
  }
}

// ── POST /api/ai-intelligence → AI 情报代理 ──
async function handleAIIntelligence(req, res) {
  try {
    const bodyStr = await readBody(req);
    const params = JSON.parse(bodyStr);
    const userPrompt = params.user || '';

    if (!userPrompt) {
      sendJSON(res, 400, { error: 'Missing prompt' });
      return;
    }

    console.log('[AI-Intel] 调用 Claude Opus 4.7 获取情报...');
    const payload = JSON.stringify({
      model: CLAUDE_MODEL,
      messages: [
        { role: 'system', content: '你是足球情报专家。只返回JSON。' },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.3,
      stream: false,
    });

    const result = await makeHttpsRequest(OPENROUTER_BASE, 443, '/api/v1/chat/completions', 'POST', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://wc2026-predictor.app',
      'X-Title': 'WC2026 AI Predictor',
    }, payload);

    if (result.statusCode !== 200) {
      sendJSON(res, result.statusCode, { error: true, message: `HTTP ${result.statusCode}` });
      return;
    }

    const data = JSON.parse(result.body);
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      sendJSON(res, 200, { error: true, message: 'Empty content' });
      return;
    }

    // 尝试解析 JSON
    let parsed = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // JSON 解析失败，返回原始内容
    }

    console.log('[AI-Intel] ✅ 情报获取完成');
    sendJSON(res, 200, { error: false, content: content, parsed: parsed });

  } catch (e) {
    console.error('[AI-Intel] ❌ 失败:', e.message);
    sendJSON(res, 500, { error: true, message: e.message });
  }
}

// ════════════════════════════════════════════
//  主服务器
// ════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API 路由 ──

  // GET /api/scores → 实时比分
  if (pathname === '/api/scores' && req.method === 'GET') {
    await handleScores(res);
    return;
  }

  // POST /api/ai-analysis → AI 分析
  if (pathname === '/api/ai-analysis' && req.method === 'POST') {
    await handleAIAnalysis(req, res);
    return;
  }

  // POST /api/ai-intelligence → AI 情报
  if (pathname === '/api/ai-intelligence' && req.method === 'POST') {
    await handleAIIntelligence(req, res);
    return;
  }

  // GET /api/fd/* → football-data.org 原始代理（兼容旧代码）
  if (pathname.startsWith('/api/fd/') && req.method === 'GET') {
    const apiPath = pathname.replace('/api/fd', '') + (url.search || '');
    console.log(`[Proxy] → https://${FD_BASE}/v4${apiPath}`);

    try {
      const result = await makeHttpsRequest(FD_BASE, 443, `/v4${apiPath}`, 'GET', {
        'X-Auth-Token': FD_API_KEY,
        'User-Agent': 'WC2026-Predictor/2.0',
      });

      res.writeHead(result.statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=30',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(result.body);
    } catch (e) {
      sendJSON(res, 502, { error: 'Proxy error', message: e.message });
    }
    return;
  }

  // ── 静态文件服务 ──
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  // 安全：防止目录遍历
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // 安全：禁止直接访问 server.js / fetch-live-data.js / package.json
  const basename = path.basename(filePath);
  if (['server.js', 'fetch-live-data.js', 'package.json', '.env'].includes(basename)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const htmlPath = filePath + '.html';
      fs.readFile(htmlPath, (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        const ext = path.extname(htmlPath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        res.end(data2);
      });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  ⚽ 2026 World Cup Predictor Server v2`);
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`========================================`);
  console.log(`  API Endpoints:`);
  console.log(`    GET  /api/scores          → 实时比分（30秒缓存）`);
  console.log(`    POST /api/ai-analysis      → AI 分析（Claude/MiMo）`);
  console.log(`    POST /api/ai-intelligence  → AI 情报`);
  console.log(`    GET  /api/fd/*             → FD 原始代理`);
  console.log(`========================================`);
  console.log(`  🔒 所有 API 密钥仅在服务端，客户端不可见`);
  console.log(`    football-data.org: ${FD_API_KEY.substring(0, 8)}****`);
  console.log(`    OpenRouter (Claude): ${OPENROUTER_API_KEY.substring(0, 12)}****`);
  console.log(`    MiMo: ${MIMO_API_KEY.substring(0, 8)}****`);
  console.log(`========================================\n`);
});
