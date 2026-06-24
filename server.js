const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

// ── AI 配置（通过 Railway 环境变量注入）──
const AI_API_KEY    = process.env.AI_API_KEY    || '';
const AI_ENDPOINT   = process.env.AI_ENDPOINT   || 'https://api.deepseek.com/v1/chat/completions';
const AI_MODEL      = process.env.AI_MODEL      || 'deepseek-chat';
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '60000', 10);

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

// ── /api/analyze — AI 大模型分析代理端点 ──
async function handleAnalyze(req, res) {
  // 设置 CORS（允许前端跨域调用）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 检查后端是否配置了 API Key
  if (!AI_API_KEY) {
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

  try {
    const parsedUrl = new URL(AI_ENDPOINT);
    const aiOptions = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: AI_TIMEOUT_MS
    };

    const postData = JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: '你是世界顶级足球分析师，精通FIFA世界杯赛事分析。请基于提供的数据给出专业、准确的分析和比分预测。回答使用中文。' },
        { role: 'user', content: promptText }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log(`[AI Proxy] 调用 ${AI_MODEL} @ ${AI_ENDPOINT}, prompt length: ${promptText.length}`);

    const aiResult = await httpRequest(aiOptions, postData);

    if (aiResult.status !== 200) {
      console.error(`[AI Proxy] AI 返回错误: ${aiResult.status}`, aiResult.body.substring(0, 300));
      let errMsg = '大模型返回错误';
      try {
        const errJson = JSON.parse(aiResult.body);
        errMsg = errJson.error?.message || errJson.message || `HTTP ${aiResult.status}`;
      } catch(e) {}
      
      // 判断是否是拒绝服务
      if (aiResult.status === 429) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
          ok: false,
          error: 'RATE_LIMITED',
          message: '⚠️ 大模型当前负载过高，暂时无法响应，请稍后再试或切换到「复制提示词模式」'
        }));
      }

      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        ok: false,
        error: 'AI_ERROR',
        message: `❌ 大模型分析失败（${errMsg}），请稍后再试或使用「复制提示词模式」手动分析`
      }));
    }

    const aiData = JSON.parse(aiResult.body);
    const content = aiData.choices?.[0]?.message?.content || '';

    if (!content) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        ok: false,
        error: 'EMPTY_RESPONSE',
        message: '⚠️ 大模型返回了空结果，请稍后再试'
      }));
    }

    console.log('[AI Proxy] 分析成功, 内容长度:', content.length);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, content: content, model: AI_MODEL }));

  } catch(err) {
    console.error('[AI Proxy] 代理调用失败:', err.message);
    
    let userMessage = '⚠️ 大模型服务暂时不可用，请稍后再试';
    if (err.message.includes('timeout') || err.message.includes('超时')) {
      userMessage = '⚠️ 大模型响应超时，可能当前负载较高，请稍后再试';
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      userMessage = '⚠️ 无法连接到大模型服务器（离线），请稍后再试';
    }

    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      ok: false,
      error: 'SERVICE_UNAVAILABLE',
      message: userMessage + '，或使用「复制提示词模式」手动分析'
    }));
  }
}

// ── 主服务器 ──
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
  console.log(`   AI Endpoint: ${AI_ENDPOINT}`);
  console.log(`   AI Model: ${AI_MODEL}`);
  console.log(`   API Key configured: ${!!AI_API_KEY}`);
});
