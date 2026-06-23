// ============================================
// deepseek.js — AI 分析提示词生成器 v4
// 不再调用任何外部 API，改为：
// 1. 根据比赛数据自动生成专业分析 Prompt
// 2. 提供一键跳转主流对话AI平台的快捷入口
// 3. 用户自行复制 Prompt 到 AI 平台获取分析
// 4. 保留本地统计分析引擎作为参考
// 保留 DeepSeekEngine 对象名以兼容 app.js
// ============================================

const DeepSeekEngine = {

  apiKey: '',
  model: 'prompt-generator',
  baseUrl: '',

  // 兼容旧代码
  setApiKey(key) { },
  loadApiKey() { this.apiKey = 'prompt-mode'; return this.apiKey; },
  isConfigured() { return true; },

  // ── 主流对话AI平台列表 ──
  getAIPlatforms() {
    return [
      { id: 'chatgpt',  name: 'ChatGPT',     icon: '🟢', url: 'https://chat.openai.com/',                    color: '#10a37f' },
      { id: 'claude',   name: 'Claude',      icon: '🟣', url: 'https://claude.ai/new-chat',                 color: '#7c3aed' },
      { id: 'deepseek', name: 'DeepSeek',    icon: '🔵', url: 'https://chat.deepseek.com/',                  color: '#4f8df7' },
      { id: 'kimi',     name: 'Kimi',        icon: '🟠', url: 'https://kimi.moonshot.cn/',                   color: '#ff6b35' },
      { id: 'gemini',   name: 'Gemini',      icon: '💎', url: 'https://gemini.google.com/app',               color: '#4285f4' },
      { id: 'qwen',     name: '通义千问',     icon: '🟡', url: 'https://tongyi.aliyun.com/qianwen/',          color: '#615ced' },
      { id: 'wenxin',   name: '文心一言',     icon: '🔴', url: 'https://yiyan.baidu.com/',                    color: '#2932e1' },
      { id: 'doubao',   name: '豆包',         icon: '🟤', url: 'https://www.doubao.com/chat/',                color: '#3d5afe' },
    ];
  },

  // ── 生成简短搜索关键词（供快速搜索用）──
  buildKeywords(homeTeam, awayTeam, predResult, homeZh, awayZh) {
    const r = predResult;
    const hs = r.homeStats || {};
    const as = r.awayStats || {};
    const comp = r.components || {};
    const h2h = comp.h2h || {};
    const ad = comp.attackDefense || {};

    const homeRank = r.homeRank ? r.homeRank.rank : '?';
    const awayRank = r.awayRank ? r.awayRank.rank : '?';

    return [
      `${homeZh} vs ${awayZh} 2026世界杯`,
      `${homeTeam} vs ${awayTeam} World Cup 2026 prediction`,
      `${homeZh} FIFA排名${homeRank} ${awayZh} FIFA排名${awayRank}`,
      `${homeZh} ${hs.style || ''} 战术分析`,
      `${awayZh} ${as.style || ''} 阵容实力`,
      `${homeZh} ${hs.starPlayer || '核心球员'} 状态`,
      `${awayZh} ${as.starPlayer || '核心球员'} 表现`,
      h2h.p > 0 ? `${homeZh} ${awayZh} 历史交锋记录` : `${homeZh} ${awayZh} 首次世界杯交锋`,
      `${homeZh} 进攻${(ad.homeAttack||7).toFixed(1)} 防守${(ad.homeDefense||7).toFixed(1)}`,
      `${awayZh} 进攻${(ad.awayAttack||7).toFixed(1)} 防守${(ad.awayDefense||7).toFixed(1)}`,
      `2026世界杯 ${homeZh}小组出线概率`,
      `${homeZh} vs ${awayZh} 比分预测 赔率分析`,
    ].filter(k => k && !k.includes('  '));
  },

  // ── 生成完整的专业分析 Prompt ──
  buildPrompt(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence) {
    const r = predResult;
    const hR = r.homeRank ? `FIFA排名第${r.homeRank.rank}位(${r.homeRank.pts}分)` : '排名未知';
    const aR = r.awayRank ? `FIFA排名第${r.awayRank.rank}位(${r.awayRank.pts}分)` : '排名未知';
    const hs = r.homeStats || {};
    const as = r.awayStats || {};
    const comp = r.components || {};
    const h2h = comp.h2h || { p: 0, homeWin: 0, draw: 0, awayWin: 0 };
    const form = comp.form || { homeForm: 0, awayForm: 0 };
    const ad = comp.attackDefense || { homeAttack: 7, homeDefense: 7, awayAttack: 7, awayDefense: 7 };
    const mom = comp.momentum || { homePlayed: 0, awayPlayed: 0, homeMomentum: 0, awayMomentum: 0 };
    const inj = comp.injury || { homeAvail: 1.0, awayAvail: 1.0, detail: '暂无伤停情报' };

    const primaryScore = r.primaryScore || { home: 1, away: 0 };
    const homeWinPct = Math.round((r.homeWinProb || 0.5) * 100);
    const drawPct    = Math.round((r.drawProb    || 0.25) * 100);
    const awayWinPct = Math.round((r.awayWinProb || 0.25) * 100);

    let h2hText = h2h.p > 0
      ? `历史世界杯正赛交锋${h2h.p}场：${homeZh}胜${h2h.homeWin}场，平${h2h.draw}场，负${h2h.awayWin}场。`
      : `两队历史上从未在世界杯正赛中相遇。`;

    let momentumText = (mom.homePlayed > 0 || mom.awayPlayed > 0)
      ? `本届世界杯：${homeZh}已赛${mom.homePlayed}场；${awayZh}已赛${mom.awayPlayed}场。`
      : `本届世界杯两队均尚未出场。`;

    // ── 伤停情报段落 ──
    let injurySection = '';
    if (intelligence) {
      const hi = intelligence.home || {};
      const ai = intelligence.away || {};
      const homeInjList = (hi.injuries || []).map(i => `${i.name||i}(${i.type||'伤'} ${i.status||''})`).join('、');
      const awayInjList = (ai.injuries || []).map(i => `${i.name||i}(${i.type||'伤'} ${i.status||''})`).join('、');
      const homeNewsText = (hi.news || []).join('；');
      const awayNewsText = (ai.news || []).join('；');
      const keyFactors = (intelligence.keyFactors || []).join('；');

      injurySection = `
## 伤停/阵容情报（最高权重因素）
- ${homeZh}阵容完整度：${((hi.availability||1.0)*100).toFixed(0)}%
- ${awayZh}阵容完整度：${((ai.availability||1.0)*100).toFixed(0)}%
- ${homeZh}伤停：${homeInjList || '暂无'}
- ${awayZh}伤停：${awayInjList || '暂无'}
- ${homeZh}最新消息：${homeNewsText || '暂无'}
- ${awayZh}最新消息：${awayNewsText || '暂无'}
- 关键影响因素：${keyFactors || '暂无特殊因素'}
${inj.detail ? `- 模型评估：${inj.detail}` : ''}`;
    } else {
      injurySection = `
## 伤停/阵容情报
- 暂无实时伤停情报，基于基础数据分析`;
    }

    // ── 调整后评分说明 ──
    let adjNote = '';
    if (hs._injuryAdj) {
      adjNote = `\n注意：以下攻防评分已根据伤停情报调整（原始：进攻${hs._originalAttack?.toFixed(1)} / 防守${hs._originalDefense?.toFixed(1)} → 调整后：进攻${hs.attack?.toFixed(1)} / 防守${hs.defense?.toFixed(1)}）`;
    }
    if (as._injuryAdj) {
      adjNote += `\n注意：${awayZh}攻防评分已根据伤停情报调整（原始：进攻${as._originalAttack?.toFixed(1)} / 防守${as._originalDefense?.toFixed(1)} → 调整后：进攻${as.attack?.toFixed(1)} / 防守${as.defense?.toFixed(1)}）`;
    }

    const langInstruction = (typeof I18n !== 'undefined') ? I18n.getPromptLangInstruction() : '请用中文回答。';

    const prompt = `${langInstruction}

你是一位世界顶级足球分析师，请基于以下详细数据对2026年FIFA世界杯比赛进行专业分析和比分预测。${adjNote}

## 对阵信息
- 主队：${homeZh}（${homeTeam}）—— ${hR}
- 客队：${awayZh}（${awayTeam}）—— ${aR}

## 球队指标
| 维度 | ${homeZh} | ${awayZh} |
|------|---------|---------|
| 进攻指数(10分制) | ${(ad.homeAttack||7).toFixed(1)} | ${(ad.awayAttack||7).toFixed(1)} |
| 防守指数(10分制) | ${(ad.homeDefense||7).toFixed(1)} | ${(ad.awayDefense||7).toFixed(1)} |
| 近期5场状态得分 | ${form.homeForm||0}/15 | ${form.awayForm||0}/15 |
| 历史世界杯均进球 | ${(hs.avgGoalsScored||1.2).toFixed(2)} | ${(as.avgGoalsScored||1.2).toFixed(2)} |
| 历史世界杯均失球 | ${(hs.avgGoalsConceded||1.0).toFixed(2)} | ${(as.avgGoalsConceded||1.0).toFixed(2)} |
| 世界杯冠军次数 | ${hs.worldcupWins||0} | ${as.worldcupWins||0} |
| 踢球风格 | ${hs.style||'未知'} | ${as.style||'未知'} |
| 核心球员 | ${hs.starPlayer||'待定'} | ${as.starPlayer||'待定'} |
| 阵容完整度 | ${((inj.homeAvail||1.0)*100).toFixed(0)}% | ${((inj.awayAvail||1.0)*100).toFixed(0)}% |

## 历史对战
${h2hText}

## 本届赛事状态
${momentumText}

## 近期5场状态
- ${homeZh}：${(hs.recentForm||[]).join(' ') || '数据待更新'}
- ${awayZh}：${(as.recentForm||[]).join(' ') || '数据待更新'}
${injurySection}

## 统计模型预测结果（供参考）
- 主队胜率：${homeWinPct}%
- 平局概率：${drawPct}%
- 客队胜率：${awayWinPct}%
- 统计预测最可能比分：${primaryScore.home} - ${primaryScore.away}

---
请从以下几个维度进行深度分析并给出你的预测（请简洁，控制在500字内）：

1. **总体形势判断**（约60字）：从FIFA排名、历史战绩、整体实力角度评价两队
2. **伤停/阵容影响**（约100字）：最重要的因素！分析伤停对双方的实质影响，特别是核心球员缺席如何改变比赛走势
3. **关键因素分析**（约80字）：影响本场比赛结果的2-3个最关键因素
4. **技战术层面**（约60字）：双方战术风格碰撞分析
5. **比分预测**：给出你认为最可能的比分（格式：X:Y）以及你预测主队胜/平/客队胜
6. **置信度说明**（约40字）：你对预测的把握程度及主要不确定因素

回答请使用专业简洁的语言，像真正的足球评论员风格。伤停分析必须放在最突出的位置！`;

    return prompt;
  },

  // ── analyze 不再调用 API，直接返回 prompt ──
  async analyze(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence) {
    try {
      const prompt = this.buildPrompt(homeTeam, awayTeam, predResult, homeZh, awayZh, intelligence);
      return {
        error: false,
        content: prompt,
        isPrompt: true,
        model: 'prompt-generator'
      };
    } catch(e) {
      return { error: true, message: `Prompt 构建失败: ${e.message}` };
    }
  },

  // ── 本地统计分析（作为参考展示）──
  generateLocalAnalysis(homeTeam, awayTeam, predResult, homeZh, awayZh) {
    const r = predResult;
    const hs = r.homeStats || {};
    const as = r.awayStats || {};
    const comp = r.components || {};
    const h2h = comp.h2h || { p: 0, homeWin: 0, draw: 0, awayWin: 0 };
    const ad = comp.attackDefense || { homeAttack: 7, homeDefense: 7, awayAttack: 7, awayDefense: 7 };
    const mom = comp.momentum || { homePlayed: 0, awayPlayed: 0 };
    const homeRank = r.homeRank;
    const awayRank = r.awayRank;

    const hWinPct = Math.round((r.homeWinProb || 0.5) * 100);
    const aWinPct = Math.round((r.awayWinProb || 0.25) * 100);
    const dPct = Math.round((r.drawProb || 0.25) * 100);
    const ps = r.primaryScore || { home: 1, away: 0 };
    const ss = r.secondaryScore || { home: 1, away: 1 };

    const rankGap = (homeRank && awayRank) ? homeRank.rank - awayRank.rank : 0;

    let overallJudge = '';
    if (Math.abs(rankGap) <= 5) {
      overallJudge = `${homeZh}与${awayZh}实力相当，FIFA排名差距仅${Math.abs(rankGap)}位，预计将是一场势均力敌的激战。`;
    } else if (rankGap < 0) {
      overallJudge = `${homeZh}（FIFA第${homeRank?.rank}位）综合实力略强于${awayZh}（FIFA第${awayRank?.rank}位），主场优势可能是关键。`;
    } else {
      overallJudge = `${awayZh}（FIFA第${awayRank?.rank}位）在排名上占据优势，但${homeZh}主场作战具备情绪加成。`;
    }

    let h2hText = '';
    if (h2h.p > 0) {
      const hw = h2h.homeWin, aw = h2h.awayWin, d = h2h.draw;
      if (hw > aw + d) h2hText = `历史交锋${h2h.p}次，${homeZh}占据上风（${hw}胜${d}平${aw}负），心理优势明显。`;
      else if (aw > hw + d) h2hText = `历史交锋${h2h.p}次，${awayZh}占据上风（${aw}胜${d}平${hw}负），历史不利于主队。`;
      else h2hText = `历史交锋${h2h.p}次战绩均衡（${hw}胜${d}平${aw}负），双方势均力敌。`;
    } else {
      h2hText = `两队在世界杯正赛历史上从未交手，缺乏直接对话参考。`;
    }

    const attackGap = (ad.homeAttack - ad.awayAttack).toFixed(1);
    const defGap = (ad.homeDefense - ad.awayDefense).toFixed(1);

    let keyFactors = `进攻端：${homeZh}（${ad.homeAttack?.toFixed(1)}/10）${parseFloat(attackGap) > 0 ? '领先' : '落后'}${awayZh}（${ad.awayAttack?.toFixed(1)}/10）${Math.abs(parseFloat(attackGap)).toFixed(1)}分；
防守端：${homeZh}（${ad.homeDefense?.toFixed(1)}/10）vs ${awayZh}（${ad.awayDefense?.toFixed(1)}/10），${parseFloat(defGap) > 0 ? homeZh + '防守更稳固' : awayZh + '防守更成熟'}。
核心球员方面，${homeZh}倚仗 ${hs.starPlayer || '核心球员'}，${awayZh}则依靠 ${as.starPlayer || '核心球员'} 创造机会。`;

    let tactics = `${homeZh}惯用「${hs.style || '技术流'}」打法，${awayZh}则以「${as.style || '整体战术'}」应对。
双方战术体系的碰撞将是本场关键，谁能在中场控制节奏谁将掌握主动权。`;

    let confidence = '';
    const maxProb = Math.max(hWinPct, aWinPct);
    if (maxProb >= 70) {
      confidence = `预测置信度较高（${maxProb}%），数据优势明确，冷门概率较低。`;
    } else if (maxProb >= 55) {
      confidence = `预测置信度中等（${maxProb}%），双方实力接近，任一结果均有合理概率。`;
    } else {
      confidence = `预测置信度偏低，两队实力非常接近，平局及任一队伍获胜均有可能，存在较大不确定性。`;
    }

    const resultText = hWinPct >= aWinPct
      ? `主队${homeZh}胜（概率${hWinPct}%）`
      : `客队${awayZh}胜（概率${aWinPct}%）`;

    const content = `**1. 总体形势判断**

${overallJudge}

**2. 关键因素分析**

${h2hText}

${keyFactors}

**3. 技战术层面**

${tactics}

**4. 比分预测**

综合五维度模型分析，预测结果：**${resultText}**，平局概率${dPct}%。

首选比分：**${ps.home}:${ps.away}**（概率${ps.pct}%）
次选比分：${ss.home}:${ss.away}（概率${ss.pct}%）

**5. 置信度说明**

${confidence}本预测基于统计模型生成，实际比赛受临场状态、裁判因素等影响，仅供参考。`;

    return {
      error: false,
      content,
      tokens: 0,
      model: '本地统计分析引擎',
      isLocal: true
    };
  },

  // ── Format AI response to HTML ──
  formatResponse(content) {
    let html = content
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8f5ee">$1</strong>')
      .replace(/^#{1,3}\s+(.+)$/gm, '<div class="ds-section-title">$1</div>')
      .replace(/^(\d+)\.\s+/gm, '<span style="color:#dc2626;font-weight:800">$1.</span> ')
      .replace(/\n\n/g, '</p><p class="ds-para">')
      .replace(/\n/g, '<br>');
    return `<p class="ds-para">${html}</p>`;
  }
};

// Auto-init on script load
document.addEventListener('DOMContentLoaded', () => {
  DeepSeekEngine.loadApiKey();
});
