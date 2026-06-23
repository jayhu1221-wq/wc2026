// ============================================
// bracket.js — 2026 FIFA World Cup Knockout Bracket
// 48队制：小组前2名 + 8个最佳第3名 → 32强淘汰赛
// ============================================

const BracketEngine = {

  // ── 淘汰赛分组映射（FIFA 2026 48队制典型布局）──
  // 每行代表一个1/16决赛对阵
  bracketR32: [
    // 上半区 Left Half
    { id: 'R1',  seed: '1A',  opp: '3BCDEF',  desc: 'A组第1 vs B/C/D/E/F最佳第3' },
    { id: 'R2',  seed: '1B',  opp: '3ACD',    desc: 'B组第1 vs A/C/D最佳第3' },
    { id: 'R3',  seed: '1C',  opp: '2F',      desc: 'C组第1 vs F组第2' },
    { id: 'R4',  seed: '1D',  opp: '2E',      desc: 'D组第1 vs E组第2' },
    { id: 'R5',  seed: '1E',  opp: '2D',      desc: 'E组第1 vs D组第2' },
    { id: 'R6',  seed: '1F',  opp: '2C',      desc: 'F组第1 vs C组第2' },
    { id: 'R7',  seed: '1G',  opp: '3ABEFI',  desc: 'G组第1 vs A/B/E/F/I最佳第3' },
    { id: 'R8',  seed: '1H',  opp: '2J',      desc: 'H组第1 vs J组第2' },
    { id: 'R9',  seed: '1I',  opp: '2K',      desc: 'I组第1 vs K组第2' },
    { id: 'R10', seed: '1J',  opp: '2H',      desc: 'J组第1 vs H组第2' },
    { id: 'R11', seed: '1K',  opp: '3CDGHL',  desc: 'K组第1 vs C/D/G/H/L最佳第3' },
    { id: 'R12', seed: '1L',  opp: '2G',      desc: 'L组第1 vs G组第2' },
    { id: 'R13', seed: '2A',  opp: '2B',      desc: 'A组第2 vs B组第2' },
    { id: 'R14', seed: '2L',  opp: '3EGJKL',  desc: 'L组第2 vs E/G/J/K/L最佳第3' },
    { id: 'R15', seed: '2K',  opp: '3AFHIJ',  desc: 'K组第2 vs A/F/H/I/J最佳第3' },
    { id: 'R16', seed: '2J',  opp: '2I',      desc: 'J组第2 vs I组第2' },
  ],

  // Round of 16 对阵（R1胜 vs R2胜, etc.）
  bracketR16: [
    { id: 'R1_8_1',  from: ['R1', 'R2'],   desc: 'R1胜者 vs R2胜者' },
    { id: 'R1_8_2',  from: ['R3', 'R4'],   desc: 'R3胜者 vs R4胜者' },
    { id: 'R1_8_3',  from: ['R5', 'R6'],   desc: 'R5胜者 vs R6胜者' },
    { id: 'R1_8_4',  from: ['R7', 'R8'],   desc: 'R7胜者 vs R8胜者' },
    { id: 'R1_8_5',  from: ['R9', 'R10'],  desc: 'R9胜者 vs R10胜者' },
    { id: 'R1_8_6',  from: ['R11', 'R12'], desc: 'R11胜者 vs R12胜者' },
    { id: 'R1_8_7',  from: ['R13', 'R14'], desc: 'R13胜者 vs R14胜者' },
    { id: 'R1_8_8',  from: ['R15', 'R16'], desc: 'R15胜者 vs R16胜者' },
  ],

  // Quarter-finals
  bracketQF: [
    { id: 'QF1', from: ['R1_8_1', 'R1_8_2'], desc: '1/8决赛①胜者 vs ②胜者' },
    { id: 'QF2', from: ['R1_8_3', 'R1_8_4'], desc: '1/8决赛③胜者 vs ④胜者' },
    { id: 'QF3', from: ['R1_8_5', 'R1_8_6'], desc: '1/8决赛⑤胜者 vs ⑥胜者' },
    { id: 'QF4', from: ['R1_8_7', 'R1_8_8'], desc: '1/8决赛⑦胜者 vs ⑧胜者' },
  ],

  // Semi-finals
  bracketSF: [
    { id: 'SF1', from: ['QF1', 'QF2'], desc: '1/4决赛①胜者 vs ②胜者' },
    { id: 'SF2', from: ['QF3', 'QF4'], desc: '1/4决赛③胜者 vs ④胜者' },
  ],

  // ── 计算小组排名 ──
  computeStandings() {
    const teams = {};
    const groupTeams = WC2026_DATA.groups;

    // 初始化
    for (const [grp, gdata] of Object.entries(groupTeams)) {
      for (const team of gdata.teams) {
        teams[team] = { group: grp, pts: 0, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 };
      }
    }

    // 统计已完成比赛
    for (const r of WC2026_DATA.completedResults) {
      const h = teams[r.home], a = teams[r.away];
      if (!h || !a) continue;
      h.p++; a.p++;
      h.gf += r.hg; h.ga += r.ag; a.gf += r.ag; a.ga += r.hg;
      if (r.hg > r.ag) { h.pts += 3; h.w++; a.l++; }
      else if (r.hg < r.ag) { a.pts += 3; a.w++; h.l++; }
      else { h.pts += 1; a.pts += 1; h.d++; a.d++; }
    }

    for (const [team, s] of Object.entries(teams)) {
      s.gd = s.gf - s.ga;
    }

    return teams;
  },

  // ── 获取小组排名列表 ──
  getGroupRankings() {
    const standings = this.computeStandings();
    const groups = {};

    for (const [grp, gdata] of Object.entries(WC2026_DATA.groups)) {
      groups[grp] = gdata.teams.map(t => ({ team: t, ...standings[t] }));
      groups[grp].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });
    }

    return groups;
  },

  // ── 确定晋级队伍（基于当前积分）──
  getQualifiedTeams() {
    const rankings = this.getGroupRankings();
    const groupWinners = {};
    const groupRunnersUp = {};
    const thirdPlace = [];

    for (const [grp, teams] of Object.entries(rankings)) {
      if (teams.length >= 2) {
        groupWinners[grp] = teams[0];
        groupRunnersUp[grp] = teams[1];
      }
      if (teams.length >= 3) {
        thirdPlace.push({ ...teams[2], group: grp });
      }
      if (teams.length >= 4) {
        thirdPlace.push({ ...teams[2], group: grp }); // already added above line
      }
    }

    // Fix dedup
    const seen = new Set();
    const thirdUnique = [];
    for (const t of thirdPlace) {
      const key = `${t.team}-${t.group}`;
      if (!seen.has(key)) {
        seen.add(key);
        thirdUnique.push(t);
      }
    }

    // 排名所有小组第三（积分 → 净胜球 → 进球）
    thirdUnique.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    return {
      groupWinners,
      groupRunnersUp,
      bestThirds: thirdUnique.slice(0, 8) // 前8名
    };
  },

  // ── 解析 seed 描述为实际队伍 ──
  _resolveSeed(seed, qualified) {
    const { groupWinners, groupRunnersUp, bestThirds } = qualified;

    // 格式: 1A → A组第1, 2B → B组第2, 3BCDEF → B/C/D/E/F最佳第3
    const posMatch = seed.match(/^(\d)([A-Z]+)/);
    if (!posMatch) return { type: 'unknown', teams: [], label: seed };

    const pos = parseInt(posMatch[1]);
    const groupCodes = posMatch[2].split('');

    if (pos === 1) {
      const grp = groupCodes[0];
      return {
        type: 'group_winner',
        teams: [groupWinners[grp] || null],
        label: `${grp}组第1`,
        group: grp
      };
    } else if (pos === 2) {
      const grp = groupCodes[0];
      return {
        type: 'group_runner_up',
        teams: [groupRunnersUp[grp] || null],
        label: `${grp}组第2`,
        group: grp
      };
    } else if (pos === 3) {
      // 最佳第3 — 从指定组中筛选
      const candidates = bestThirds.filter(t => groupCodes.includes(t.group));
      return {
        type: 'best_third',
        teams: candidates,
        label: `最佳第3`,
        groups: groupCodes
      };
    }

    return { type: 'unknown', teams: [], label: seed };
  },

  // ── 获取队伍中文名 & emoji ──
  zhName(en) {
    return WC2026_DATA.teamZhName[en] || en;
  },
  emoji(en) {
    return WC2026_DATA.teamEmoji[en] || '🏴';
  },

  // ── 获取当前"被预测会晋级"的队伍 ──
  // 基于积分现状：如果某队积分差距较小，则显示当前领先者
  getBracketTeams() {
    const qualified = this.getQualifiedTeams();
    const matches = [];

    for (const slot of this.bracketR32) {
      const seed1 = this._resolveSeed(slot.seed, qualified);
      const seed2 = this._resolveSeed(slot.opp, qualified);

      const t1 = this._getBestCandidate(seed1);
      const t2 = this._getBestCandidate(seed2);

      matches.push({
        id: slot.id,
        desc: slot.desc,
        team1: t1 ? { name: t1.team, zh: this.zhName(t1.team), emoji: this.emoji(t1.team), pts: t1.pts, group: t1.group || seed1.group || '' } : null,
        team2: t2 ? { name: t2.team, zh: this.zhName(t2.team), emoji: this.emoji(t2.team), pts: t2.pts, group: t2.group || seed2.group || '' } : null,
        label1: seed1.label,
        label2: seed2.label
      });
    }

    return {
      r32: matches,
      r16: this.bracketR16,
      qf: this.bracketQF,
      sf: this.bracketSF
    };
  },

  _getBestCandidate(seed) {
    if (seed.type === 'group_winner' || seed.type === 'group_runner_up') {
      const t = seed.teams[0];
      if (!t) return null;
      return { team: t.team, pts: t.pts, group: seed.group };
    } else if (seed.type === 'best_third') {
      // 返回第一个合法候选人（按积分排序后的最佳第3）
      if (seed.teams.length > 0) {
        const t = seed.teams[0];
        return { team: t.team, pts: t.pts, group: t.group };
      }
      return null;
    }
    return null;
  }
};
