// ============================================
// mimo.js — 小米 MiMo-V2.5-Pro AI 分析引擎 v2
// 改为通过服务器代理调用，API 密钥仅在服务端
// 与 Claude Opus 4.7 双模型对比分析
// ============================================

const MimoEngine = {

  // 密钥已移至服务端
  apiKey: '',
  model: 'mimo-v2.5-pro',
  baseUrl: '/api/ai-analysis',  // 服务器代理端点

  setApiKey(key) {
    // No-op: 密钥在服务端
  },

  loadApiKey() {
    this.apiKey = 'server-proxy';
    return this.apiKey;
  },

  isConfigured() {
    // 始终 true：服务器代理处理密钥
    return true;
  },

  // ── 复用 DeepSeek 的 prompt 构建逻辑 ──
  buildPrompt(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence) {
    if (typeof DeepSeekEngine !== 'undefined' && DeepSeekEngine.buildPrompt) {
      return DeepSeekEngine.buildPrompt(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence);
    }
    return `请分析2026年FIFA世界杯比赛：${homeZh} vs ${awayZh}，给出专业比分预测（500字内）。`;
  },

  // ── 带超时的 fetch ──
  async fetchWithTimeout(url, options, timeoutMs = 30000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }
      throw err;
    }
  },

  // ── 调用 MiMo 分析（通过服务器代理）──
  async analyze(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence) {
    let prompt;
    try {
      prompt = this.buildPrompt(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence);
    } catch(e) {
      return { error: true, message: `Prompt 构建失败: ${e.message}` };
    }

    const systemPrompt = (typeof t !== 'undefined') ? t('ai.system.mimo') : '你是一位世界顶级足球分析师，精通数据分析和战术解读，拥有20年世界杯报道经验。请基于数据做出客观、专业且简洁的分析，控制在400字内。你是独立的AI分析师，请给出你自己的独立判断。';
    const payload = {
      model: 'mimo',
      system: systemPrompt,
      user: prompt,
      max_tokens: 2000,
      temperature: 0.7,
    };

    try {
      const response = await this.fetchWithTimeout(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 30000);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || errData.message || `HTTP ${response.status}`;
        if (response.status === 402 || errMsg.includes('balance') || errMsg.includes('quota')) {
          return { error: true, message: 'MiMo API 余额不足', fallback: true };
        }
        return { error: true, message: `MiMo API 错误: ${errMsg}`, fallback: true };
      }

      const data = await response.json();

      if (data.error && data.fallback) {
        return { error: true, message: data.message || 'MiMo 服务不可用', fallback: true };
      }

      const content = data.content;

      if (!content) {
        return { error: true, message: 'MiMo 返回内容为空', fallback: true };
      }

      return {
        error: false,
        content,
        tokens: data.tokens || 0,
        model: data.model || 'mimo-v2.5-pro'
      };

    } catch (err) {
      if (err.message === 'TIMEOUT') {
        return { error: true, message: 'MiMo 请求超时（30秒）', fallback: true };
      }
      return { error: true, message: '服务器代理不可用，已切换到本地分析模式', fallback: true };
    }
  },

  // ── 格式化响应 ──
  formatResponse(content) {
    if (typeof DeepSeekEngine !== 'undefined' && DeepSeekEngine.formatResponse) {
      return DeepSeekEngine.formatResponse(content);
    }
    return content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }
};

// Auto-init on script load
document.addEventListener('DOMContentLoaded', () => {
  MimoEngine.loadApiKey();
});
