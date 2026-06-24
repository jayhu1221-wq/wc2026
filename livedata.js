// ============================================
// livedata.js — 实时数据层 v2
// 数据源：API-Football (RapidAPI) + football-data.org + AI 情报
// 功能：实时比分 / 自动同步 / 伤停情报 / 数据回写
// ============================================

const LiveData = {

  // ── 配置 ──
  _cacheKey: 'wc2026_live_cache',
  _cacheTTL: 3 * 60 * 1000,        // 常规缓存3分钟
  _liveCacheTTL: 15 * 1000,        // 比赛进行中缓存15秒
  _refreshInterval: null,
  _intelligenceCache: {},
  _lastSyncTime: null,
  _syncInProgress: false,

  // ── API-Football (RapidAPI) — 免费版100次/天 ──
  _afBaseUrl: 'https://api-football-v1.p.rapidapi.com/v3',
  _afApiKey: '',                    // 用户配置

  // ── football-data.org — 免费版10次/分钟 ──
  // 密钥已移至服务端 server.js，客户端通过 /api/scores 代理获取
  _fdBaseUrl: '/api/fd',                              // 旧代理路径（兼容）
  _fdApiKey: '',                                      // 密钥在服务端，客户端不需要
  _fdDirectUrl: '',                                   // 不再直连（密钥已隐藏）
  _scoresProxyUrl: '/api/scores',                     // 新：实时比分代理端点

  // ── 常规刷新间隔：5分钟（从 live-scores.json 重新加载）──
  _normalRefreshMs: 5 * 60 * 1000,          // 300000ms = 5分钟
  _liveRefreshMs: 30 * 1000,                // 进行中30秒

  // ── World Cup 2026 竞赛ID ──
  _wcLeagueId: 1,                  // API-Football 中 FIFA World Cup 的 league ID
  _wcSeason: 2026,

  // ── 数据新鲜度状态 ──
  _lastFetchTime: null,
  _dataSource: 'local',            // 'local' | 'api' | 'ai' | 'mixed'
  _fetchErrors: [],
  _liveMatches: [],                 // 当前进行中的比赛

  // =============================================
  //  1. 核心：同步实时数据 → 回写到 WC2026_DATA
  // =============================================

  // 全量同步：获取最新比分并回写到本地数据
  // 策略：服务器代理优先（实时数据），本地JSON降级（静态部署时）
  async syncAllScores() {
    if (this._syncInProgress) return;
    this._syncInProgress = true;

    try {
      let synced = false;

      // 方案1（首选）：通过服务器代理 /api/scores 获取实时数据（密钥在服务端）
      synced = await this._syncFromProxy();

      // 方案2：从本地 live-data-inline.js / live-scores.json 同步（静态部署降级）
      if (!synced) {
        synced = await this._syncFromLocalJSON();
      }

      // 方案3：通过旧版代理服务器直连 football-data.org（兼容旧 server.js）
      if (!synced) {
        synced = await this._syncFromFootballData();
      }

      // 无数据时：基于时间自动分类比赛
      if (!synced) {
        this._autoClassifyByTime();
      }

      this._lastSyncTime = new Date();
      this._lastFetchTime = new Date();
      if (synced) this._dataSource = 'api';

    } catch (e) {
      console.warn('[LiveData] 同步失败:', e.message);
      this._fetchErrors.push({ time: new Date(), error: e.message });
      this._autoClassifyByTime();
    } finally {
      this._syncInProgress = false;
    }
  },

  // ── 通过服务器代理 /api/scores 获取实时比分（密钥在服务端）──
  async _syncFromProxy() {
    try {
      const resp = await fetch(this._scoresProxyUrl, { cache: 'no-cache' });
      if (!resp.ok) {
        console.log(`[LiveData] /api/scores 代理不可用 (HTTP ${resp.status})，将使用本地数据`);
        return false;
      }
      const data = await resp.json();
      if (!data || !data.matches || data.matches.length === 0) return false;

      console.log(`[LiveData] ✅ /api/scores 代理获取成功: ${data.total} 场 (完赛${data.finished}/进行${data.inPlay})`);
      console.log(`[LiveData]    数据获取时间: ${data.fetchTimeBeijing || data.fetchTime}`);

      let matchCount = 0;
      for (const m of data.matches) {
        const homeTeam = this._matchTeamName(m.homeTeam);
        const awayTeam = this._matchTeamName(m.awayTeam);
        if (!homeTeam || !awayTeam) continue;

        const hg = m.score?.fullTime?.home;
        const ag = m.score?.fullTime?.away;
        const status = m.status;

        if (status === 'FINISHED' && hg !== null && hg !== undefined) {
          if (this._moveToCompleted(homeTeam, awayTeam, hg, ag)) matchCount++;
        } else if (['IN_PLAY', 'PAUSED', 'LIVE'].includes(status)) {
          let liveHg = hg;
          let liveAg = ag;
          if (liveHg === null || liveHg === undefined) {
            liveHg = m.score?.halfTime?.home ?? 0;
            liveAg = m.score?.halfTime?.away ?? 0;
          }
          const minute = m.minute || null;
          if (this._updateLiveScore(homeTeam, awayTeam, liveHg, liveAg, minute)) matchCount++;
        }
      }

      console.log(`[LiveData] 代理同步完成，更新 ${matchCount} 场比赛`);
      return true;

    } catch (e) {
      console.log('[LiveData] /api/scores 代理不可用:', e.message);
      return false;
    }
  },

  // ── 从本地 live-scores.json 或 window.WC_LIVE_DATA 同步 ──
  async _syncFromLocalJSON() {
    let data = null;

    // 方案A：尝试 fetch live-scores.json（CloudStudio和本地server均可用）
    try {
      const resp = await fetch('/live-scores.json', { cache: 'no-cache' });
      if (resp.ok) {
        data = await resp.json();
        console.log(`[LiveData] ✅ live-scores.json fetch 成功: ${data.total} 场`);
      }
    } catch (e) {
      console.log('[LiveData] live-scores.json fetch 失败:', e.message);
    }

    // 方案B：动态重新加载 live-data-inline.js
    if (!data) {
      try {
        await new Promise((resolve) => {
          const oldScript = document.getElementById('live-data-reload');
          if (oldScript) oldScript.remove();
          const script = document.createElement('script');
          script.id = 'live-data-reload';
          script.src = `live-data-inline.js?_t=${Date.now()}`;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          document.head.appendChild(script);
        });
        if (window.WC_LIVE_DATA && window.WC_LIVE_DATA.matches) {
          data = window.WC_LIVE_DATA;
          console.log(`[LiveData] ✅ live-data-inline.js 刷新成功: ${data.total} 场 (完赛${data.finished}/进行${data.inPlay})`);
        }
      } catch (e) {
        console.log('[LiveData] live-data-inline.js 重载失败:', e.message);
      }
    }

    // 方案C：使用已有的 window.WC_LIVE_DATA（首次页面加载的内联数据）
    if (!data && window.WC_LIVE_DATA && window.WC_LIVE_DATA.matches) {
      data = window.WC_LIVE_DATA;
      console.log(`[LiveData] ✅ 使用页面内联数据: ${data.total} 场`);
    }

    if (!data || !data.matches || data.matches.length === 0) return false;

    console.log(`[LiveData]    数据获取时间: ${data.fetchTimeBeijing || data.fetchTime}`);

    let matchCount = 0;
    for (const m of data.matches) {
      const homeTeam = this._matchTeamName(m.homeTeam);
      const awayTeam = this._matchTeamName(m.awayTeam);
      if (!homeTeam || !awayTeam) continue;

      const hg = m.score?.fullTime?.home;
      const ag = m.score?.fullTime?.away;
      const status = m.status;

      if (status === 'FINISHED' && hg !== null && hg !== undefined) {
        if (this._moveToCompleted(homeTeam, awayTeam, hg, ag)) matchCount++;
      } else if (['IN_PLAY', 'PAUSED', 'LIVE'].includes(status)) {
        let liveHg = hg;
        let liveAg = ag;
        if (liveHg === null || liveHg === undefined) {
          liveHg = m.score?.halfTime?.home ?? 0;
          liveAg = m.score?.halfTime?.away ?? 0;
        }
        const minute = m.minute || null;
        if (this._updateLiveScore(homeTeam, awayTeam, liveHg, liveAg, minute)) matchCount++;
      }
    }

    console.log(`[LiveData] 同步完成，更新 ${matchCount} 场比赛`);
    return matchCount > 0;
  },

  // ── 从 API-Football 同步 ──
  async _syncFromAPIFootball() {
    try {
      const resp = await fetch(
        `${this._afBaseUrl}/fixtures?league=${this._wcLeagueId}&season=${this._wcSeason}`,
        {
          headers: {
            'X-RapidAPI-Key': this._afApiKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
          }
        }
      );
      if (!resp.ok) throw new Error(`API-Football HTTP ${resp.status}`);
      const data = await resp.json();

      if (!data.response || data.response.length === 0) return false;

      let matchCount = 0;
      for (const fixture of data.response) {
        const updated = this._mergeFixtureToData(fixture);
        if (updated) matchCount++;
      }

      console.log(`[LiveData] API-Football 同步 ${matchCount} 场比赛`);
      return matchCount > 0;

    } catch (e) {
      console.warn('[LiveData] API-Football 同步失败:', e.message);
      this._fetchErrors.push({ time: new Date(), source: 'api-football', error: e.message });
      return false;
    }
  },

  // ── 解析 API-Football fixture 并回写 ──
  _mergeFixtureToData(fixture) {
    const status = fixture.fixture?.status?.short;
    const homeTeam = this._matchTeamName(fixture.teams?.home?.name);
    const awayTeam = this._matchTeamName(fixture.teams?.away?.name);
    if (!homeTeam || !awayTeam) return false;

    const hg = fixture.goals?.home;
    const ag = fixture.goals?.away;
    const minute = fixture.fixture?.status?.elapsed;

    // 1NS = 未开始, FT = 完赛, LIVE/1H/2H/HT/ET/P = 进行中
    const isCompleted = ['FT', 'AET', 'PEN', 'WO'].includes(status);
    const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(status);

    if (isCompleted && hg !== null && ag !== null) {
      // 移动到 completedResults（如果不存在的话）
      return this._moveToCompleted(homeTeam, awayTeam, hg, ag);
    } else if (isLive) {
      // 更新实时比分
      return this._updateLiveScore(homeTeam, awayTeam, hg, ag, minute);
    }

    return false;
  },

  // ── 从 football-data.org 同步（通过服务端代理，密钥在服务端）──
  // 仅使用 /api/fd/ 代理路径，密钥由 server.js 添加
  async _syncFromFootballData() {
    const compCodes = ['WC'];
    let bestData = null;

    // 只使用代理路径（密钥在服务端）
    const urls = [
      (path) => `${this._fdBaseUrl}${path}`,             // 代理：/api/fd/...
    ];

    for (const comp of compCodes) {
      const apiPath = `/competitions/${comp}/matches?status=FINISHED,IN_PLAY,PAUSED,TIMED,SCHEDULED&limit=80`;
      for (const urlFn of urls) {
        try {
          const resp = await fetch(urlFn(apiPath));
          if (!resp.ok) {
            console.warn(`[LiveData] football-data comp=${comp} HTTP ${resp.status}`);
            continue;
          }
          const data = await resp.json();
          if (data.matches && data.matches.length > 0) {
            bestData = data;
            console.log(`[LiveData] ✅ football-data.org comp=${comp} 获取 ${data.matches.length} 场比赛`);
            break;
          }
        } catch (e) {
          console.warn(`[LiveData] football-data comp=${comp} 失败:`, e.message);
        }
      }
      if (bestData) break;
    }

    if (!bestData || !bestData.matches || bestData.matches.length === 0) {
      // 尝试获取所有今天的比赛
      const today = new Date().toISOString().split('T')[0];
      for (const urlFn of urls) {
        try {
          const resp = await fetch(urlFn(`/matches?dateFrom=${today}&dateTo=${today}`));
          if (resp.ok) {
            const data = await resp.json();
            if (data.matches && data.matches.length > 0) {
              bestData = data;
              console.log(`[LiveData] ✅ football-data.org 今日比赛 ${data.matches.length} 场`);
              break;
            }
          }
        } catch (e) {
          console.warn('[LiveData] football-data.org 今日比赛获取失败:', e.message);
        }
      }
    }

    if (!bestData || !bestData.matches) return false;

    let matchCount = 0;
    for (const m of bestData.matches) {
      const homeTeam = this._matchTeamName(m.homeTeam?.shortName || m.homeTeam?.name);
      const awayTeam = this._matchTeamName(m.awayTeam?.shortName || m.awayTeam?.name);
      if (!homeTeam || !awayTeam) continue;

      const hg = m.score?.fullTime?.home;
      const ag = m.score?.fullTime?.away;
      const status = m.status;

      if (status === 'FINISHED' && hg !== null && ag !== null) {
        if (this._moveToCompleted(homeTeam, awayTeam, hg, ag)) matchCount++;
      } else if (['IN_PLAY', 'PAUSED', 'LIVE'].includes(status)) {
        // IN_PLAY时fullTime通常为null，优先取halfTime或当前比分
        // football-data.org 在IN_PLAY时比分可能在 fullTime 或 halfTime 中
        let liveHg = hg;
        let liveAg = ag;
        if (liveHg === null || liveAg === null) {
          // 尝试从halfTime获取
          liveHg = m.score?.halfTime?.home ?? 0;
          liveAg = m.score?.halfTime?.away ?? 0;
        }
        const minute = m.minute || null;
        if (this._updateLiveScore(homeTeam, awayTeam, liveHg, liveAg, minute)) matchCount++;
      }
    }

    console.log(`[LiveData] football-data.org 同步完成，更新 ${matchCount} 场比赛`);
    return matchCount > 0;
  },

  // =============================================
  //  2. 数据回写引擎
  // =============================================

  // 将比赛从 upcoming → completed
  _moveToCompleted(homeTeam, awayTeam, hg, ag) {
    if (!WC2026_DATA || !WC2026_DATA.upcomingMatches) return false;

    // 检查是否已在 completedResults 中（正反序都检查）
    const alreadyDone = WC2026_DATA.completedResults.some(
      r => (r.home === homeTeam && r.away === awayTeam) ||
           (r.home === awayTeam && r.away === homeTeam)
    );
    if (alreadyDone) return false;

    // 从 upcomingMatches 中查找（正反序都检查）
    let idx = WC2026_DATA.upcomingMatches.findIndex(
      m => m.home === homeTeam && m.away === awayTeam
    );
    let isSwapped = false;
    if (idx === -1) {
      idx = WC2026_DATA.upcomingMatches.findIndex(
        m => m.home === awayTeam && m.away === homeTeam
      );
      isSwapped = true;
    }
    if (idx === -1) return false;

    const match = WC2026_DATA.upcomingMatches.splice(idx, 1)[0];

    // 添加到 completedResults（保持 data.js 中的主客队顺序，比分对应调整）
    const finalHome = isSwapped ? awayTeam : homeTeam;
    const finalAway = isSwapped ? homeTeam : awayTeam;
    const finalHg = isSwapped ? ag : hg;
    const finalAg = isSwapped ? hg : ag;
    const completedMatch = {
      date: match.date,
      time: match.time,
      group: match.group,
      home: finalHome,
      away: finalAway,
      hg: finalHg,
      ag: finalAg,
      venue: match.venue
    };
    WC2026_DATA.completedResults.push(completedMatch);

    // 更新球队战绩
    this._updateTeamStatsAfterMatch(finalHome, finalAway, finalHg, finalAg);

    console.log(`[LiveData] ✓ ${finalHome} ${finalHg}-${finalAg} ${finalAway} → 已完赛`);
    return true;
  },

  // 更新进行中比赛的实时比分
  _updateLiveScore(homeTeam, awayTeam, hg, ag, minute) {
    if (!WC2026_DATA || !WC2026_DATA.upcomingMatches) return false;

    let match = WC2026_DATA.upcomingMatches.find(
      m => m.home === homeTeam && m.away === awayTeam
    );
    let isSwapped = false;
    if (!match) {
      match = WC2026_DATA.upcomingMatches.find(
        m => m.home === awayTeam && m.away === homeTeam
      );
      isSwapped = true;
    }
    if (!match) return false;

    // 比分对应 data.js 中的主客队顺序
    const finalHg = isSwapped ? ag : hg;
    const finalAg = isSwapped ? hg : ag;
    match.liveScore = { hg: finalHg, ag: finalAg, min: minute ? `${minute}'` : '--' };
    match.status = 'live';

    // 记录到 liveMatches
    const liveHome = isSwapped ? awayTeam : homeTeam;
    const liveAway = isSwapped ? homeTeam : awayTeam;
    const existingIdx = this._liveMatches.findIndex(
      m => (m.home === liveHome && m.away === liveAway) ||
           (m.home === liveAway && m.away === liveHome)
    );
    const liveEntry = {
      home: liveHome, away: liveAway,
      hg: finalHg, ag: finalAg, minute: minute,
      group: match.group, venue: match.venue
    };
    if (existingIdx >= 0) {
      this._liveMatches[existingIdx] = liveEntry;
    } else {
      this._liveMatches.push(liveEntry);
    }

    return true;
  },

  // ── 基于时间自动分类比赛（无API时的降级方案）──
  _autoClassifyByTime() {
    if (!WC2026_DATA || !WC2026_DATA.upcomingMatches) return;
    if (typeof App === 'undefined') return;

    const now = App._nowBJ();
    const toRemove = [];

    WC2026_DATA.upcomingMatches.forEach((m, idx) => {
      const matchTime = App._parseMatchTime(m.date, m.time);
      if (!matchTime) return;

      const diffMin = (now.getTime() - matchTime.getTime()) / 60000;

      // 如果比赛开球超过120分钟，且没有实时比分，标记为可能已结束
      // 但我们不会自动添加比分（因为没有数据源），只标记状态
      if (diffMin > 120 && !m.liveScore) {
        m.status = 'likely_completed';
        // 注意：不自动移到completed，因为没有实际比分
      } else if (diffMin > 5 && diffMin <= 120) {
        if (m.status !== 'live') {
          m.status = 'live';
        }
      }
    });
  },

  // ── 比赛后更新球队统计 ──
  _updateTeamStatsAfterMatch(homeTeam, awayTeam, hg, ag) {
    const homeStats = WC2026_DATA.teamStats?.[homeTeam];
    const awayStats = WC2026_DATA.teamStats?.[awayTeam];

    if (homeStats) {
      // 更新 recentForm
      const form = homeStats.recentForm || [];
      if (hg > ag) form.unshift('W');
      else if (hg < ag) form.unshift('L');
      else form.unshift('D');
      homeStats.recentForm = form.slice(0, 5);

      // 微调 form 评分
      if (hg > ag) homeStats.form = Math.min(10, (homeStats.form || 7) + 0.1);
      else if (hg < ag) homeStats.form = Math.max(4, (homeStats.form || 7) - 0.2);
    }

    if (awayStats) {
      const form = awayStats.recentForm || [];
      if (ag > hg) form.unshift('W');
      else if (ag < hg) form.unshift('L');
      else form.unshift('D');
      awayStats.recentForm = form.slice(0, 5);

      if (ag > hg) awayStats.form = Math.min(10, (awayStats.form || 7) + 0.1);
      else if (ag < hg) awayStats.form = Math.max(4, (awayStats.form || 7) - 0.2);
    }
  },

  // ── 匹配球队名称（API名 → 本地名）──
  _matchTeamName(apiName) {
    if (!apiName) return null;
    const nameMap = {
      'Argentina': 'Argentina', 'Spain': 'Spain', 'France': 'France',
      'England': 'England', 'Portugal': 'Portugal', 'Brazil': 'Brazil',
      'Morocco': 'Morocco', 'Netherlands': 'Netherlands', 'Belgium': 'Belgium',
      'Germany': 'Germany', 'Croatia': 'Croatia', 'Colombia': 'Colombia',
      'Mexico': 'Mexico', 'Senegal': 'Senegal', 'Uruguay': 'Uruguay',
      'USA': 'USA', 'Japan': 'Japan', 'Switzerland': 'Switzerland',
      'Iran': 'Iran', 'Turkey': 'Turkey', 'Ecuador': 'Ecuador',
      'Austria': 'Austria', 'South Korea': 'South Korea', 'Korea Republic': 'South Korea',
      'Australia': 'Australia', 'Algeria': 'Algeria', 'Egypt': 'Egypt',
      'Canada': 'Canada', 'Norway': 'Norway', 'Ivory Coast': 'Ivory Coast',
      'Cote d\'Ivoire': 'Ivory Coast', 'Panama': 'Panama',
      'Sweden': 'Sweden', 'Czech Republic': 'Czech Republic', 'Czechia': 'Czech Republic',
      'Paraguay': 'Paraguay', 'Scotland': 'Scotland', 'Tunisia': 'Tunisia',
      'DR Congo': 'DR Congo', 'Congo DR': 'DR Congo',
      'Uzbekistan': 'Uzbekistan', 'Jordan': 'Jordan',
      'Saudi Arabia': 'Saudi Arabia', 'Cape Verde': 'Cape Verde', 'Cabo Verde': 'Cape Verde', 'Cape Verde Islands': 'Cape Verde',
      'Ghana': 'Ghana', 'New Zealand': 'New Zealand',
      'South Africa': 'South Africa', 'Bosnia': 'Bosnia', 'Bosnia-H.': 'Bosnia',
      'Bosnia and Herzegovina': 'Bosnia',
      'Qatar': 'Qatar', 'Haiti': 'Haiti', 'Curacao': 'Curacao', 'Curaçao': 'Curacao',
      'Iraq': 'Iraq',
      'United States': 'USA',
      'Korea Republic': 'South Korea'
    };
    // 直接匹配
    if (nameMap[apiName]) return nameMap[apiName];
    // 模糊匹配：去掉特殊字符后比对
    const normalize = s => s.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const normInput = normalize(apiName);
    for (const [k, v] of Object.entries(nameMap)) {
      if (normalize(k) === normInput) return v;
    }
    return null;
  },

  // =============================================
  //  3. 获取当前所有进行中的比赛
  // =============================================

  getLiveMatches() {
    return this._liveMatches;
  },

  hasLiveMatches() {
    return this._liveMatches.length > 0;
  },

  // =============================================
  //  4. 赛前情报（伤停/阵容/新闻）— 通过 AI 引擎获取
  // =============================================

  async fetchMatchIntelligence(homeTeam, awayTeam, matchDate) {
    const cacheKey = `${homeTeam}|${awayTeam}|${matchDate}`;
    if (this._intelligenceCache[cacheKey]) {
      const cached = this._intelligenceCache[cacheKey];
      if (Date.now() - cached.timestamp < 30 * 60 * 1000) {
        return cached.data;
      }
    }

    const localIntel = this._getLocalInjuryData(homeTeam, awayTeam);
    let aiIntel = null;
    if (typeof AIEngine !== 'undefined' && AIEngine.isConfigured()) {
      aiIntel = await this._fetchAIIntelligence(homeTeam, awayTeam);
    }

    const intel = {
      home: {
        team: homeTeam,
        injuries: localIntel.homeInjuries,
        lineup: localIntel.homeLineup,
        news: aiIntel?.homeNews || [],
        availability: localIntel.homeAvailability,
      },
      away: {
        team: awayTeam,
        injuries: localIntel.awayInjuries,
        lineup: localIntel.awayLineup,
        news: aiIntel?.awayNews || [],
        availability: localIntel.awayAvailability,
      },
      keyFactors: aiIntel?.keyFactors || localIntel.keyFactors,
      source: aiIntel ? 'ai+local' : 'local',
      fetchedAt: new Date().toISOString()
    };

    this._intelligenceCache[cacheKey] = { data: intel, timestamp: Date.now() };
    return intel;
  },

  // ── 从本地数据获取伤停信息 ──
  _getLocalInjuryData(homeTeam, awayTeam) {
    const homeDetail = WC2026_DATA.teamDetails?.[homeTeam] || WC2026_DATA._simpleTeamDetails?.[homeTeam];
    const awayDetail = WC2026_DATA.teamDetails?.[awayTeam] || WC2026_DATA._simpleTeamDetails?.[awayTeam];
    const homeStats = WC2026_DATA.teamStats?.[homeTeam];
    const awayStats = WC2026_DATA.teamStats?.[awayTeam];

    const homeInjuries = homeDetail?.injuries || [];
    const awayInjuries = awayDetail?.injuries || [];

    const homeAvailability = this._calcAvailability(homeTeam, homeInjuries, homeStats);
    const awayAvailability = this._calcAvailability(awayTeam, awayInjuries, awayStats);

    let keyFactors = [];
    if (homeAvailability < 0.7) keyFactors.push(`${homeTeam}主力缺阵严重，实力大幅下降`);
    if (awayAvailability < 0.7) keyFactors.push(`${awayTeam}主力缺阵严重，实力大幅下降`);
    if (homeAvailability >= 0.9 && awayAvailability < 0.7) keyFactors.push(`${awayTeam}伤停严重而${homeTeam}阵容齐整`);
    if (awayAvailability >= 0.9 && homeAvailability < 0.7) keyFactors.push(`${homeTeam}伤停严重而${awayTeam}阵容齐整`);

    return {
      homeInjuries: Array.isArray(homeInjuries) ? homeInjuries : [],
      awayInjuries: Array.isArray(awayInjuries) ? awayInjuries : [],
      homeLineup: null,
      awayLineup: null,
      homeAvailability,
      awayAvailability,
      keyFactors
    };
  },

  // ── 阵容完整度计算 ──
  _calcAvailability(team, injuries, stats) {
    if (!injuries || injuries.length === 0) return 1.0;
    let impact = 0;
    for (const inj of injuries) {
      const status = (inj.status || '').toLowerCase();
      const type = (inj.type || '').toLowerCase();
      if (status.includes('缺席') || status.includes('out') || status.includes('赛季报销')) {
        impact += 0.25;
      } else if (status.includes('疑') || status.includes('doubtful') || status.includes('恢复中')) {
        impact += 0.12;
      } else {
        impact += 0.15;
      }
      if (type.includes('膝') || type.includes('十字') || type.includes('骨折')) {
        impact += 0.1;
      }
    }
    return Math.max(0.3, 1.0 - Math.min(impact, 0.7));
  },

  // ── 通过服务器代理获取 AI 情报（密钥在服务端）──
  async _fetchAIIntelligence(homeTeam, awayTeam) {
    const homeZh = App.zhName(homeTeam);
    const awayZh = App.zhName(awayTeam);

    const prompt = `你是足球情报分析师，请提供2026年FIFA世界杯${homeZh}对阵${awayZh}的最新赛前情报。
请严格按JSON格式返回：
{
  "homeNews": ["${homeZh}的2-3条关键新闻"],
  "awayNews": ["${awayZh}的2-3条关键新闻"],
  "keyFactors": ["影响本场的2-3个关键因素"],
  "homeKeyAbsent": "主力缺席姓名，无则写'无'",
  "awayKeyAbsent": "主力缺席姓名，无则写'无'",
  "confidence": "高/中/低"
}
注意：信息必须基于2026年6月的最新消息，伤停信息最重要。`;

    try {
      const response = await fetch('/api/ai-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: prompt }),
      });

      if (!response.ok) {
        console.warn('[LiveData] AI情报代理不可用 (HTTP ' + response.status + ')');
        return null;
      }

      const data = await response.json();
      if (data.error) {
        console.warn('[LiveData] AI情报获取失败:', data.message);
        return null;
      }

      // 优先使用服务端解析的 JSON
      if (data.parsed) return data.parsed;

      // 手动解析
      const content = data.content;
      if (!content) return null;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return null;

    } catch (e) {
      console.warn('[LiveData] AI情报获取失败:', e.message);
      return null;
    }
  },

  // =============================================
  //  5. 预测模型增强：伤停调整
  // =============================================

  adjustStatsForInjuries(team, baseStats, intelligence) {
    if (!intelligence || !baseStats) return baseStats;

    const teamIntel = intelligence.home?.team === team ? intelligence.home : intelligence.away;
    if (!teamIntel) return baseStats;

    const avail = teamIntel.availability ?? 1.0;

    let attackAdj = 0, defenseAdj = 0, formAdj = 0;

    if (avail < 0.35) { attackAdj -= 2.5; defenseAdj -= 2.0; formAdj -= 1.5; }
    else if (avail < 0.5) { attackAdj -= 1.8; defenseAdj -= 1.4; formAdj -= 1.0; }
    else if (avail < 0.65) { attackAdj -= 1.2; defenseAdj -= 0.9; formAdj -= 0.7; }
    else if (avail < 0.8) { attackAdj -= 0.6; defenseAdj -= 0.4; formAdj -= 0.3; }
    else if (avail < 0.9) { attackAdj -= 0.2; defenseAdj -= 0.1; formAdj -= 0.1; }

    const news = (teamIntel.news || []).join(' ');
    const injuries = (teamIntel.injuries || []).map(i => i.name || '').join(' ');
    const absentText = news + ' ' + injuries;
    const starPlayer = baseStats.starPlayer || '';

    if (starPlayer) {
      const starNames = starPlayer.split(/[\/、,]/);
      for (const name of starNames) {
        if (name.trim() && absentText.includes(name.trim())) {
          attackAdj -= 0.5;
          formAdj -= 0.3;
        }
      }
    }

    return {
      ...baseStats,
      attack: Math.max(4.0, baseStats.attack + attackAdj),
      defense: Math.max(4.0, baseStats.defense + defenseAdj),
      form: Math.max(4.0, (baseStats.form || 7.0) + formAdj),
      _originalAttack: baseStats.attack,
      _originalDefense: baseStats.defense,
      _injuryAdj: { attackAdj, defenseAdj, formAdj, availability: avail }
    };
  },

  // =============================================
  //  6. 自动刷新
  // =============================================

  startAutoRefresh(intervalMs) {
    this.stopAutoRefresh();

    // 首次同步
    this.syncAllScores();

    // 根据是否有比赛进行中，动态调整刷新频率
    this._refreshInterval = setInterval(async () => {
      await this.syncAllScores();
      // 通知 App 重新渲染
      if (typeof App !== 'undefined') {
        App.renderTodayMatches();
        App.renderResults();
        App.renderGroups();
        App.renderSchedule();
        App._updateFreshnessDisplay();
        // 同步App的UI倒计时
        if (this.hasLiveMatches() && App._refreshCountdown > 30) {
          App.startAutoRefresh();
        } else if (!this.hasLiveMatches() && App._refreshCountdown <= 30 && App._refreshCountdown > 0) {
          App.startAutoRefresh();
        }
      }
    }, intervalMs || 60000);
  },

  stopAutoRefresh() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  },

  // =============================================
  //  7. 数据新鲜度指示
  // =============================================

  getDataFreshness() {
    const now = Date.now();
    const lastFetch = this._lastFetchTime ? this._lastFetchTime.getTime() : 0;
    const ageMs = now - lastFetch;
    const ageMin = Math.floor(ageMs / 60000);

    let level = 'stale', label = '数据可能过期', color = '#ef4444';

    if (ageMs < 60000) { level = 'fresh'; label = '刚刚更新'; color = '#22c55e'; }
    else if (ageMs < 300000) { level = 'recent'; label = `${ageMin}分钟前更新`; color = '#fbbf24'; }
    else if (ageMs < 1800000) { level = 'aging'; label = `${ageMin}分钟前更新`; color = '#f97316'; }

    const hasApi = this._dataSource === 'api';
    let sourceLabel = hasApi ? '🌐 服务器代理实时' : '📦 本地数据';

    return { level, label, color, source: this._dataSource, sourceLabel, lastFetch: this._lastFetchTime };
  },

  // ── 手动刷新 ──
  async manualRefresh() {
    this._intelligenceCache = {};
    await this.syncAllScores();
    return true;
  },

  // =============================================
  //  8. API Key 管理
  // =============================================

  setAPIFootballKey(key) {
    this._afApiKey = key;
    try { localStorage.setItem('af_api_key', key); } catch(e) {}
  },

  setFootballDataKey(key) {
    this._fdApiKey = key;
    try { localStorage.setItem('fd_api_key', key); } catch(e) {}
  },

  getAPIFootballKey() { return this._afApiKey; },
  getFootballDataKey() { return this._fdApiKey; },

  // =============================================
  //  9. 初始化
  // =============================================

  async init() {
    // API 密钥已全部移至服务端 server.js
    // 客户端通过 /api/scores 和 /api/ai-analysis 代理访问
    try {
      const afKey = localStorage.getItem('af_api_key');
      if (afKey) this._afApiKey = afKey;
    } catch (e) {}

    console.log('[LiveData] ✅ 初始化 — 服务器代理模式（/api/scores），5分钟自动刷新（比赛进行中30秒）');

    // 首次同步（等待完成后再继续）
    await this.syncAllScores();

    // 启动自动刷新：常规5分钟
    this.startAutoRefresh(this._normalRefreshMs);

    // 检测是否有进行中比赛，动态加速到30秒
    setInterval(() => {
      if (this.hasLiveMatches()) {
        if (!this._fastRefreshActive) {
          this._fastRefreshActive = true;
          console.log('[LiveData] 🔴 检测到进行中比赛，加速到30秒刷新');
          this.startAutoRefresh(this._liveRefreshMs);
        }
      } else {
        if (this._fastRefreshActive) {
          this._fastRefreshActive = false;
          console.log('[LiveData] ⚪ 无进行中比赛，恢复5分钟刷新');
          this.startAutoRefresh(this._normalRefreshMs);
        }
      }
    }, 60000);
  }
};
