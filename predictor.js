// ============================================
// predictor.js — AI Score Prediction Engine v2
// 支持三重比分预测 + 详细推理理由
// ============================================

const Predictor = {

  // ── Main prediction function ──
  predict(homeTeam, awayTeam, stage, intelligence) {
    const homeStats = WC2026_DATA.teamStats[homeTeam];
    const awayStats = WC2026_DATA.teamStats[awayTeam];
    const homeRank = WC2026_DATA.fifaRankings[homeTeam];
    const awayRank = WC2026_DATA.fifaRankings[awayTeam];

    if (!homeStats || !awayStats) {
      return {
        error: true,
        message: `缺少 "${homeTeam}" 或 "${awayTeam}" 的数据`,
        homeTeam, awayTeam
      };
    }

    // ── 0. 伤停/阵容调整（第6维度）──
    let adjustedHomeStats = homeStats;
    let adjustedAwayStats = awayStats;
    let injuryResult = { advantage: 0, homeAvail: 1.0, awayAvail: 1.0, detail: '暂无伤停情报', homeInjuries: [], awayInjuries: [], keyFactors: [] };

    if (intelligence && typeof LiveData !== 'undefined') {
      adjustedHomeStats = LiveData.adjustStatsForInjuries(homeTeam, homeStats, intelligence);
      adjustedAwayStats = LiveData.adjustStatsForInjuries(awayTeam, awayStats, intelligence);
      injuryResult = this.calcInjuryScore(homeTeam, awayTeam, adjustedHomeStats, adjustedAwayStats, intelligence);
    }

    // ── 1. FIFA Ranking Score (20% weight) ──
    const rankingDiff = this.calcRankingScore(homeRank, awayRank);

    // ── 2. Historical H2H Score (20% weight) ──
    const h2hResult = this.calcH2HScore(homeTeam, awayTeam);

    // ── 3. Recent Form Score (15% weight) ──
    const formResult = this.calcFormScore(adjustedHomeStats, adjustedAwayStats);

    // ── 4. Attack & Defense Score (15% weight) ──
    const adResult = this.calcAttackDefenseScore(adjustedHomeStats, adjustedAwayStats);

    // ── 5. Tournament Momentum (15% weight) ──
    const momentumResult = this.calcMomentumScore(homeTeam, awayTeam);

    // ── 6. Squad Availability (15% weight) ──
    // Weights adjusted: ranking 0.20, h2h 0.20, form 0.15, attack 0.15, momentum 0.15, injury 0.15
    const weights = { ranking: 0.20, h2h: 0.20, form: 0.15, attack: 0.15, momentum: 0.15, injury: 0.15 };

    const rawScore = (
      rankingDiff.advantage * weights.ranking +
      h2hResult.advantage * weights.h2h +
      formResult.advantage * weights.form +
      adResult.advantage * weights.attack +
      momentumResult.advantage * weights.momentum +
      injuryResult.advantage * weights.injury
    );

    // Convert to probabilities
    const homeWinProb = Math.min(0.95, Math.max(0.05, 0.5 + rawScore));
    const awayWinProb = Math.min(0.95, Math.max(0.05, 0.5 - rawScore));
    const totalProb = homeWinProb + awayWinProb;
    const normalizedHome = homeWinProb / totalProb;
    const normalizedAway = awayWinProb / totalProb;

    const drawBias = 0.25;
    const hProb = normalizedHome * (1 - drawBias);
    const dProb = drawBias;
    const aProb = normalizedAway * (1 - drawBias);

    // ── 三重比分预测（首选/次选/防冷）──
    const { primary, secondary, defensive, distribution, expectedGoals } = this.simulateMatch(
      adjustedHomeStats, adjustedAwayStats, rawScore, stage
    );

    // ── 预测理由 ──
    const reasoning = this.generateReasoning(
      homeTeam, awayTeam, adjustedHomeStats, adjustedAwayStats, homeRank, awayRank,
      rankingDiff, h2hResult, formResult, adResult, momentumResult, injuryResult,
      rawScore, hProb, dProb, aProb, primary
    );

    return {
      homeTeam,
      awayTeam,
      homeWinProb: hProb,
      drawProb: dProb,
      awayWinProb: aProb,
      primaryScore: primary,      // 首选比分
      secondaryScore: secondary,  // 次选比分
      defensiveScore: defensive,  // 防冷比分（高赔）
      distribution,
      expectedGoals,
      components: {
        ranking: rankingDiff,
        h2h: h2hResult,
        form: formResult,
        attackDefense: adResult,
        momentum: momentumResult,
        injury: injuryResult
      },
      homeStats: adjustedHomeStats,
      awayStats: adjustedAwayStats,
      homeRank,
      awayRank,
      reasoning
    };
  },

  // ── 1. FIFA Ranking Score ──
  calcRankingScore(homeRank, awayRank) {
    if (!homeRank || !awayRank) return { advantage: 0, diff: 0, detail: "排名数据缺失" };

    const diff = awayRank.rank - homeRank.rank;
    const ptsDiff = homeRank.pts - awayRank.pts;
    const advantage = Math.tanh(diff * 0.02 + ptsDiff * 0.0008);

    return {
      advantage,
      diff,
      ptsDiff,
      detail: `主队排名 #${homeRank.rank} (${homeRank.pts}pts) vs 客队排名 #${awayRank.rank} (${awayRank.pts}pts)`
    };
  },

  // ── 2. H2H Score ──
  calcH2HScore(home, away) {
    const key1 = `${home}|${away}`;
    const key2 = `${away}|${home}`;
    const data = WC2026_DATA.h2h[key1] || WC2026_DATA.h2h[key2];

    if (!data) {
      return {
        advantage: 0,
        detail: "两队历史交锋数据不足（未在世界杯正赛相遇）",
        p: 0, homeWin: 0, awayWin: 0, draw: 0
      };
    }

    const h2h = WC2026_DATA.h2h[key1]
      ? data
      : { p: data.p, aw: data.lw, d: data.d, lw: data.aw };

    const homeWinRate = h2h.p > 0 ? h2h.aw / h2h.p : 0;
    const awayWinRate = h2h.p > 0 ? h2h.lw / h2h.p : 0;
    const advantage = (homeWinRate - awayWinRate) * 0.8;

    return {
      advantage: Math.tanh(advantage * 2),
      detail: `历史 ${h2h.p} 场交锋：主队 ${h2h.aw} 胜 ${h2h.d} 平 ${h2h.lw} 负`,
      p: h2h.p, homeWin: h2h.aw, awayWin: h2h.lw, draw: h2h.d
    };
  },

  // ── 3. Recent Form Score ──
  calcFormScore(homeStats, awayStats) {
    const homeForm = this.formToPoints(homeStats.recentForm || []);
    const awayForm = this.formToPoints(awayStats.recentForm || []);
    const diff = homeForm - awayForm;
    const advantage = Math.tanh(diff * 0.3);

    return {
      advantage,
      homeForm,
      awayForm,
      homeFormStr: (homeStats.recentForm || []).join(' '),
      awayFormStr: (awayStats.recentForm || []).join(' '),
      detail: `近期 5 场：主队 ${(homeStats.recentForm||[]).join(' ')} (${homeForm}分) vs 客队 ${(awayStats.recentForm||[]).join(' ')} (${awayForm}分)`
    };
  },

  formToPoints(form) {
    let pts = 0;
    for (const r of form) {
      if (r === 'W') pts += 3;
      else if (r === 'D') pts += 1;
    }
    return pts;
  },

  // ── 4. Attack & Defense Score ──
  calcAttackDefenseScore(homeStats, awayStats) {
    const homePower = homeStats.attack * 1.2 - awayStats.defense;
    const awayPower = awayStats.attack * 1.2 - homeStats.defense;
    const netAdvantage = homePower - awayPower;
    const advantage = Math.tanh(netAdvantage * 0.3);

    return {
      advantage,
      homeAttack: homeStats.attack,
      homeDefense: homeStats.defense,
      awayAttack: awayStats.attack,
      awayDefense: awayStats.defense,
      detail: `主队 进攻${homeStats.attack.toFixed(1)}/防守${homeStats.defense.toFixed(1)}`
    };
  },

  // ── 5. Tournament Momentum ──
  calcMomentumScore(homeTeam, awayTeam) {
    let homeMomentum = 0;
    let awayMomentum = 0;
    let homePlayed = 0, awayPlayed = 0;

    for (const r of WC2026_DATA.completedResults) {
      if (r.home === homeTeam || r.away === homeTeam) {
        homePlayed++;
        if (r.home === homeTeam) {
          if (r.hg > r.ag) homeMomentum += 3;
          else if (r.hg === r.ag) homeMomentum += 1;
        } else {
          if (r.ag > r.hg) homeMomentum += 3;
          else if (r.ag === r.hg) homeMomentum += 1;
        }
      }
      if (r.home === awayTeam || r.away === awayTeam) {
        awayPlayed++;
        if (r.home === awayTeam) {
          if (r.hg > r.ag) awayMomentum += 3;
          else if (r.hg === r.ag) awayMomentum += 1;
        } else {
          if (r.ag > r.hg) awayMomentum += 3;
          else if (r.ag === r.hg) awayMomentum += 1;
        }
      }
    }

    const homeAvg = homePlayed > 0 ? homeMomentum / homePlayed : 0;
    const awayAvg = awayPlayed > 0 ? awayMomentum / awayPlayed : 0;
    const advantage = homePlayed > 0 || awayPlayed > 0
      ? Math.tanh((homeAvg - awayAvg) * 0.5)
      : 0;

    let detail = "暂无本届世界杯比赛记录";
    if (homePlayed > 0 || awayPlayed > 0) {
      detail = `主队已赛 ${homePlayed} 场得 ${homeMomentum} 分 · 客队已赛 ${awayPlayed} 场得 ${awayMomentum} 分`;
    }

    return {
      advantage,
      homeMomentum: homeAvg,
      awayMomentum: awayAvg,
      homePlayed,
      awayPlayed,
      detail
    };
  },

  // ── 6. Squad Availability Score (伤停/阵容完整度) ──
  calcInjuryScore(homeTeam, awayTeam, adjHomeStats, adjAwayStats, intelligence) {
    const homeIntel = intelligence.home?.team === homeTeam ? intelligence.home : intelligence.away;
    const awayIntel = intelligence.away?.team === awayTeam ? intelligence.away : intelligence.home;

    const homeAvail = homeIntel?.availability ?? 1.0;
    const awayAvail = awayIntel?.availability ?? 1.0;

    // 阵容完整度差异 → 优势值
    const availDiff = homeAvail - awayAvail;
    const advantage = Math.tanh(availDiff * 2.0);

    // 生成详情
    let detail = '';
    const homeInjuries = homeIntel?.injuries || [];
    const awayInjuries = awayIntel?.injuries || [];
    const homeNews = homeIntel?.news || [];
    const awayNews = awayIntel?.news || [];

    if (homeInjuries.length === 0 && awayInjuries.length === 0 && homeNews.length === 0 && awayNews.length === 0) {
      detail = '暂无伤停情报，双方预计阵容齐整';
    } else {
      const parts = [];
      if (homeInjuries.length > 0) {
        const names = homeInjuries.map(i => i.name || i).join('、');
        parts.push(`主队伤停：${names}`);
      }
      if (awayInjuries.length > 0) {
        const names = awayInjuries.map(i => i.name || i).join('、');
        parts.push(`客队伤停：${names}`);
      }
      if (homeAvail < 0.85) parts.push(`主队阵容完整度${(homeAvail * 100).toFixed(0)}%`);
      if (awayAvail < 0.85) parts.push(`客队阵容完整度${(awayAvail * 100).toFixed(0)}%`);

      // AI情报中的关键缺席
      const hka = intelligence.home?.keyAbsent || '';
      const aka = intelligence.away?.keyAbsent || '';
      if (hka && hka !== '无') parts.push(`主队关键缺席：${hka}`);
      if (aka && aka !== '无') parts.push(`客队关键缺席：${aka}`);

      detail = parts.join('；') || '阵容齐整';
    }

    // 关键因素
    const keyFactors = intelligence.keyFactors || [];

    return {
      advantage,
      homeAvail,
      awayAvail,
      homeInjuries,
      awayInjuries,
      homeNews,
      awayNews,
      keyFactors,
      detail
    };
  },

  // ── Monte Carlo Simulation — 返回三重比分 ──
  simulateMatch(homeStats, awayStats, advantage, stage) {
    const homeBase = 1.5 + advantage * 1.5;
    const awayBase = 1.5 - advantage * 1.5;

    const volatility = (stage === 'r32' || stage === 'r16' || stage === 'qf') ? 0.3
      : (stage === 'sf' || stage === 'final') ? 0.2 : 0.1;

    const dist = {};
    const SIMS = 5000;

    for (let i = 0; i < SIMS; i++) {
      const hg = Math.max(0, Math.round(this.poissonRandom(homeBase + volatility)));
      const ag = Math.max(0, Math.round(this.poissonRandom(awayBase + volatility)));
      const key = `${hg}-${ag}`;
      dist[key] = (dist[key] || 0) + 1;
    }

    // Sort by frequency
    const distribution = Object.entries(dist)
      .map(([score, count]) => ({ score, count, pct: ((count / SIMS) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    // ── 提取三重比分 ──
    // 首选：最高概率比分
    const primary = distribution[0] || { score: '1-1', pct: '25.0' };
    const [ph, pa] = primary.score.split('-').map(Number);

    // 次选：第二高概率且不同于首选
    const secondary = distribution[1] || { score: '1-0', pct: '15.0' };
    const [sh, sa] = secondary.score.split('-').map(Number);

    // 防守（防冷）：找一个赔率较高的低概率比分（前10之外或者特定的冷门）
    let defensive = distribution.slice(2).find(d => {
      const [dh, da] = d.score.split('-').map(Number);
      // 冷门条件：要么是爆冷结果，要么是小概率大比分
      if (advantage > 0.1 && dh < da) return true;  // 主队强但客队赢
      if (advantage < -0.1 && dh > da) return true; // 客队强但主队赢
      if (dh + da >= 4) return true; // 大比分
      return false;
    }) || distribution[Math.min(distribution.length - 1, 5)];
    const [dh, da] = (defensive || { score: '2-2' }).score.split('-').map(Number);

    return {
      primary: { home: ph, away: pa, pct: primary.pct },
      secondary: { home: sh, away: sa, pct: secondary.pct },
      defensive: { home: dh, away: da, pct: (defensive || {}).pct || '3.0' },
      distribution: distribution.slice(0, 8),
      expectedGoals: { home: homeBase.toFixed(1), away: awayBase.toFixed(1) }
    };
  },

  poissonRandom(lambda) {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return Math.max(0, k - 1);
  },

  // ── 生成详细预测理由 ──
  generateReasoning(homeTeam, awayTeam, hs, as, hr, ar, ranking, h2h, form, ad, momentum, injury, rawScore, hProb, dProb, aProb, primary) {
    const reasons = [];

    // 1. 综合实力评估
    const hPower = (hs.attack + hs.defense) / 2;
    const aPower = (as.attack + as.defense) / 2;
    const powerGap = hPower - aPower;

    if (powerGap > 1.0) {
      reasons.push(`✅ ${homeTeam} 综合实力明显优于 ${awayTeam}（进攻+防守评分差 ${powerGap.toFixed(1)} 分），预计占据场上主动。`);
    } else if (powerGap < -1.0) {
      reasons.push(`⚠️ ${awayTeam} 综合实力强于 ${homeTeam}（进攻+防守评分差 ${Math.abs(powerGap).toFixed(1)} 分），${homeTeam} 需要全力防守。`);
    } else {
      reasons.push(`⚖️ 两队综合实力旗鼓相当（评分差 ${Math.abs(powerGap).toFixed(1)} 分），比赛将非常胶着。`);
    }

    // 2. FIFA排名分析
    if (hr && ar) {
      const rDiff = ar.rank - hr.rank;
      if (rDiff > 15) {
        reasons.push(`📊 FIFA排名：${homeTeam}(#${hr.rank}) 远高于 ${awayTeam}(#${ar.rank})，排名差 ${rDiff} 位体现明显实力差距。`);
      } else if (rDiff > 5) {
        reasons.push(`📊 FIFA排名：${homeTeam}(#${hr.rank}) 领先 ${awayTeam}(#${ar.rank}) ${rDiff} 位，有轻微优势。`);
      } else if (rDiff < -15) {
        reasons.push(`📊 FIFA排名：${awayTeam}(#${ar.rank}) 排名高于 ${homeTeam}(#${hr.rank})，客队纸面实力更强。`);
      } else if (Math.abs(rDiff) <= 5) {
        reasons.push(`📊 FIFA排名：两队排名接近（#${hr.rank} vs #${ar.rank}），差距极小。`);
      }
    }

    // 3. 历史交手
    if (h2h.p > 0) {
      const hWinPct = Math.round((h2h.homeWin / h2h.p) * 100);
      if (hWinPct >= 60) {
        reasons.push(`📜 历史交锋：${homeTeam} 在 ${h2h.p} 次世界杯交手中获胜 ${h2h.homeWin} 场（${hWinPct}%），心理优势明显。`);
      } else if (hWinPct <= 33) {
        reasons.push(`📜 历史交锋：${h2h.p} 次交手中 ${homeTeam} 仅赢 ${h2h.homeWin} 场（${hWinPct}%），${awayTeam} 占优。`);
      } else {
        reasons.push(`📜 历史交锋：${h2h.p} 次世界杯交手，双方胜负各半，平局 ${h2h.draw} 场。`);
      }
    }

    // 4. 近期状态
    const hFormPts = form.homeForm;
    const aFormPts = form.awayForm;
    const maxForm = 15;
    if (hFormPts >= 12) {
      reasons.push(`🔥 ${homeTeam} 近期状态火热（5场 ${hFormPts} 分/满分15），士气高涨。`);
    } else if (hFormPts <= 6) {
      reasons.push(`⚠️ ${homeTeam} 近期状态低迷（5场仅 ${hFormPts} 分），需要反弹。`);
    }
    if (aFormPts >= 12) {
      reasons.push(`🔥 ${awayTeam} 近期状态出色（5场 ${aFormPts} 分/满分15）。`);
    } else if (aFormPts <= 6) {
      reasons.push(`⚠️ ${awayTeam} 近期状态不佳（5场仅 ${aFormPts} 分）。`);
    }

    // 5. 攻防风格碰撞
    const gStyle = hs.style + ' vs ' + as.style;
    if (hs.attack >= 8.5 && as.defense <= 7.0) {
      reasons.push(`⚔️ 攻击型${hs.style} vs 薄弱防守，${homeTeam}进球概率较高。`);
    }
    if (as.attack >= 8.5 && hs.defense <= 7.0) {
      reasons.push(`⚔️ ${awayTeam}的${as.style}可能对${homeTeam}防线构成威胁。`);
    }
    if (hs.defense >= 8.0 && as.defense >= 8.0) {
      reasons.push(`🔒 双方防守体系稳固（主 ${hs.defense}/客 ${as.defense}），可能是一场低比分较量。`);
    }

    // 6. 赛事动量
    if (momentum.homePlayed > 0 || momentum.awayPlayed > 0) {
      if (momentum.homePlayed > 0 && momentum.homeMomentum >= 2.5) {
        reasons.push(`🏆 本届世界杯：${homeTeam} 已赛 ${momentum.homePlayed} 场表现出色（场均 ${momentum.homeMomentum.toFixed(1)} 分）。`);
      }
      if (momentum.awayPlayed > 0 && momentum.awayMomentum >= 2.5) {
        reasons.push(`🏆 本届世界杯：${awayTeam} 已赛 ${momentum.awayPlayed} 场表现出色（场均 ${momentum.awayMomentum.toFixed(1)} 分）。`);
      }
    }

    // 7. 伤停/阵容完整度分析（最高优先级因素）
    if (injury && injury.homeAvail !== undefined) {
      const hAvail = injury.homeAvail;
      const aAvail = injury.awayAvail;

      if (hAvail < 0.7) {
        reasons.push(`🚨 ${homeTeam}阵容严重不整（完整度${(hAvail*100).toFixed(0)}%），${injury.homeInjuries.length > 0 ? '主力' + injury.homeInjuries.map(i=>i.name||i).join('、') + '缺阵' : '多名主力缺阵'}，战力大幅下降！`);
      } else if (hAvail < 0.85) {
        reasons.push(`⚠️ ${homeTeam}有少量伤停（完整度${(hAvail*100).toFixed(0)}%），对整体实力有轻微影响。`);
      }
      if (aAvail < 0.7) {
        reasons.push(`🚨 ${awayTeam}阵容严重不整（完整度${(aAvail*100).toFixed(0)}%），${injury.awayInjuries.length > 0 ? '主力' + injury.awayInjuries.map(i=>i.name||i).join('、') + '缺阵' : '多名主力缺阵'}，战力大幅下降！`);
      } else if (aAvail < 0.85) {
        reasons.push(`⚠️ ${awayTeam}有少量伤停（完整度${(aAvail*100).toFixed(0)}%），对整体实力有轻微影响。`);
      }

      // 关键因素
      if (injury.keyFactors && injury.keyFactors.length > 0) {
        for (const f of injury.keyFactors) {
          reasons.push(`📋 ${f}`);
        }
      }

      // AI情报中的关键缺席
      if (injury.homeNews && injury.homeNews.length > 0) {
        reasons.push(`📰 ${homeTeam}最新：${injury.homeNews.join('；')}`);
      }
      if (injury.awayNews && injury.awayNews.length > 0) {
        reasons.push(`📰 ${awayTeam}最新：${injury.awayNews.join('；')}`);
      }
    }

    // 8. 总进球倾向
    const expTotal = parseFloat((hs.avgGoalsScored + as.avgGoalsScored).toFixed(1));
    if (expTotal > 3.0) {
      reasons.push(`⚽ 两队历史场均进球合计 ${expTotal} 球，偏向进攻型比赛，大球概率高。`);
    } else if (expTotal < 2.0) {
      reasons.push(`⚽ 两队历史进球效率偏低（合计 ${expTotal} 球/场），可能小球格局。`);
    }

    // 9. 关键球员
    reasons.push(`⭐ 关键先生：${homeTeam} — ${hs.starPlayer}；${awayTeam} — ${as.starPlayer}`);

    return reasons;
  }
};
