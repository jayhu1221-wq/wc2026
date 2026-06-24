// ============================================
// mimo.js — AI 分析提示词生成器（简版）v4
// 不再调用任何外部 API
// 生成更简短的关键词导向 Prompt，与 ai-engine.js 互补
// 保留 MimoEngine 对象名以兼容 app.js
// ============================================

const MimoEngine = {

  apiKey: '',
  model: 'prompt-generator-lite',
  baseUrl: '',

  setApiKey(key) { },
  loadApiKey() { this.apiKey = 'prompt-mode'; return this.apiKey; },
  isConfigured() { return true; },

  // ── 生成简短版 Prompt（关键词导向）──
  buildPrompt(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence) {
    const r = predResult;
    const hs = r.homeStats || {};
    const as = r.awayStats || {};
    const comp = r.components || {};
    const h2h = comp.h2h || {};
    const ad = comp.attackDefense || {};
    const homeRank = r.homeRank ? r.homeRank.rank : '?';
    const awayRank = r.awayRank ? r.awayRank.rank : '?';

    const homeWinPct = Math.round((r.homeWinProb || 0.5) * 100);
    const awayWinPct = Math.round((r.awayWinProb || 0.25) * 100);
    const drawPct = Math.round((r.drawProb || 0.25) * 100);

    const langInstruction = (typeof I18n !== 'undefined') ? I18n.getPromptLangInstruction() : '请用中文回答。';

    const h2hText = h2h.p > 0
      ? `历史交锋${h2h.p}次（${homeZh}${h2h.homeWin}胜${h2h.draw}平${h2h.awayWin}负）`
      : '无世界杯交锋记录';

    let injuryHint = '';
    if (intelligence && intelligence.home && intelligence.away) {
      const hAvail = ((intelligence.home.availability||1.0)*100).toFixed(0);
      const aAvail = ((intelligence.away.availability||1.0)*100).toFixed(0);
      if (hAvail !== '100' || aAvail !== '100') {
        injuryHint = `\n伤停：${homeZh}阵容完整度${hAvail}%，${awayZh}阵容完整度${aAvail}%`;
      }
    }

    return `${langInstruction}

作为资深足球分析师，请预测2026世界杯：${homeZh} vs ${awayZh}

关键数据：
- FIFA排名：${homeZh}第${homeRank}位 / ${awayZh}第${awayRank}位
- 攻防指数：${homeZh}攻${(ad.homeAttack||7).toFixed(1)}防${(ad.homeDefense||7).toFixed(1)} / ${awayZh}攻${(ad.awayAttack||7).toFixed(1)}防${(ad.awayDefense||7).toFixed(1)}
- ${h2hText}
- 统计预测胜率：主胜${homeWinPct}% 平${drawPct}% 客胜${awayWinPct}%
- 核心球员：${homeZh} ${hs.starPlayer||'待定'} / ${awayZh} ${as.starPlayer||'待定'}
- 风格：${hs.style||'未知'} vs ${as.style||'未知'}${injuryHint}

请给出：1) 胜负判断 2) 预测比分 3) 2-3个关键分析点 4) 置信度（高/中/低）
回答控制在200字内，直接给结论。`;
  },

  // ── analyze 直接返回 prompt ──
  async analyze(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence) {
    try {
      const prompt = this.buildPrompt(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence);
      return {
        error: false,
        content: prompt,
        isPrompt: true,
        model: 'prompt-generator-lite'
      };
    } catch(e) {
      return { error: true, message: `Prompt 构建失败: ${e.message}` };
    }
  },

  // ── 格式化响应 ──
  formatResponse(content) {
    if (typeof AIEngine !== 'undefined' && AIEngine.formatResponse) {
      return AIEngine.formatResponse(content);
    }
    return content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }
};

// Auto-init on script load
document.addEventListener('DOMContentLoaded', () => {
  MimoEngine.loadApiKey();
});
