// ============================================
// predictor.js — AI Score Prediction Engine v3
// v3: 引入已完赛数据为核心参考 + 动态平局概率
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
        message: `Missing data for "${homeTeam}" or "${awayTeam}"`,
        homeTeam, awayTeam
      };
    }

    // ── 0. 伤停/阵容调整 ──
    let adjustedHomeStats = homeStats;
    let adjustedAwayStats = awayStats;
    let injuryResult = { advantage: 0, homeAvail: 1.0, awayAvail: 1.0, detail: '暂无伤停情报', homeInjuries: [], awayInjuries: [], keyFactors: [] };

    if (intelligence && typeof LiveData !== 'undefined') {
      adjustedHomeStats = LiveData.adjustStatsForInjuries(homeTeam, homeStats, intelligence);
      adjustedAwayStats = LiveData.adjustStatsForInjuries(awayTeam, awayStats, intelligence);
      injuryResult = this.calcInjuryScore(homeTeam, awayTeam, adjustedHomeStats, adjustedAwayStats, intelligence);
    }

    // ── 1. Tournament Performance Score (25% weight) — NEW: 本届已完赛数据为核心 ──
    const tournamentResult = this.calcTournamentScore(homeTeam, awayTeam);

    // ── 2. FIFA Ranking Score (15% weight) ──
    const rankingDiff = this.calcRankingScore(homeRank, awayRank);

    // ── 3. Historical H2H Score (15% weight) ──
    const h2hResult = this.calcH2HScore(homeTeam, awayTeam);

    // ── 4. Recent Form Score (10% weight) ──
    const formResult = this.calcFormScore(adjustedHomeStats, adjustedAwayStats);

    // ── 5. Attack & Defense Score (10% weight) ──
    const adResult = this.calcAttackDefenseScore(adjustedHomeStats, adjustedAwayStats);

    // ── 6. Tournament Momentum (10% weight) ──
    const momentumResult = this.calcMomentumScore(homeTeam, awayTeam);

    // ── 7. Squad Availability (10% weight) ──
    // ── 8. Draw Tendency (5% weight) — NEW: 平局倾向修正 ──
    const weights = { tournament: 0.25, ranking: 0.15, h2h: 0.15, form: 0.10, attack: 0.10, momentum: 0.10, injury: 0.10, drawTrend: 0.05 };

    const rawScore = (
      tournamentResult.advantage * weights.tournament +
      rankingDiff.advantage * weights.ranking +
      h2hResult.advantage * weights.h2h +
      formResult.advantage * weights.form +
      adResult.advantage * weights.attack +
      momentumResult.advantage * weights.momentum +
      injuryResult.advantage * weights.injury +
      tournamentResult.drawAdjustment * weights.drawTrend
    );

    // ── 动态平局概率计算 ──
    const drawProb = this.calcDynamicDrawProb(rawScore, tournamentResult, h2hResult, stage);

    // Convert to win/loss probabilities
    const remainingProb = 1 - drawProb;
    const homeWinProb = Math.min(0.95, Math.max(0.05, 0.5 + rawScore));
    const awayWinProb = Math.min(0.95, Math.max(0.05, 0.5 - rawScore));
    const totalProb = homeWinProb + awayWinProb;
    const normalizedHome = homeWinProb / totalProb;
    const normalizedAway = awayWinProb / totalProb;

    const hProb = normalizedHome * remainingProb;
    const aProb = normalizedAway * remainingProb;

    // ── 三重比分预测（首选/次选/防冷）──
    const { primary, secondary, defensive, distribution, expectedGoals } = this.simulateMatch(
      adjustedHomeStats, adjustedAwayStats, rawScore, stage, tournamentResult
    );

    // ── 预测理由 ──
    const reasoning = this.generateReasoning(
      homeTeam, awayTeam, adjustedHomeStats, adjustedAwayStats, homeRank, awayRank,
      rankingDiff, h2hResult, formResult, adResult, momentumResult, injuryResult,
      tournamentResult, rawScore, hProb, drawProb, aProb, primary
    );

    return {
      homeTeam,
      awayTeam,
      homeWinProb: hProb,
      drawProb: drawProb,
      awayWinProb: aProb,
      primaryScore: primary,
      secondaryScore: secondary,
      defensiveScore: defensive,
      distribution,
      expectedGoals,
      components: {
        tournament: tournamentResult,
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

  // ── 1. Tournament Performance Score (NEW - 本届已完赛数据为核心参考) ──
  calcTournamentScore(homeTeam, awayTeam) {
    const results = WC2026_DATA.completedResults || [];

    // 收集两队所有已完赛数据
    const homeMatches = [];
    const awayMatches = [];

    for (const r of results) {
      if (r.home === homeTeam) {
        homeMatches.push({ opp: r.away, gf: r.hg, ga: r.ag, isHome: true, group: r.group });
      } else if (r.away === homeTeam) {
        homeMatches.push({ opp: r.home, gf: r.ag, ga: r.hg, isHome: false, group: r.group });
      }
      if (r.home === awayTeam) {
        awayMatches.push({ opp: r.away, gf: r.hg, ga: r.ag, isHome: true, group: r.group });
      } else if (r.away === awayTeam) {
        awayMatches.push({ opp: r.home, gf: r.ag, ga: r.hg, isHome: false, group: r.group });
      }
    }

    // 计算各项指标
    const homeStats = this._calcTeamTournamentStats(homeMatches);
    const awayStats = this._calcTeamTournamentStats(awayMatches);

    // 核心优势计算：综合胜率、进球效率、净胜球
    let advantage = 0;
    let drawAdjustment = 0;

    if (homeMatches.length > 0 || awayMatches.length > 0) {
      // 胜率差 (PPM = points per match)
      const ppmDiff = homeStats.ppm - awayStats.ppm;
      advantage += Math.tanh(ppmDiff * 0.4);

      // 进球效率差
      const gfDiff = homeStats.avgGF - awayStats.avgGF;
      advantage += Math.tanh(gfDiff * 0.15);

      // 净胜球差
      const gdDiff = homeStats.avgGD - awayStats.avgGD;
      advantage += Math.tanh(gdDiff * 0.12);

      // 防守表现差（失球越少越好）
      const gaDiff = awayStats.avgGA - homeStats.avgGA; // 主队失球少 → 正向
      advantage += Math.tanh(gaDiff * 0.10);

      // 冷门修正：如果弱队在本次赛事表现超预期，增加其优势
      if (homeStats.upsetBonus > 0) advantage += homeStats.upsetBonus * 0.15;
      if (awayStats.upsetBonus > 0) advantage -= awayStats.upsetBonus * 0.15;
    }

    // 平局倾向调整
    // - 两队都有平局记录 → 提高平局概率
    // - 两队实力接近且都有平局历史 → 进一步提高
    if (homeStats.drawRate > 0 && awayStats.drawRate > 0) {
      drawAdjustment = (homeStats.drawRate + awayStats.drawRate) * 0.15;
    }

    // 本届赛事整体平局率
    const totalDraws = results.filter(r => r.hg === r.ag).length;
    const tournamentDrawRate = results.length > 0 ? totalDraws / results.length : 0.25;
    drawAdjustment += (tournamentDrawRate - 0.25) * 0.3; // 偏离25%基准的部分

    // 检查两队是否在本届已交手
    let h2hTournament = null;
    for (const r of results) {
      if ((r.home === homeTeam && r.away === awayTeam) || (r.home === awayTeam && r.away === homeTeam)) {
        const isHomeHome = r.home === homeTeam;
        h2hTournament = {
          homeGoals: isHomeHome ? r.hg : r.ag,
          awayGoals: isHomeHome ? r.ag : r.hg,
          wasDraw: r.hg === r.ag,
          date: r.date
        };
        break;
      }
    }

    // 生成详情
    let detail = '';
    if (homeMatches.length === 0 && awayMatches.length === 0) {
      detail = '两队均无本届世界杯比赛记录';
    } else {
      const parts = [];
      if (homeMatches.length > 0) {
        parts.push(`${homeTeam} ${homeMatches.length}场: ${homeStats.wins}胜${homeStats.draws}平${homeStats.losses}负, 进${homeStats.totalGF}失${homeStats.totalGA}`);
      }
      if (awayMatches.length > 0) {
        parts.push(`${awayTeam} ${awayMatches.length}场: ${awayStats.wins}胜${awayStats.draws}平${awayStats.losses}负, 进${awayStats.totalGF}失${awayStats.totalGA}`);
      }
      if (h2hTournament) {
        parts.push(`本届交锋: ${h2hTournament.homeGoals}-${h2hTournament.awayGoals} (${h2hTournament.wasDraw ? '平局' : (h2hTournament.homeGoals > h2hTournament.awayGoals ? homeTeam + '胜' : awayTeam + '胜')})`);
      }
      if (tournamentDrawRate > 0.30) {
        parts.push(`本届平局率 ${(tournamentDrawRate * 100).toFixed(0)}% 偏高`);
      }
      detail = parts.join(' · ');
    }

    return {
      advantage,
      drawAdjustment,
      homeTournament: homeStats,
      awayTournament: awayStats,
      h2hTournament,
      tournamentDrawRate,
      homeMatches: homeMatches.length,
      awayMatches: awayMatches.length,
      detail
    };
  },

  // 辅助：计算球队在赛事中的统计
  _calcTeamTournamentStats(matches) {
    let wins = 0, draws = 0, losses = 0;
    let totalGF = 0, totalGA = 0;
    let upsetBonus = 0;

    for (const m of matches) {
      totalGF += m.gf;
      totalGA += m.ga;
      if (m.gf > m.ga) wins++;
      else if (m.gf === m.ga) draws++;
      else losses++;

      // 冷门检测：弱队赢强队 或 大比分胜利
      const margin = m.gf - m.ga;
      if (margin >= 3) upsetBonus += 0.3; // 大胜
      if (margin >= 5) upsetBonus += 0.3; // 碾压级
    }

    const played = matches.length;
    const ppm = played > 0 ? (wins * 3 + draws * 1) / played : 0;
    const avgGF = played > 0 ? totalGF / played : 0;
    const avgGA = played > 0 ? totalGA / played : 0;
    const avgGD = avgGF - avgGA;
    const drawRate = played > 0 ? draws / played : 0;

    return { wins, draws, losses, played, totalGF, totalGA, ppm, avgGF, avgGA, avgGD, drawRate, upsetBonus: Math.min(upsetBonus, 0.6) };
  },

  // ── 动态平局概率计算 (NEW - 替代固定25%) ──
  calcDynamicDrawProb(rawScore, tournamentResult, h2hResult, stage) {
    // 基础平局概率：实力越接近，平局概率越高
    const absAdvantage = Math.abs(rawScore);
    let baseDraw = 0.28; // 基准28%（略高于传统的25%）

    // 实力差距修正：差距越小，平局概率越高
    if (absAdvantage < 0.05) {
      baseDraw = 0.38; // 极接近 → 38%
    } else if (absAdvantage < 0.10) {
      baseDraw = 0.34; // 接近 → 34%
    } else if (absAdvantage < 0.20) {
      baseDraw = 0.30; // 有差距但不大 → 30%
    } else if (absAdvantage < 0.35) {
      baseDraw = 0.25; // 有一定差距 → 25%
    } else if (absAdvantage < 0.50) {
      baseDraw = 0.20; // 差距较大 → 20%
    } else {
      baseDraw = 0.15; // 差距悬殊 → 15%
    }

    // 赛事平局率修正：本届赛事整体平局率影响
    const tournamentDrawRate = tournamentResult.tournamentDrawRate || 0.25;
    if (tournamentDrawRate > 0.30) {
      baseDraw += 0.04; // 赛事平局率高 → 加4%
    } else if (tournamentDrawRate > 0.35) {
      baseDraw += 0.08; // 赛事平局率很高 → 加8%
    } else if (tournamentDrawRate < 0.15) {
      baseDraw -= 0.03; // 赛事平局率低 → 减3%
    }

    // 球队平局倾向修正
    const homeDrawRate = tournamentResult.homeTournament?.drawRate || 0;
    const awayDrawRate = tournamentResult.awayTournament?.drawRate || 0;
    if (homeDrawRate > 0 && awayDrawRate > 0) {
      // 两队都有平局习惯
      const avgDrawRate = (homeDrawRate + awayDrawRate) / 2;
      if (avgDrawRate >= 0.5) {
        baseDraw += 0.08; // 两队平局率都很高
      } else if (avgDrawRate >= 0.33) {
        baseDraw += 0.04; // 有一定平局倾向
      }
    }

    // 本届已交手且平局 → 大幅提高平局概率
    if (tournamentResult.h2hTournament?.wasDraw) {
      baseDraw += 0.10;
    }

    // 历史交锋平局率高 → 适度提高
    if (h2hResult.p > 0) {
      const h2hDrawRate = h2hResult.draw / h2hResult.p;
      if (h2hDrawRate >= 0.40) {
        baseDraw += 0.05;
      }
    }

    // 赛事阶段修正：淘汰赛平局率较低（小组赛更易出平）
    if (stage === 'r32' || stage === 'r16' || stage === 'qf' || stage === 'sf' || stage === 'final') {
      baseDraw -= 0.05; // 淘汰赛减5%
    }

    // 确保在合理范围内 [12%, 45%]
    return Math.min(0.45, Math.max(0.12, baseDraw));
  },

  // ── 2. FIFA Ranking Score ──
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

  // ── 3. H2H Score ──
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

  // ── 4. Recent Form Score ──
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

  // ── 5. Attack & Defense Score ──
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

  // ── 6. Tournament Momentum ──
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

  // ── 7. Squad Availability Score ──
  calcInjuryScore(homeTeam, awayTeam, adjHomeStats, adjAwayStats, intelligence) {
    const homeIntel = intelligence.home?.team === homeTeam ? intelligence.home : intelligence.away;
    const awayIntel = intelligence.away?.team === awayTeam ? intelligence.away : intelligence.home;

    const homeAvail = homeIntel?.availability ?? 1.0;
    const awayAvail = awayIntel?.availability ?? 1.0;

    const availDiff = homeAvail - awayAvail;
    const advantage = Math.tanh(availDiff * 2.0);

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

      const hka = intelligence.home?.keyAbsent || '';
      const aka = intelligence.away?.keyAbsent || '';
      if (hka && hka !== '无') parts.push(`主队关键缺席：${hka}`);
      if (aka && aka !== '无') parts.push(`客队关键缺席：${aka}`);

      detail = parts.join('；') || '阵容齐整';
    }

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
  simulateMatch(homeStats, awayStats, advantage, stage, tournamentResult) {
    let homeBase = 1.5 + advantage * 1.5;
    let awayBase = 1.5 - advantage * 1.5;

    // 使用本届赛事实际进球数据修正期望进球
    if (tournamentResult) {
      const ht = tournamentResult.homeTournament;
      const at = tournamentResult.awayTournament;
      if (ht.played > 0) {
        // 混合赛事数据和理论值 (50/50)
        homeBase = homeBase * 0.5 + ht.avgGF * 0.5;
        // 如果主队防守好，降低客队期望进球
        awayBase = awayBase * 0.5 + at.avgGF * 0.5;
      }
    }

    // 确保合理的进球范围
    homeBase = Math.max(0.3, Math.min(4.0, homeBase));
    awayBase = Math.max(0.3, Math.min(4.0, awayBase));

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

    const distribution = Object.entries(dist)
      .map(([score, count]) => ({ score, count, pct: ((count / SIMS) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    const primary = distribution[0] || { score: '1-1', pct: '25.0' };
    const [ph, pa] = primary.score.split('-').map(Number);

    const secondary = distribution[1] || { score: '1-0', pct: '15.0' };
    const [sh, sa] = secondary.score.split('-').map(Number);

    let defensive = distribution.slice(2).find(d => {
      const [dh, da] = d.score.split('-').map(Number);
      if (advantage > 0.1 && dh < da) return true;
      if (advantage < -0.1 && dh > da) return true;
      if (dh + da >= 4) return true;
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
  generateReasoning(homeTeam, awayTeam, hs, as, hr, ar, ranking, h2h, form, ad, momentum, injury, tournament, rawScore, hProb, dProb, aProb, primary) {
    const reasons = [];

    // 0. 本届赛事表现分析（最高优先级 — NEW）
    if (tournament && (tournament.homeMatches > 0 || tournament.awayMatches > 0)) {
      const ht = tournament.homeTournament;
      const at = tournament.awayTournament;
      const parts = [];

      if (ht.played > 0) {
        parts.push(`${homeTeam} ${ht.wins}胜${ht.draws}平${ht.losses}负（进${ht.totalGF}失${ht.totalGA}，场均${ht.ppm.toFixed(1)}分）`);
      }
      if (at.played > 0) {
        parts.push(`${awayTeam} ${at.wins}胜${at.draws}平${at.losses}负（进${at.totalGF}失${at.totalGA}，场均${at.ppm.toFixed(1)}分）`);
      }

      if (parts.length > 0) {
        reasons.push(`🏆 本届世界杯战绩：${parts.join(' vs ')}`);
      }

      // 冷门表现
      if (ht.upsetBonus > 0.3) {
        reasons.push(`🔥 ${homeTeam}本届赛事有碾压级表现（大胜），状态出色！`);
      }
      if (at.upsetBonus > 0.3) {
        reasons.push(`🔥 ${awayTeam}本届赛事有碾压级表现（大胜），不可小觑！`);
      }

      // 本届交锋
      if (tournament.h2hTournament) {
        const h2hT = tournament.h2hTournament;
        if (h2hT.wasDraw) {
          reasons.push(`⚠️ 两队本届赛事已交手，战成 ${h2hT.homeGoals}-${h2hT.awayGoals} 平局！`);
        } else {
          const winner = h2hT.homeGoals > h2hT.awayGoals ? homeTeam : awayTeam;
          reasons.push(`📋 两队本届赛事已交手：${winner} ${Math.max(h2hT.homeGoals, h2hT.awayGoals)}-${Math.min(h2hT.homeGoals, h2hT.awayGoals)} 获胜。`);
        }
      }

      // 赛事平局率
      if (tournament.tournamentDrawRate > 0.30) {
        reasons.push(`📊 本届世界杯平局率高达 ${(tournament.tournamentDrawRate * 100).toFixed(0)}%，冷门频出，需警惕平局可能。`);
      }
    }

    // 1. 综合实力评估
    const hPower = (hs.attack + hs.defense) / 2;
    const aPower = (as.attack + as.defense) / 2;
    const powerGap = hPower - aPower;

    if (powerGap > 1.0) {
      reasons.push(`✅ ${homeTeam} 综合实力明显优于 ${awayTeam}（评分差 ${powerGap.toFixed(1)} 分），预计占据场上主动。`);
    } else if (powerGap < -1.0) {
      reasons.push(`⚠️ ${awayTeam} 综合实力强于 ${homeTeam}（评分差 ${Math.abs(powerGap).toFixed(1)} 分），${homeTeam} 需要全力防守。`);
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

    // 7. 伤停/阵容完整度
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

      if (injury.keyFactors && injury.keyFactors.length > 0) {
        for (const f of injury.keyFactors) {
          reasons.push(`📋 ${f}`);
        }
      }

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

    // 9. 平局概率分析（NEW）
    const dPct = Math.round(dProb * 100);
    if (dPct >= 35) {
      reasons.push(`🤝 平局概率 ${dPct}% 偏高：两队实力接近且本届平局频出，预计比赛胶着。`);
    } else if (dPct <= 18) {
      reasons.push(`🤝 平局概率仅 ${dPct}%：实力差距明显，分出胜负可能性大。`);
    }

    // 10. 关键球员
    reasons.push(`⭐ 关键先生：${homeTeam} — ${hs.starPlayer}；${awayTeam} — ${as.starPlayer}`);

    return reasons;
  }
};
