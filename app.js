// ============================================
// app.js — UI Controller v3 (精简 + 天气 + 三重比分)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {

  // ── 动态日期：基于北京时间自动计算 ──
  get todayDate() {
    const bj = this._nowBJ();
    return `${bj.getMonth()+1}月${bj.getDate()}日`;
  },
  get tomorrowDate() {
    const bj = this._nowBJ();
    bj.setDate(bj.getDate() + 1);
    return `${bj.getMonth()+1}月${bj.getDate()}日`;
  },
  // 缓存避免重复计算
  _todayDateCache: null,
  _todayDateCacheTime: 0,
  getTodayDateCached() {
    const now = Date.now();
    if (now - this._todayDateCacheTime > 60000) { // 每分钟刷新一次
      const bj = this._nowBJ();
      this._todayDateCache = `${bj.getMonth()+1}月${bj.getDate()}日`;
      this._todayDateCacheTime = now;
    }
    return this._todayDateCache;
  },
  _currentPredResult: null,
  _refreshTimer: null,
  _refreshCountdown: 300, // 5分钟刷新一次
  _selectedTodayIdx: undefined,
  _selectedTomorrowIdx: undefined,
  _selectedTeam: null,
  _teamDetailTab: 'squad',

  // ── 获取当前北京时间 ──
  _nowBJ() {
    const now = new Date();
    // UTC+8
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 3600000);
  },

  // ── 解析赛程日期+时间为北京时间 Date 对象 ──
  _parseMatchTime(dateStr, timeStr) {
    if (!timeStr) return null;
    // dateStr: "6月15日"  timeStr: "10:00"
    const dm = dateStr.match(/(\d+)月(\d+)日/);
    const tm = timeStr.match(/(\d+):(\d+)/);
    if (!dm || !tm) return null;
    const d = this._nowBJ();
    d.setMonth(parseInt(dm[1]) - 1, parseInt(dm[2]));
    d.setHours(parseInt(tm[1]), parseInt(tm[2]), 0, 0);
    return d;
  },

  // ── 北京时间 → 当地时间 ──
  // Returns { localTime: "15:00", country: "MX", city: "墨西哥城", dayOffset: 0|-1|1 }
  _getLocalTime(bjTimeStr, venue) {
    const tz = WC2026_DATA.venueTimezone[venue];
    if (!tz) return null;
    const tm = bjTimeStr.match(/(\d+):(\d+)/);
    if (!tm) return null;
    let bjHour = parseInt(tm[1]);
    const min = parseInt(tm[2]);
    // BJ = UTC+8, local = UTC + tz.offset
    // local = BJ + (tz.offset - 8)
    let localHour = bjHour + (tz.offset - 8);
    let dayOffset = 0;
    if (localHour < 0) { localHour += 24; dayOffset = -1; }
    if (localHour >= 24) { localHour -= 24; dayOffset = 1; }
    return {
      localTime: `${String(localHour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      country: tz.country,
      city: tz.city,
      dayOffset
    };
  },

  // ── 格式化双时区时间HTML ──
  _formatDualTime(bjTimeStr, venue) {
    const local = this._getLocalTime(bjTimeStr, venue);
    let bjLabel = `<span class="time-bj">🇨🇳 ${bjTimeStr}</span>`;
    if (!local) return bjLabel;
    const dayMarker = local.dayOffset === -1 ? '<span class="time-day-offset">前日</span>'
                    : local.dayOffset === 1 ? '<span class="time-day-offset">次日</span>' : '';
    const localLabel = `<span class="time-local">📍 ${local.localTime} ${local.country}</span>${dayMarker}`;
    return `<span class="dual-time">${bjLabel}<span class="time-sep">|</span>${localLabel}</span>`;
  },

  // ── 格式化双时区时间HTML（精简版，用于小卡片） ──
  _formatDualTimeCompact(bjTimeStr, venue) {
    const local = this._getLocalTime(bjTimeStr, venue);
    let bjLabel = `🇨🇳${bjTimeStr}`;
    if (!local) return bjLabel;
    const dayMarker = local.dayOffset === -1 ? '(前日)' : local.dayOffset === 1 ? '(次日)' : '';
    return `${bjLabel} | 📍${local.localTime} ${local.country}${dayMarker}`;
  },

  // ── 判断比赛状态 ──
  _getMatchStatus(dateStr, timeStr) {
    const matchTime = this._parseMatchTime(dateStr, timeStr);
    if (!matchTime) return 'upcoming'; // 无时间默认待赛

    const now = this._nowBJ();
    const diffMs = matchTime.getTime() - now.getTime();
    const diffMin = diffMs / 60000;

    if (diffMin > 5) return 'upcoming'; // 开球5分钟前=待赛
    if (diffMin > -110) return 'live';  // 开球后~105分钟=进行中
    return 'completed'; // 超过110分钟=已结束
  },

  // ── 倒计时文本 ──
  _countdownText(dateStr, timeStr) {
    const matchTime = this._parseMatchTime(dateStr, timeStr);
    if (!matchTime) return '';
    const now = this._nowBJ();
    const diffMs = matchTime.getTime() - now.getTime();
    if (diffMs <= 0) return t('common.kickoff');

    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor((diffMs % 3600000) / 60000);
    const lang = (typeof I18n !== 'undefined') ? I18n.lang : 'zh';
    if (diffH > 24) {
      const days = Math.floor(diffH/24);
      return lang === 'zh' ? `${days}天后` : lang === 'es' ? `En ${days} días` : lang === 'fr' ? `Dans ${days} jours` : `In ${days} days`;
    }
    if (diffH > 0) {
      return lang === 'zh' ? `${diffH}小时${diffM}分后` : lang === 'es' ? `En ${diffH}h ${diffM}m` : lang === 'fr' ? `Dans ${diffH}h ${diffM}m` : `In ${diffH}h ${diffM}m`;
    }
    if (diffM > 0) {
      return lang === 'zh' ? `${diffM}分钟后` : lang === 'es' ? `En ${diffM} min` : lang === 'fr' ? `Dans ${diffM} min` : `In ${diffM} min`;
    }
    return t('common.kickoff');
  },

  async init() {
    this.initNav();
    // 先初始化实时数据层，等待数据同步完成后再渲染
    if (typeof LiveData !== 'undefined') {
      await LiveData.init();
    }
    // 数据就绪后再渲染所有模块
    this.renderTodayMatches();
    this.renderSchedule();
    this.renderResults();
    this.renderGroups();
    this.renderBracket();
    this.renderTeamsPower();
    this.initFilters();
    this.initDeepSeek();
    this.initTeamSearch();
    this.startAutoRefresh();
    this.updateRefreshStatus();
    this._initResizeHandler();
    this._initDayChangeDetector();
    this._initDataFreshnessIndicator();

    // 监听语言切换事件，切换后重新渲染所有动态内容
    document.addEventListener('langchange', () => {
      this.renderTodayMatches();
      this.renderSchedule();
      this.renderResults();
      this.renderGroups();
      this.renderBracket();
      this.renderTeamsPower();
      this.initDeepSeek();
    });
  },

  // ── Helper: Get localized group label (e.g., "A组" / "Group A" / "Grupo A" / "Groupe A") ──
  groupLabel(group) {
    const lang = (typeof I18n !== 'undefined') ? I18n.lang : 'zh';
    if (lang === 'zh') return `${group}组`;
    if (lang === 'es') return `Grupo ${group}`;
    if (lang === 'fr') return `Groupe ${group}`;
    return `Group ${group}`;
  },

  // ── Helper: Get localized venue/city name ──
  venueName(venue) {
    if (typeof I18n !== 'undefined' && I18n.cityName) {
      return I18n.cityName(venue);
    }
    return venue;
  },

  // ── Helper: Get localized team name (uses i18n) ──
  zhName(en) {
    if (typeof I18n !== 'undefined' && I18n.teamName) {
      return I18n.teamName(en);
    }
    return WC2026_DATA.teamZhName[en] || en;
  },

  // ── Helper: Get team emoji ──
  emoji(en) {
    return WC2026_DATA.teamEmoji[en] || '🏴';
  },

  // ── Auto Refresh ──
  // UI倒计时刷新渲染，LiveData层自动同步
  // 有比赛进行时30秒刷新，无比赛时5分钟刷新
  startAutoRefresh() {
    const hasLive = (typeof LiveData !== 'undefined') && LiveData.hasLiveMatches();
    this._refreshCountdown = hasLive ? 30 : 300;
    clearInterval(this._refreshTimer);
    this._refreshTimer = setInterval(() => {
      this._refreshCountdown--;
      this.updateRefreshStatus();
      if (this._refreshCountdown <= 0) {
        this.doRefresh();
      }
    }, 1000);
  },

  async doRefresh() {
    const hasLive = (typeof LiveData !== 'undefined') && LiveData.hasLiveMatches();
    this._refreshCountdown = hasLive ? 30 : 300;
    // 先同步实时数据（LiveData从live-data-inline.js重新加载最新数据）
    if (typeof LiveData !== 'undefined') {
      await LiveData.syncAllScores();
    }
    // Re-render all sections with updated data
    this.renderTodayMatches();
    this.renderSchedule();
    this.renderGroups();
    this.renderBracket();
    this.renderResults();
    // If a match is selected, re-run prediction
    if (this._selectedTodayIdx !== undefined) {
      this.showDayPrediction('today', this._selectedTodayIdx);
    } else if (this._selectedTomorrowIdx !== undefined) {
      this.showDayPrediction('tomorrow', this._selectedTomorrowIdx);
    }
    const el = document.getElementById('refreshTime');
    if (el) el.textContent = this._nowBJ().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    this.showRefreshFlash();
    this._updateFreshnessDisplay();
  },

  updateRefreshStatus() {
    const el = document.getElementById('refreshCountdown');
    if (el) {
      const mins = Math.floor(this._refreshCountdown / 60);
      const secs = this._refreshCountdown % 60;
      el.textContent = `${mins}:${String(secs).padStart(2,'0')}`;
    }
  },

  showRefreshFlash() {
    const bar = document.getElementById('refreshBar');
    if (bar) {
      bar.classList.add('flash');
      setTimeout(() => bar.classList.remove('flash'), 1000);
    }
  },

  // ── Navigation ──
  initNav() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
      });
    });
  },

  // ── Get today's matches ──
  getTodayMatches() {
    return WC2026_DATA.upcomingMatches.filter(m => m.date === this.todayDate);
  },

  // ── Get completed matches for today ──
  getTodayCompletedMatches() {
    return WC2026_DATA.completedResults.filter(r => r.date === this.todayDate);
  },

  // ── Get tomorrow's matches ──
  getTomorrowMatches() {
    return WC2026_DATA.upcomingMatches.filter(m => m.date === this.tomorrowDate);
  },

  // ── Get completed matches for tomorrow ──
  getTomorrowCompletedMatches() {
    return WC2026_DATA.completedResults.filter(r => r.date === this.tomorrowDate);
  },

  // ── Render Today's Matches Panel ──
  renderTodayMatches() {
    const container = document.getElementById('todayPredictions');
    if (!container) return;

    const todayUpcoming = this.getTodayMatches();
    const todayCompleted = this.getTodayCompletedMatches();

    let html = '';

    // ====== 今日区域标题 ======
    html += `<div class="day-section-header today-section">
      <span class="day-section-icon">📅</span>
      <span class="day-section-title">今日比赛</span>
      <span class="day-section-badge">${this.todayDate}</span>
      <span class="day-section-count">${todayCompleted.length + todayUpcoming.length} 场</span>
    </div>`;

    // 已完成的比赛
    todayCompleted.forEach((r, i) => {
      const hZh = this.zhName(r.home);
      const aZh = this.zhName(r.away);
      const hE = this.emoji(r.home);
      const aE = this.emoji(r.away);
      const dualTime = this._formatDualTime(r.time, r.venue);
      html += `
        <div class="today-match-card completed-today">
          <div class="today-match-group">🏆 ${r.group}组 · ${dualTime} · <span style="color:#9ca3af;font-size:10px;">📍 ${r.venue}</span></div>
          <div class="today-match-teams">
            <span class="today-team">${hE} ${hZh}</span>
            <span class="today-vs-score" style="color:#22c55e;font-weight:900;">${r.hg} - ${r.ag}</span>
            <span class="today-team">${aZh} ${aE}</span>
          </div>
          <div class="today-match-status-ft">✅ 终场</div>
        </div>`;
    });

    // 未开始的比赛（含预测 + 伤停情报）
    const todayPredictions = todayUpcoming.map(m => {
      const intel = LiveData._getLocalInjuryData(m.home, m.away);
      return Predictor.predict(m.home, m.away, 'group', { home: { team: m.home, ...intel, injuries: intel.homeInjuries, availability: intel.homeAvailability }, away: { team: m.away, ...intel, injuries: intel.awayInjuries, availability: intel.awayAvailability }, keyFactors: intel.keyFactors });
    });

    todayUpcoming.forEach((m, i) => {
      const pred = todayPredictions[i];
      const hZh = this.zhName(m.home);
      const aZh = this.zhName(m.away);
      const hE = this.emoji(m.home);
      const aE = this.emoji(m.away);

      // 优先使用数据中的 status，否则用时间推算
      const matchStatus = m.status || this._getMatchStatus(m.date, m.time);
      const countdown = this._countdownText(m.date, m.time);
      const isSelected = (this._selectedTodayIdx === i);

      let statusHtml = '';
      if (matchStatus === 'live' || m.liveScore) {
        const liveHg = m.liveScore?.hg ?? '-';
        const liveAg = m.liveScore?.ag ?? '-';
        const liveMin = m.liveScore?.min ?? "🔴";
        statusHtml = `<div class="today-match-live">🔴 进行中 · ${liveMin}</div><div class="live-score-display" style="text-align:center;font-size:24px;font-weight:900;color:#ef4444;margin:4px 0;">${liveHg} - ${liveAg}</div>`;
      } else if (matchStatus === 'likely_completed') {
        statusHtml = '<div class="today-match-live" style="color:#f97316;">⏳ 预计已结束 · 等待比分确认</div>';
      } else {
        const dualTime = this._formatDualTime(m.time, m.venue);
        statusHtml = `<div class="today-match-countdown">${dualTime} · ${countdown}</div>`;
      }

      html += `
        <div class="today-match-card${isSelected ? ' selected' : ''}${(matchStatus === 'live' || m.liveScore) ? ' live-match' : ''}" data-idx="${i}" data-day="today" onclick="App.showDayPrediction('today',${i})">
          <div class="today-match-group">🏆 ${this.groupLabel(m.group)} · <span style="color:#9ca3af;font-size:10px;">📍 ${this.venueName(m.venue)}</span></div>
          <div class="today-match-teams">
            <span class="today-team">${hE} ${hZh}</span>
            ${m.liveScore ? `<span class="today-vs-score" style="color:#ef4444;font-weight:900;">${m.liveScore.hg} - ${m.liveScore.ag}</span>` : '<span class="today-vs">VS</span>'}
            <span class="today-team">${aZh} ${aE}</span>
          </div>
          ${!m.liveScore && !pred.error ? `
            <div class="match-three-scores">
              <div class="score-tag primary" title="首选比分">🥇 ${pred.primaryScore.home}:${pred.primaryScore.away} <span class="pct">${pred.primaryScore.pct}%</span></div>
              <div class="score-tag secondary" title="次选比分">🥈 ${pred.secondaryScore.home}:${pred.secondaryScore.away} <span class="pct">${pred.secondaryScore.pct}%</span></div>
              <div class="score-tag defensive" title="防冷比分">🎯 ${pred.defensiveScore.home}:${pred.defensiveScore.away} <span class="pct">${pred.defensiveScore.pct}%</span></div>
            </div>
            <div class="today-probs">
              <span class="prob-chip home">主胜 ${Math.round(pred.homeWinProb*100)}%</span>
              <span class="prob-chip draw">平 ${Math.round(pred.drawProb*100)}%</span>
              <span class="prob-chip away">客胜 ${Math.round(pred.awayWinProb*100)}%</span>
            </div>
          ` : ''}
          ${statusHtml}
          <div id="weather-card-today-${i}" class="weather-mini">
            <span class="weather-loading">⏳ 获取天气...</span>
          </div>
          <button class="today-match-predict-btn" onclick="event.stopPropagation(); App.showDayPrediction('today',${i})">
            📊 ${I18n.lang === 'zh' ? '查看完整AI分析' : I18n.lang === 'es' ? 'Ver análisis IA completo' : I18n.lang === 'fr' ? 'Voir l\'analyse IA complète' : 'View Full AI Analysis'}
          </button>
        </div>
      `;
    });

    // ====== 明日区域 ======
    const tomorrowUpcoming = this.getTomorrowMatches();
    const tomorrowCompleted = this.getTomorrowCompletedMatches();

    html += `<div class="day-section-header tomorrow-section">
      <span class="day-section-icon">📆</span>
      <span class="day-section-title">明日比赛</span>
      <span class="day-section-badge tomorrow">${this.tomorrowDate}</span>
      <span class="day-section-count">${tomorrowCompleted.length + tomorrowUpcoming.length} 场</span>
    </div>`;

    // 明日已完赛（罕见但支持）
    tomorrowCompleted.forEach((r, i) => {
      const hZh = this.zhName(r.home);
      const aZh = this.zhName(r.away);
      const hE = this.emoji(r.home);
      const aE = this.emoji(r.away);
      const dualTime = this._formatDualTime(r.time, r.venue);
      html += `
        <div class="today-match-card completed-today">
          <div class="today-match-group">🏆 ${r.group}组 · ${dualTime} · <span style="color:#9ca3af;font-size:10px;">📍 ${r.venue}</span></div>
          <div class="today-match-teams">
            <span class="today-team">${hE} ${hZh}</span>
            <span class="today-vs-score" style="color:#22c55e;font-weight:900;">${r.hg} - ${r.ag}</span>
            <span class="today-team">${aZh} ${aE}</span>
          </div>
          <div class="today-match-status-ft">✅ 终场</div>
        </div>`;
    });

    // 明日未赛比赛
    const tomorrowPredictions = tomorrowUpcoming.map(m => {
      const intel = LiveData._getLocalInjuryData(m.home, m.away);
      return Predictor.predict(m.home, m.away, 'group', { home: { team: m.home, ...intel, injuries: intel.homeInjuries, availability: intel.homeAvailability }, away: { team: m.away, ...intel, injuries: intel.awayInjuries, availability: intel.awayAvailability }, keyFactors: intel.keyFactors });
    });

    tomorrowUpcoming.forEach((m, i) => {
      const pred = tomorrowPredictions[i];
      const hZh = this.zhName(m.home);
      const aZh = this.zhName(m.away);
      const hE = this.emoji(m.home);
      const aE = this.emoji(m.away);

      const matchStatus = m.status || this._getMatchStatus(m.date, m.time);
      const countdown = this._countdownText(m.date, m.time);
      const isSelected = (this._selectedTomorrowIdx === i);

      let statusHtml = '';
      if (matchStatus === 'live' || m.liveScore) {
        const liveHg = m.liveScore?.hg ?? '-';
        const liveAg = m.liveScore?.ag ?? '-';
        const liveMin = m.liveScore?.min ?? "🔴";
        statusHtml = `<div class="today-match-live">🔴 进行中 · ${liveMin}</div><div class="live-score-display" style="text-align:center;font-size:24px;font-weight:900;color:#ef4444;margin:4px 0;">${liveHg} - ${liveAg}</div>`;
      } else {
        const dualTime = this._formatDualTime(m.time, m.venue);
        statusHtml = `<div class="today-match-countdown">${dualTime} · ${countdown}</div>`;
      }

      html += `
        <div class="today-match-card tomorrow-card${isSelected ? ' selected' : ''}${(matchStatus === 'live' || m.liveScore) ? ' live-match' : ''}" data-idx="${i}" data-day="tomorrow" onclick="App.showDayPrediction('tomorrow',${i})">
          <div class="today-match-group">🏆 ${this.groupLabel(m.group)} · <span style="color:#9ca3af;font-size:10px;">📍 ${this.venueName(m.venue)}</span></div>
          <div class="today-match-teams">
            <span class="today-team">${hE} ${hZh}</span>
            ${m.liveScore ? `<span class="today-vs-score" style="color:#ef4444;font-weight:900;">${m.liveScore.hg} - ${m.liveScore.ag}</span>` : '<span class="today-vs">VS</span>'}
            <span class="today-team">${aZh} ${aE}</span>
          </div>
          ${!m.liveScore && !pred.error ? `
            <div class="match-three-scores">
              <div class="score-tag primary" title="首选比分">🥇 ${pred.primaryScore.home}:${pred.primaryScore.away} <span class="pct">${pred.primaryScore.pct}%</span></div>
              <div class="score-tag secondary" title="次选比分">🥈 ${pred.secondaryScore.home}:${pred.secondaryScore.away} <span class="pct">${pred.secondaryScore.pct}%</span></div>
              <div class="score-tag defensive" title="防冷比分">🎯 ${pred.defensiveScore.home}:${pred.defensiveScore.away} <span class="pct">${pred.defensiveScore.pct}%</span></div>
            </div>
            <div class="today-probs">
              <span class="prob-chip home">主胜 ${Math.round(pred.homeWinProb*100)}%</span>
              <span class="prob-chip draw">平 ${Math.round(pred.drawProb*100)}%</span>
              <span class="prob-chip away">客胜 ${Math.round(pred.awayWinProb*100)}%</span>
            </div>
          ` : ''}
          ${statusHtml}
          <div id="weather-card-tomorrow-${i}" class="weather-mini">
            <span class="weather-loading">⏳ 获取天气...</span>
          </div>
          <button class="today-match-predict-btn" onclick="event.stopPropagation(); App.showDayPrediction('tomorrow',${i})">
            📊 查看完整AI分析
          </button>
        </div>
      `;
    });

    if (todayCompleted.length + todayUpcoming.length + tomorrowCompleted.length + tomorrowUpcoming.length === 0) {
      html = '<div style="text-align:center;padding:20px;color:var(--text-muted);">今明两日暂无比赛安排</div>';
    }

    container.innerHTML = html;

    this._todayPredictions = todayPredictions;
    this._todayMatches = todayUpcoming;
    this._tomorrowPredictions = tomorrowPredictions;
    this._tomorrowMatches = tomorrowUpcoming;

    // Async: load weather for each match card
    todayUpcoming.forEach((m, i) => this.loadWeatherForCard(m.venue, `today-${i}`));
    tomorrowUpcoming.forEach((m, i) => this.loadWeatherForCard(m.venue, `tomorrow-${i}`));
  },

  // ── Load weather into card ──
  async loadWeatherForCard(venue, idx) {
    const el = document.getElementById(`weather-card-${idx}`);
    if (!el) return;

    const weather = await WeatherModule.fetchWeather(venue);
    if (weather.error) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = `
      <span class="weather-icon">${weather.icon}</span>
      <span class="weather-city">${weather.city}</span>
      <span class="weather-temp">${weather.temp}°C</span>
      <span class="weather-wind">💨${weather.wind}km/h</span>
      <span class="weather-desc">${weather.desc}</span>
      ${weather.mock ? '<span class="weather-mock">估算</span>' : ''}
    `;
    el.title = weather.impact;
  },

  // ── Show prediction for a specific day's match ──
  async showDayPrediction(day, idx) {
    const predictions = day === 'tomorrow' ? this._tomorrowPredictions : this._todayPredictions;
    const matches = day === 'tomorrow' ? this._tomorrowMatches : this._todayMatches;
    const pred = predictions[idx];
    const m = matches[idx];
    if (!pred || pred.error) return;

    // Track selection
    if (day === 'tomorrow') {
      this._selectedTomorrowIdx = idx;
      this._selectedTodayIdx = undefined;
    } else {
      this._selectedTodayIdx = idx;
      this._selectedTomorrowIdx = undefined;
    }

    // Highlight selected card
    document.querySelectorAll('.today-match-card').forEach(c => c.classList.remove('selected'));
    const selector = day === 'tomorrow' ? `.tomorrow-card[data-idx="${idx}"]` : `.today-match-card[data-day="today"][data-idx="${idx}"]`;
    const card = document.querySelector(selector);
    if (card) card.classList.add('selected');

    // Fetch weather and render
    const weather = await WeatherModule.fetchWeather(m.venue);
    this.renderPredictionResultAndDS(pred, true, weather, m);

    document.getElementById('predictionResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // ── Legacy compat ──
  async showTodayPrediction(idx) {
    return this.showDayPrediction('today', idx);
  },

  // ── Render Prediction Result ──
  renderPredictionResult(result, showLottery, weather, matchInfo) {
    const el = document.getElementById('predictionResult');
    if (result.error) { alert(result.message); return; }
    el.style.display = 'block';

    const {
      homeTeam, awayTeam, homeWinProb, drawProb, awayWinProb,
      primaryScore, secondaryScore, defensiveScore,
      distribution, components, homeStats, awayStats,
      homeRank, awayRank, reasoning
    } = result;

    const hZh = this.zhName(homeTeam);
    const aZh = this.zhName(awayTeam);
    const hE = this.emoji(homeTeam);
    const aE = this.emoji(awayTeam);

    // ─ Header ─
    document.getElementById('resultHomeFlag').textContent = hE;
    document.getElementById('resultHomeName').textContent = hZh;
    document.getElementById('resultHomeRank').textContent = homeRank ? `FIFA 排名 #${homeRank.rank}` : '';
    document.getElementById('resultAwayFlag').textContent = aE;
    document.getElementById('resultAwayName').textContent = aZh;
    document.getElementById('resultAwayRank').textContent = awayRank ? `FIFA 排名 #${awayRank.rank}` : '';

    // ─ Weather strip ─
    const weatherEl = document.getElementById('matchWeatherStrip');
    if (weatherEl && weather && !weather.error) {
      weatherEl.innerHTML = `
        <div class="weather-strip">
          <span>${weather.icon} <strong>${weather.city}</strong></span>
          <span>🌡️ ${weather.temp}°C（体感 ${weather.feelsLike}°C）</span>
          <span>💧 湿度 ${weather.humidity}%</span>
          <span>💨 风速 ${weather.wind} km/h</span>
          <span class="weather-impact">${weather.impact}</span>
          ${weather.mock ? '<span style="opacity:.5;font-size:10px;">（估算）</span>' : ''}
        </div>
      `;
      weatherEl.style.display = 'block';
    } else if (weatherEl) {
      weatherEl.style.display = 'none';
    }

    // ─ Three scores ─
    const threeScoresEl = document.getElementById('threeScoresArea');
    if (threeScoresEl) {
      threeScoresEl.innerHTML = `
        <div class="three-scores-grid">
          <div class="ts-card primary-card">
            <div class="ts-label">🥇 首选比分</div>
            <div class="ts-score">${primaryScore.home} : ${primaryScore.away}</div>
            <div class="ts-pct">概率 ${primaryScore.pct}%</div>
            <div class="ts-note">最高概率方案</div>
          </div>
          <div class="ts-card secondary-card">
            <div class="ts-label">🥈 次选比分</div>
            <div class="ts-score">${secondaryScore.home} : ${secondaryScore.away}</div>
            <div class="ts-pct">概率 ${secondaryScore.pct}%</div>
            <div class="ts-note">第二可能方案</div>
          </div>
          <div class="ts-card defensive-card">
            <div class="ts-label">🎯 防冷比分</div>
            <div class="ts-score">${defensiveScore.home} : ${defensiveScore.away}</div>
            <div class="ts-pct">概率 ${defensiveScore.pct}%</div>
            <div class="ts-note">高赔冷门方案</div>
          </div>
        </div>
      `;
    }

    // ─ Win prob bar ─
    const hPct = Math.round(homeWinProb * 100);
    const dPct = Math.round(drawProb * 100);
    const aPct = Math.round(awayWinProb * 100);

    document.getElementById('homeProbBar').style.width = `${hPct}%`;
    document.getElementById('drawProbBar').style.width = `${dPct}%`;
    document.getElementById('awayProbBar').style.width = `${aPct}%`;
    document.getElementById('homeProb').textContent = `${hPct}%`;
    document.getElementById('drawProb').textContent = `${dPct}%`;
    document.getElementById('awayProb').textContent = `${aPct}%`;

    // ─ Reasoning Section ─
    const reasonEl = document.getElementById('reasoningList');
    if (reasonEl && reasoning && reasoning.length > 0) {
      reasonEl.innerHTML = reasoning.map((r, i) => `
        <div class="reason-item" style="animation-delay: ${i * 0.06}s">
          <div class="reason-text">${r}</div>
        </div>
      `).join('');
    }

    // ─ H2H ─
    const h2h = components.h2h;
    const h2hEl = document.getElementById('h2hData');
    h2hEl.innerHTML = `<p style="color:#e8f5ee; margin-bottom:8px;">${h2h.detail}</p>`;
    if (h2h.p > 0) {
      const winPct = Math.round((h2h.homeWin / h2h.p) * 100);
      const drawPctH = Math.round((h2h.draw / h2h.p) * 100);
      const lossPct = 100 - winPct - drawPctH;
      h2hEl.innerHTML += `
        <div class="h2h-bar">
          <div class="h-win" style="width:${winPct}%"></div>
          <div class="h-draw" style="width:${drawPctH}%"></div>
          <div class="h-loss" style="width:${lossPct}%"></div>
        </div>
        <div style="font-size:11px; color:var(--text-dim); display:flex; justify-content:space-between;">
          <span>${hZh} ${winPct}%</span><span>平局 ${drawPctH}%</span><span>${aZh} ${lossPct}%</span>
        </div>`;
    } else {
      h2hEl.innerHTML += `<p style="color:var(--text-dim); font-size:12px;">两队未在世界杯正赛交锋过</p>`;
    }

    // ─ Form ─
    const form = components.form;
    document.getElementById('formData').innerHTML = `
      <div class="metric-row">
        <span class="metric-label">${hE} ${hZh}</span>
        <span class="metric-value">
          ${(homeStats.recentForm || []).map(f => this.formBadge(f)).join(' ')} (${form.homeForm}分)
        </span>
      </div>
      <div class="metric-row">
        <span class="metric-label">${aE} ${aZh}</span>
        <span class="metric-value">
          ${(awayStats.recentForm || []).map(f => this.formBadge(f)).join(' ')} (${form.awayForm}分)
        </span>
      </div>`;

    // ─ Attack & Defense ─
    const ad = components.attackDefense;
    document.getElementById('attackData').innerHTML = `
      <div class="metric-row"><span class="metric-label">${hZh} 进攻</span><span class="metric-value ${ad.homeAttack>=8.5?'high':''}">${ad.homeAttack.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">${hZh} 防守</span><span class="metric-value ${ad.homeDefense>=8.0?'high':''}">${ad.homeDefense.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">${aZh} 进攻</span><span class="metric-value ${ad.awayAttack>=8.5?'high':''}">${ad.awayAttack.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">${aZh} 防守</span><span class="metric-value ${ad.awayDefense>=8.0?'high':''}">${ad.awayDefense.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">预期总进球</span><span class="metric-value">${(parseFloat(result.expectedGoals?.home||1.5)+parseFloat(result.expectedGoals?.away||1.5)).toFixed(1)} 球</span></div>`;

    // ─ Players ─
    document.getElementById('playerData').innerHTML = `
      <div class="metric-row"><span class="metric-label">${hE} 核心球员</span><span class="metric-value" style="font-size:12px;">${homeStats.starPlayer}</span></div>
      <div class="metric-row"><span class="metric-label">${aE} 核心球员</span><span class="metric-value" style="font-size:12px;">${awayStats.starPlayer}</span></div>
      <div class="metric-row"><span class="metric-label">${hZh} 战术</span><span class="metric-value" style="font-size:12px;">${homeStats.style}</span></div>
      <div class="metric-row"><span class="metric-label">${aZh} 战术</span><span class="metric-value" style="font-size:12px;">${awayStats.style}</span></div>
      <div class="metric-row"><span class="metric-label">冠军次数</span><span class="metric-value">${homeStats.worldcupWins}🏆 vs ${awayStats.worldcupWins}🏆</span></div>`;

    // ─ Score distribution ─
    const distGrid = document.getElementById('scoreDistGrid');
    distGrid.innerHTML = distribution.map((item, i) => `
      <div class="score-dist-item${i===0?' top-pick':''}" style="opacity:${1 - i*0.08};">
        <div class="score-dist-score">${item.score}</div>
        <div class="score-dist-pct">${item.pct}%</div>
      </div>`).join('');

    // ─ Lottery ─
    if (showLottery) {
      this.renderLotterySection(result);
    } else {
      const lotSec = document.getElementById('lotterySection');
      if (lotSec) lotSec.style.display = 'none';
    }
  },

  // ── Render Lottery Suggestions ──
  renderLotterySection(result) {
    const lotSec = document.getElementById('lotterySection');
    if (!lotSec) return;
    lotSec.style.display = 'block';

    const { homeTeam, awayTeam, homeWinProb, drawProb, awayWinProb, primaryScore, secondaryScore, defensiveScore } = result;
    const hZh = this.zhName(homeTeam);
    const aZh = this.zhName(awayTeam);
    const totalGoals = primaryScore.home + primaryScore.away;
    const hPct = Math.round(homeWinProb * 100);
    const dPct = Math.round(drawProb * 100);
    const aPct = Math.round(awayWinProb * 100);

    const parlays = [];
    const favTeam = hPct >= aPct ? hZh : aZh;
    const favPct = Math.max(hPct, aPct);

    if (hPct >= 60) {
      parlays.push({ type: '胜负推荐', picks: [{ label: '主胜', detail: `${hZh} 胜 · 概率 ${hPct}%` }], odds: this._estimateOdds(hPct) });
    } else if (aPct >= 60) {
      parlays.push({ type: '胜负推荐', picks: [{ label: '客胜', detail: `${aZh} 胜 · 概率 ${aPct}%` }], odds: this._estimateOdds(aPct) });
    } else {
      parlays.push({ type: '胜负推荐', picks: [{ label: '让球不败', detail: `${favTeam} 不败 · 概率 ${favPct + dPct}%` }], odds: this._estimateOdds(favPct + dPct) });
    }

    parlays.push({
      type: '总进球推荐',
      picks: [{ label: totalGoals >= 3 ? '大球 ≥3' : '小球 ≤2', detail: `预测总进球 ${totalGoals}，${totalGoals>=3?'大球':'小球'}倾向` }],
      odds: totalGoals >= 3 ? 1.80 : 1.75
    });

    parlays.push({
      type: '波胆首选（高赔）',
      picks: [
        { label: `${primaryScore.home}:${primaryScore.away}`, detail: `首选比分 · 概率 ${primaryScore.pct}%` }
      ],
      odds: this._estimateOdds(parseFloat(primaryScore.pct) * 1.5)
    });

    parlays.push({
      type: '波胆次选',
      picks: [
        { label: `${secondaryScore.home}:${secondaryScore.away}`, detail: `次选比分 · 概率 ${secondaryScore.pct}%` }
      ],
      odds: this._estimateOdds(parseFloat(secondaryScore.pct) * 1.5)
    });

    if ((this._todayMatches && this._todayMatches.length >= 1) || (this._tomorrowMatches && this._tomorrowMatches.length >= 1)) {
      // Collect all predictions from today + tomorrow for cross-day parlays
      const allMatches = [];
      const allPreds = [];
      if (this._todayMatches) {
        this._todayMatches.forEach((m, i) => {
          const p = this._todayPredictions[i];
          if (p && !p.error) { allMatches.push({...m, day: 'today'}); allPreds.push(p); }
        });
      }
      if (this._tomorrowMatches) {
        this._tomorrowMatches.forEach((m, i) => {
          const p = this._tomorrowPredictions[i];
          if (p && !p.error) { allMatches.push({...m, day: 'tomorrow'}); allPreds.push(p); }
        });
      }

      // Find a different match for 2串1
      const otherIdx = allPreds.findIndex((p, i) => {
        return p.awayTeam !== homeTeam && p.homeTeam !== awayTeam;
      });
      if (otherIdx >= 0) {
        const oPred = allPreds[otherIdx];
        const oFav = oPred.homeWinProb >= oPred.awayWinProb ? this.zhName(oPred.homeTeam) : this.zhName(oPred.awayTeam);
        const oPct = Math.max(Math.round(oPred.homeWinProb*100), Math.round(oPred.awayWinProb*100));
        const oMatch = allMatches[otherIdx];
        const dayLabel = oMatch.day === 'tomorrow' ? '（明日）' : '';
        parlays.push({
          type: '2串1 推荐',
          picks: [
            { label: '场1', detail: `${favTeam} 不败` },
            { label: `场2${dayLabel}`, detail: `${oFav} 不败` }
          ],
          odds: parseFloat((this._estimateOdds(favPct) * this._estimateOdds(oPct)).toFixed(2))
        });
      }

      // 3串1 if enough matches
      if (allPreds.length >= 3) {
        const picks3 = [];
        let odds3 = 1;
        const used = new Set([homeTeam, awayTeam]);
        for (let k = 0; k < allPreds.length && picks3.length < 2; k++) {
          const ap = allPreds[k];
          if (used.has(ap.homeTeam) || used.has(ap.awayTeam)) continue;
          const fav = ap.homeWinProb >= ap.awayWinProb ? this.zhName(ap.homeTeam) : this.zhName(ap.awayTeam);
          const favP = Math.max(Math.round(ap.homeWinProb*100), Math.round(ap.awayWinProb*100));
          const am = allMatches[k];
          const dl = am.day === 'tomorrow' ? '（明日）' : '';
          picks3.push({ label: `场${picks3.length+2}${dl}`, detail: `${fav} 不败` });
          odds3 *= this._estimateOdds(favP);
          used.add(ap.homeTeam);
          used.add(ap.awayTeam);
        }
        if (picks3.length >= 1) {
          parlays.push({
            type: `${picks3.length + 1}串1 推荐`,
            picks: [{ label: '场1', detail: `${favTeam} 不败` }, ...picks3],
            odds: parseFloat((this._estimateOdds(favPct) * odds3).toFixed(2))
          });
        }
      }
    }

    const grid = document.getElementById('parlayGrid');
    grid.innerHTML = parlays.map(p => `
      <div class="parlay-card">
        <div class="parlay-type">🎯 ${p.type}</div>
        ${p.picks.map(pick => `
          <div class="parlay-pick">
            <strong>${pick.label}</strong>
            <div class="pick-detail">${pick.detail}</div>
          </div>
        `).join('')}
        <div class="parlay-odds">
          <span class="odds-label">参考赔率</span>
          <span class="odds-value">@ ${p.odds.toFixed(2)}</span>
        </div>
      </div>
    `).join('');
  },

  _estimateOdds(pct) {
    if (pct >= 80) return 1.25;
    if (pct >= 70) return 1.45;
    if (pct >= 60) return 1.70;
    if (pct >= 50) return 2.10;
    if (pct >= 40) return 2.80;
    if (pct >= 30) return 3.50;
    if (pct >= 20) return 5.00;
    return 8.00;
  },

  formBadge(f) {
    const colors = { 'W': '#22c55e', 'D': '#eab308', 'L': '#dc2626' };
    return `<span style="display:inline-block;width:20px;height:20px;border-radius:3px;background:${colors[f]||'#4d7a5e'};color:white;font-size:10px;font-weight:700;line-height:20px;text-align:center;">${f}</span>`;
  },

  // ── Schedule Rendering ──
  renderSchedule(filter = 'all') {
    const list = document.getElementById('scheduleList');
    let html = '';

    if (filter === 'all' || filter === 'group' || filter === 'completed') {
      let lastDate = '';
      for (const r of WC2026_DATA.completedResults) {
        if (r.date !== lastDate) {
          html += `<div class="schedule-day-header">📅 ${r.date}</div>`;
          lastDate = r.date;
        }
        const hZh = this.zhName(r.home);
        const aZh = this.zhName(r.away);
        const hE = this.emoji(r.home);
        const aE = this.emoji(r.away);
        const dualTime = this._formatDualTime(r.time, r.venue);
        html += `
          <div class="schedule-match completed" data-type="group" data-status="completed">
            <span class="match-group-badge">${this.groupLabel(r.group)}</span>
            <span class="match-time-badge">${dualTime}</span>
            <div class="match-teams-block">
              <div class="match-teams-row">
                <span class="match-home">${hE} ${hZh}</span>
                <span class="match-score-block" style="color:#22c55e;">${r.hg} - ${r.ag}</span>
                <span class="match-away">${aZh} ${aE}</span>
              </div>
            </div>
            <span class="match-status status-ft">终场</span>
            <span class="match-venue-tag">📍 ${r.venue}</span>
          </div>`;
      }
    }

    if (filter === 'all' || filter === 'group' || filter === 'upcoming') {
      let lastDate = '';
      for (const m of WC2026_DATA.upcomingMatches) {
        if (m.date !== lastDate) {
          html += `<div class="schedule-day-header">📅 ${m.date}</div>`;
          lastDate = m.date;
        }
        const hZh = this.zhName(m.home);
        const aZh = this.zhName(m.away);
        const hE = this.emoji(m.home);
        const aE = this.emoji(m.away);

        // Match status + live score
        const matchStatus = m.status || this._getMatchStatus(m.date, m.time);
        const countdown = this._countdownText(m.date, m.time);
        let statusBadge = '';
        let scoreDisplay = '';

        if (matchStatus === 'live' || m.liveScore) {
          // 有实际实时比分时优先显示真实比分
          if (m.liveScore) {
            statusBadge = `<span class="match-status status-live">🔴 进行中 · ${m.liveScore.min || '--'}</span>`;
            scoreDisplay = `<span class="match-score-block score-live-pulse" style="color:#ef4444;font-weight:900;">${m.liveScore.hg} - ${m.liveScore.ag}</span>`;
          } else {
            statusBadge = '<span class="match-status status-live">🔴 进行中</span>';
            scoreDisplay = '<span class="match-score-block score-live-pulse" style="color:#fbbf24;">VS</span>';
          }
        } else if (matchStatus === 'likely_completed') {
          statusBadge = '<span class="match-status" style="color:#f97316;">⏳ 预计已结束</span>';
          scoreDisplay = '<span class="match-score-block" style="color:#f97316;">待确认</span>';
        } else {
          statusBadge = `<span class="match-status status-upcoming">待赛</span>`;
          scoreDisplay = '<span class="match-score-block upcoming-label">VS</span>';
        }

        // 预测比分（仅非live时显示，live时已在scoreDisplay中显示实际比分）
        let predHtml = '';
        if (matchStatus !== 'live' && !m.liveScore) {
          try {
            const intel2 = LiveData._getLocalInjuryData(m.home, m.away);
            const upPred = Predictor.predict(m.home, m.away, 'group', { home: { team: m.home, ...intel2, injuries: intel2.homeInjuries, availability: intel2.homeAvailability }, away: { team: m.away, ...intel2, injuries: intel2.awayInjuries, availability: intel2.awayAvailability }, keyFactors: intel2.keyFactors });
            if (!upPred.error) {
              predHtml = `
              <div class="match-three-pred">
                <span class="pred-primary">🥇${upPred.primaryScore.home}:${upPred.primaryScore.away}</span>
                <span class="pred-secondary">🥈${upPred.secondaryScore.home}:${upPred.secondaryScore.away}</span>
                <span class="pred-defensive">🎯${upPred.defensiveScore.home}:${upPred.defensiveScore.away}</span>
              </div>`;
            }
          } catch(e) { predHtml = ''; }
        }

        html += `
          <div class="schedule-match upcoming${(matchStatus === 'live' || m.liveScore) ? ' live-match' : ''}" data-type="group" data-status="${matchStatus}">
            <span class="match-group-badge">${this.groupLabel(m.group)}</span>
            <span class="match-time-badge">${this._formatDualTime(m.time, m.venue)}${matchStatus !== 'live' && !m.liveScore && countdown ? ' <span class="countdown-text">(' + countdown + ')</span>' : ''}</span>
            <div class="match-teams-block">
              <div class="match-teams-row">
                <span class="match-home">${hE} ${hZh}</span>
                ${scoreDisplay}
                <span class="match-away">${aZh} ${aE}</span>
              </div>
              ${predHtml}
            </div>
            ${statusBadge}
            <span class="match-venue-tag">📍 ${this.venueName(m.venue)}</span>
          </div>`;
      }
    }

    if (filter === 'all' || filter === 'knockout') {
      html += `
        <div class="schedule-day-header">🏆 ${I18n.lang === 'zh' ? '32强赛 (6月28日起) — 淘汰赛' : I18n.lang === 'es' ? 'Ronda de 32 (desde 28 jun) — Eliminatoria' : I18n.lang === 'fr' ? '32es de finale (dès le 28 juin) — Éliminatoires' : 'Round of 32 (from Jun 28) — Knockout'}</div>
        <div class="schedule-match upcoming">
          <span class="match-group-badge">KO</span>
          <div class="match-teams-block">
            <div class="match-teams-row">
              <span class="match-home">${I18n.lang === 'zh' ? '小组晋级队' : I18n.lang === 'es' ? 'Clasificado de grupo' : I18n.lang === 'fr' ? 'Qualifié de groupe' : 'Group Qualifier'}</span>
              <span class="match-score-block upcoming-label">VS</span>
              <span class="match-away">${I18n.lang === 'zh' ? '小组晋级队' : I18n.lang === 'es' ? 'Clasificado de grupo' : I18n.lang === 'fr' ? 'Qualifié de groupe' : 'Group Qualifier'}</span>
            </div>
          </div>
          <span class="match-status status-upcoming">${t('common.TBD')}</span>
          <span class="match-venue-tag">${I18n.lang === 'zh' ? '多城市' : I18n.lang === 'es' ? 'Multi-ciudad' : I18n.lang === 'fr' ? 'Multi-villes' : 'Multi-city'}</span>
        </div>
        <div class="schedule-day-header">🏆 ${I18n.lang === 'zh' ? '决赛 (7月19日) — 纽约 MetLife' : I18n.lang === 'es' ? 'Final (19 jul) — Nueva York MetLife' : I18n.lang === 'fr' ? 'Finale (19 juil) — New York MetLife' : 'Final (Jul 19) — New York MetLife'}</div>
        <div class="schedule-match upcoming">
          <span class="match-group-badge">${I18n.lang === 'zh' ? '决赛' : I18n.lang === 'es' ? 'Final' : I18n.lang === 'fr' ? 'Finale' : 'Final'}</span>
          <div class="match-teams-block">
            <div class="match-teams-row">
              <span class="match-home">${I18n.lang === 'zh' ? '半决赛胜者' : I18n.lang === 'es' ? 'Ganador SF' : I18n.lang === 'fr' ? 'Vainqueur DF' : 'SF Winner'}</span>
              <span class="match-score-block upcoming-label">VS</span>
              <span class="match-away">${I18n.lang === 'zh' ? '半决赛胜者' : I18n.lang === 'es' ? 'Ganador SF' : I18n.lang === 'fr' ? 'Vainqueur DF' : 'SF Winner'}</span>
            </div>
          </div>
          <span class="match-status status-upcoming">${t('common.TBD')}</span>
          <span class="match-venue-tag">📍 MetLife</span>
        </div>`;
    }

    list.innerHTML = html;
  },

  // ── Results Rendering ──
  renderResults() {
    const grid = document.getElementById('resultsGrid');
    let html = '';
    let totalMatches = 0;
    let exactHits = 0;
    let correctWins = 0;
    let totalWithPred = 0;

    for (const r of WC2026_DATA.completedResults) {
      const hZh = this.zhName(r.home);
      const aZh = this.zhName(r.away);
      const hE = this.emoji(r.home);
      const aE = this.emoji(r.away);
      const dualTime = this._formatDualTime(r.time, r.venue);

      // 计算AI预测 vs 实际结果对比
      let predHtml = '';
      let accuracyBadge = '';
      if (r.pred) {
        const predHg = r.pred.hg;
        const predAg = r.pred.ag;
        const actualHg = r.hg;
        const actualAg = r.ag;

        let result = '';
        let resultClass = 'wrong';
        let resultIcon = '✗';

        // 1. 完全命中
        if (predHg === actualHg && predAg === actualAg) {
          result = '完全命中';
          resultClass = 'perfect';
          resultIcon = '🎯';
          exactHits++;
          correctWins++;
        }
        // 2. 命中胜负
        else {
          const predWin = predHg > predAg ? 'home' : (predAg > predHg ? 'away' : 'draw');
          const actualWin = actualHg > actualAg ? 'home' : (actualAg > actualHg ? 'away' : 'draw');
          if (predWin === actualWin) {
            result = '命中胜负';
            resultClass = 'partial';
            resultIcon = '✓';
            correctWins++;
          } else {
            result = '未中';
            resultClass = 'wrong';
            resultIcon = '✗';
          }
        }

        totalWithPred++;
        totalMatches++;

        predHtml = `
          <div class="rc-prediction">
            <div class="rc-pred-label">🤖 AI赛前预测</div>
            <div class="rc-pred-comparison">
              <div class="rc-pred-side rc-pred-predicted">
                <div class="rc-pred-side-label">预测</div>
                <div class="rc-pred-score">${predHg} - ${predAg}</div>
              </div>
              <div class="rc-pred-vs">→</div>
              <div class="rc-pred-side rc-pred-actual">
                <div class="rc-pred-side-label">实际</div>
                <div class="rc-pred-score">${actualHg} - ${actualAg}</div>
              </div>
              <div class="rc-pred-result rc-pred-${resultClass}">${resultIcon} ${result}</div>
            </div>
          </div>`;
      } else {
        // 无预测数据
        predHtml = `
          <div class="rc-prediction rc-pred-na">
            <div class="rc-pred-label">🤖 AI预测</div>
            <div class="rc-pred-na-text">未记录预测</div>
          </div>`;
        totalMatches++;
      }

      html += `
        <div class="result-card">
          <div class="rc-header">
            <div class="rc-date">${r.date}</div>
            <div class="rc-time">${dualTime}</div>
            <div class="rc-group">${r.group}组</div>
          </div>
          <div class="rc-teams">
            <div class="rc-team">
              <div style="font-size:32px;margin-bottom:4px;">${hE}</div>
              <div>${hZh}</div>
            </div>
            <div class="rc-score">${r.hg} - ${r.ag}</div>
            <div class="rc-team">
              <div style="font-size:32px;margin-bottom:4px;">${aE}</div>
              <div>${aZh}</div>
            </div>
          </div>
          ${predHtml}
          <div class="rc-venue">📍 ${r.venue}</div>
        </div>`;
    }

    // 渲染顶部统计卡片
    const accuracy = totalWithPred > 0 ? Math.round((correctWins / totalWithPred) * 100) : 0;
    const exactRate = totalWithPred > 0 ? Math.round((exactHits / totalWithPred) * 100) : 0;

    const summaryHtml = `
      <div class="accuracy-summary">
        <div class="accuracy-card accuracy-main">
          <div class="accuracy-icon">📊</div>
          <div class="accuracy-content">
            <div class="accuracy-label">AI预测准确率</div>
            <div class="accuracy-value">${accuracy}<span class="accuracy-unit">%</span></div>
            <div class="accuracy-sub">胜负方向 · ${correctWins}/${totalWithPred}场</div>
          </div>
        </div>
        <div class="accuracy-card accuracy-exact">
          <div class="accuracy-icon">🎯</div>
          <div class="accuracy-content">
            <div class="accuracy-label">完全命中</div>
            <div class="accuracy-value">${exactRate}<span class="accuracy-unit">%</span></div>
            <div class="accuracy-sub">比分精确 · ${exactHits}/${totalWithPred}场</div>
          </div>
        </div>
        <div class="accuracy-card accuracy-total">
          <div class="accuracy-icon">⚽</div>
          <div class="accuracy-content">
            <div class="accuracy-label">已完赛</div>
            <div class="accuracy-value">${totalMatches}<span class="accuracy-unit">场</span></div>
            <div class="accuracy-sub">${WC2026_DATA.completedResults.length > 0 ? WC2026_DATA.completedResults[WC2026_DATA.completedResults.length-1].date + ' 最新' : ''}</div>
          </div>
        </div>
      </div>`;

    if (!html) html = '<div style="text-align:center;padding:48px;color:var(--text-dim);">暂无比赛结果</div>';
    grid.innerHTML = summaryHtml + html;
  },

  // ── Knockout Bracket Rendering ──
  renderBracket() {
    const bracket = BracketEngine.getBracketTeams();
    const container = document.getElementById('bracketContainer');
    if (!container) return;

    // ── Count filled slots ──
    let filledCount = 0;
    bracket.r32.forEach(m => { if (m.team1) filledCount++; if (m.team2) filledCount++; });

    // ── Split into Upper / Lower halves ──
    const upperR32 = bracket.r32.slice(0, 8);
    const lowerR32 = bracket.r32.slice(8, 16);

    // ── Helpers ──
    const teamSlot = (team, label, isWinner, half) => {
      const cls = half === 'lower' ? ' bk-lower-team' : '';
      if (team && team.zh) {
        return `<div class="bk-team${isWinner ? ' bk-winner' : ' bk-filled'}${cls}">
          <span class="bk-emoji">${team.emoji}</span>
          <span class="bk-name">${team.zh}</span>
          <span class="bk-seed">${label}</span>
          ${isWinner ? '<span class="bk-star">⭐</span>' : ''}
        </div>`;
      }
      return `<div class="bk-team bk-empty">
        <span class="bk-emoji">🏴</span>
        <span class="bk-name">${label || '待定'}</span>
      </div>`;
    };

    const matchCard = (m, roundLabel, idx, half) => {
      const t1Wins = m.team1 && m.team2 && m.team1.pts >= m.team2.pts;
      const t2Wins = m.team1 && m.team2 && m.team2.pts > m.team1.pts;
      return `<div class="bk-match" data-half="${half}">
        <div class="bk-match-header">
          <span class="bk-round-tag">${roundLabel}</span>
          <span class="bk-match-num">#${idx + 1}</span>
        </div>
        ${teamSlot(m.team1, m.label1, t1Wins, half)}
        <div class="bk-vs"><span>VS</span></div>
        ${teamSlot(m.team2, m.label2, t2Wins, half)}
      </div>`;
    };

    const emptyMatchCard = (roundLabel, idx, half) => {
      return `<div class="bk-match" data-half="${half}">
        <div class="bk-match-header">
          <span class="bk-round-tag">${roundLabel}</span>
          <span class="bk-match-num">#${idx + 1}</span>
        </div>
        <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">待定</span></div>
        <div class="bk-vs"><span>VS</span></div>
        <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">待定</span></div>
      </div>`;
    };

    // ── Round column: matches are grouped into pairs for bracket alignment ──
    const roundCol = (matchList, count, title, date, roundLabel, half, isFuture) => {
      let pairsHtml = '';
      const items = isFuture ? Array.from({length: count}, () => null) : matchList;
      for (let i = 0; i < items.length; i += 2) {
        const m1 = isFuture ? null : items[i];
        const m2 = isFuture ? null : items[i + 1];
        pairsHtml += `<div class="bk-pair">
          ${isFuture ? emptyMatchCard(roundLabel, i, half) : matchCard(m1, roundLabel, i, half)}
          ${isFuture ? emptyMatchCard(roundLabel, i + 1, half) : (m2 ? matchCard(m2, roundLabel, i + 1, half) : '')}
        </div>`;
      }
      return `<div class="bk-round-col">
        <div class="bk-round-title">${title}<span class="bk-round-date">${date}</span></div>
        <div class="bk-round-matches">${pairsHtml}</div>
      </div>`;
    };

    // ── Connector column: one connector per pair ──
    const connectorCol = (pairs, direction) => {
      let items = '';
      for (let i = 0; i < pairs; i++) {
        items += `<div class="bk-conn-pair" data-dir="${direction}">
          <div class="bk-conn-in-top"></div>
          <div class="bk-conn-in-bottom"></div>
          <div class="bk-conn-vert"></div>
          <div class="bk-conn-out-line"></div>
        </div>`;
      }
      return `<div class="bk-conn-col">${items}</div>`;
    };

    // ── Upper Half: R32(1-8) → R16(1-4) → QF(1-2) → SF1 ──
    const upperHalf = `
      ${roundCol(upperR32, 8, '32强赛', '6/28-7/3', 'R32', 'upper', false)}
      ${connectorCol(4, 'right')}
      ${roundCol([], 4, '16强赛', '7/4-7/7', 'R16', 'upper', true)}
      ${connectorCol(2, 'right')}
      ${roundCol([], 2, '1/4决赛', '7/8-7/11', 'QF', 'upper', true)}
      ${connectorCol(1, 'right')}
      <div class="bk-round-col bk-sf-col">
        <div class="bk-round-title">半决赛①<span class="bk-round-date">7/14</span></div>
        <div class="bk-round-matches">
          <div class="bk-pair">${emptyMatchCard('SF', 0, 'upper')}</div>
        </div>
      </div>
    `;

    // ── Center: 3rd Place + Final ──
    const centerCol = `
      <div class="bk-center-col">
        <div class="bk-center-label">🏅 决赛阶段</div>
        <div class="bk-match bk-3rd-place">
          <div class="bk-match-header">
            <span class="bk-round-tag">季军赛</span>
            <span class="bk-round-date">7/18</span>
          </div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">SF①负方</span></div>
          <div class="bk-vs"><span>VS</span></div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">SF②负方</span></div>
        </div>
        <div class="bk-match bk-final">
          <div class="bk-match-header">
            <span class="bk-round-tag bk-final-tag">🏆 决赛</span>
            <span class="bk-round-date">7/19</span>
          </div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">SF①胜方</span></div>
          <div class="bk-vs bk-vs-final"><span>VS</span></div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">SF②胜方</span></div>
        </div>
        <div class="bk-champion-slot">
          <div class="bk-trophy">🏆</div>
          <div class="bk-champion-label">2026 冠军</div>
        </div>
      </div>
    `;

    // ── Lower Half: SF2 ← QF(3-4) ← R16(5-8) ← R32(9-16) ──
    const lowerHalf = `
      <div class="bk-round-col bk-sf-col">
        <div class="bk-round-title">半决赛②<span class="bk-round-date">7/15</span></div>
        <div class="bk-round-matches">
          <div class="bk-pair">${emptyMatchCard('SF', 0, 'lower')}</div>
        </div>
      </div>
      ${connectorCol(1, 'left')}
      ${roundCol([], 2, '1/4决赛', '7/8-7/11', 'QF', 'lower', true)}
      ${connectorCol(2, 'left')}
      ${roundCol([], 4, '16强赛', '7/4-7/7', 'R16', 'lower', true)}
      ${connectorCol(4, 'left')}
      ${roundCol(lowerR32, 8, '32强赛', '6/28-7/3', 'R32', 'lower', false)}
    `;

    // ── Assemble ──
    container.innerHTML = `
      <div class="bk-legend">
        <div class="bk-legend-left">
          <span>📊 基于当前积分自动预测晋级 · 已填充 <strong>${filledCount}</strong>/32 个席位</span>
        </div>
        <div class="bk-legend-right">
          <span class="bk-legend-dot" style="background:#4ade80"></span> 上半区
          <span class="bk-legend-dot" style="background:#f59e0b"></span> 决赛
          <span class="bk-legend-dot" style="background:#60a5fa"></span> 下半区
          <span class="bk-legend-dot" style="background:#4d7a5e"></span> 待定
        </div>
      </div>
      <div class="bk-scroll">
        <div class="bk-tree">
          <div class="bk-half bk-upper">${upperHalf}</div>
          ${centerCol}
          <div class="bk-half bk-lower">${lowerHalf}</div>
        </div>
      </div>
    `;

    // ── Post-render: draw SVG connector lines ──
    this._drawBracketConnectors();
  },

  _initResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this._drawBracketConnectors(), 200);
    });
  },

  // ── 日期变化检测器 ──
  // 当北京时间跨越午夜时，强制刷新全部页面内容
  _initDayChangeDetector() {
    let lastDate = this.todayDate;
    setInterval(() => {
      const currentDate = this.todayDate;
      if (currentDate !== lastDate) {
        console.log(`[App] 📅 日期变化: ${lastDate} → ${currentDate}，强制刷新`);
        lastDate = currentDate;
        this.doRefresh();
      }
    }, 30000); // 每30秒检查一次日期是否变化
  },

  // ── 数据新鲜度指示器 ──
  _initDataFreshnessIndicator() {
    // 在页面头部添加数据源标识
    const header = document.querySelector('.header') || document.querySelector('header');
    if (!header) return;

    const indicator = document.createElement('div');
    indicator.id = 'dataFreshnessIndicator';
    indicator.className = 'data-freshness-indicator';
    indicator.innerHTML = `<span class="df-dot"></span><span class="df-label">本地数据</span>`;
    header.appendChild(indicator);

    // 定期更新
    setInterval(() => this._updateFreshnessDisplay(), 30000);
    this._updateFreshnessDisplay();
  },

  _updateFreshnessDisplay() {
    const el = document.getElementById('dataFreshnessIndicator');
    if (!el || typeof LiveData === 'undefined') return;

    const freshness = LiveData.getDataFreshness();
    el.querySelector('.df-dot').style.background = freshness.color;
    el.querySelector('.df-label').textContent = `${freshness.sourceLabel} · ${freshness.label}`;
  },

  // ── 实时比分刷新回调 ──
  refreshLiveScores() {
    this.renderTodayMatches();
    this.renderResults();
  },

  // ── 手动刷新全部数据 ──
  async manualRefreshAll() {
    if (typeof LiveData !== 'undefined') {
      await LiveData.manualRefresh();
    }
    this.renderTodayMatches();
    this.renderSchedule();
    this.renderResults();
    this.renderGroups();
    this._updateFreshnessDisplay();
  },

  // ── 渲染所有 ──
  renderAll() {
    this.renderTodayMatches();
    this.renderSchedule();
    this.renderResults();
    this.renderGroups();
    this.renderBracket();
    this.renderTeamsPower();
  },

  // ── API配置（密钥已在服务端，无需客户端配置）──
  toggleApiConfig() {
    alert('🔒 所有 API 密钥已安全隐藏在服务端，无需客户端配置。');
  },

  saveAFKey() {
    alert('🔒 API 密钥已安全隐藏在服务端，无需手动配置。');
  },

  saveFDKey() {
    alert('🔒 API 密钥已安全隐藏在服务端，无需手动配置。');
  },

  // ── Draw SVG connector lines after bracket renders ──
  _drawBracketConnectors() {
    const oldSvg = document.getElementById('bkSvgOverlay');
    if (oldSvg) oldSvg.remove();

    const tree = document.querySelector('.bk-tree');
    if (!tree) return;

    const treeRect = tree.getBoundingClientRect();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'bkSvgOverlay';
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    svg.setAttribute('viewBox', `0 0 ${treeRect.width} ${treeRect.height}`);

    const green = 'rgba(34,197,94,0.5)';
    const blue = 'rgba(96,165,250,0.5)';

    const drawHalf = (halfEl, color) => {
      const isLower = halfEl.classList.contains('bk-lower');
      const roundMatches = halfEl.querySelectorAll('.bk-round-matches');

      for (let r = 0; r < roundMatches.length - 1; r++) {
        const currMatches = roundMatches[r].querySelectorAll('.bk-match');
        const nextMatches = roundMatches[r + 1].querySelectorAll('.bk-match');

        // Each pair of consecutive matches in curr round feeds into one match in next round
        for (let i = 0; i < currMatches.length; i += 2) {
          const m1 = currMatches[i];
          const m2 = currMatches[i + 1];
          const target = nextMatches[Math.floor(i / 2)];

          if (!m1 || !m2 || !target) continue;

          const m1R = m1.getBoundingClientRect();
          const m2R = m2.getBoundingClientRect();
          const tR = target.getBoundingClientRect();

          // Source edge: right side for upper, left side for lower
          const sx1 = isLower ? (m1R.left - treeRect.left) : (m1R.right - treeRect.left);
          const sy1 = m1R.top + m1R.height / 2 - treeRect.top;
          const sx2 = isLower ? (m2R.left - treeRect.left) : (m2R.right - treeRect.left);
          const sy2 = m2R.top + m2R.height / 2 - treeRect.top;
          // Target edge: left side for upper, right side for lower
          const tx = isLower ? (tR.right - treeRect.left) : (tR.left - treeRect.left);
          const ty = tR.top + tR.height / 2 - treeRect.top;

          // Mid X: halfway between source and target
          const midX = (sx1 + tx) / 2;

          // Path: m1 → horizontal to midX → vertical to ty → horizontal to target
          const d1 = `M ${sx1},${sy1} H ${midX} V ${ty} H ${tx}`;
          // Path: m2 → horizontal to midX (join the vertical line)
          const d2 = `M ${sx2},${sy2} H ${midX}`;

          [d1, d2].forEach(d => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(path);
          });
        }
      }
    };

    const upperHalf = tree.querySelector('.bk-upper');
    const lowerHalf = tree.querySelector('.bk-lower');
    if (upperHalf) drawHalf(upperHalf, green);
    if (lowerHalf) drawHalf(lowerHalf, blue);

    tree.style.position = 'relative';
    tree.appendChild(svg);
  },

  // ── Groups Rendering ──
  renderGroups() {
    const standings = computeGroupStandings();
    const grid = document.getElementById('groupsGrid');
    let html = '';

    for (const [grp, teams] of Object.entries(standings)) {
      const teamList = Object.entries(teams).sort((a, b) => {
        if (b[1].pts !== a[1].pts) return b[1].pts - a[1].pts;
        if (b[1].gd !== a[1].gd) return b[1].gd - a[1].gd;
        return b[1].gf - a[1].gf;
      });

      html += `<div class="group-card">
        <div class="group-card-header">🏅 ${grp} ${I18n.lang === 'zh' ? '组' : I18n.lang === 'es' ? 'Grupo' : I18n.lang === 'fr' ? 'Groupe' : 'Group'}</div>
        <table class="group-table">
          <thead><tr><th>${t('group.table.pos')}</th><th>${t('group.table.team')}</th><th>${t('group.table.played')}</th><th>${t('group.table.win')}</th><th>${t('group.table.draw')}</th><th>${t('group.table.loss')}</th><th>${t('group.table.gd')}</th><th>${t('group.table.pts')}</th></tr></thead>
          <tbody>
            ${teamList.map(([team, s], idx) => {
              const emoji = this.emoji(team);
              const zh = this.zhName(team);
              const qClass = idx < 2 ? 'class="qualify-row"' : '';
              return `<tr ${qClass}>
                <td class="pos-cell">${idx+1}</td>
                <td class="team-cell">${emoji} ${zh}</td>
                <td class="stat-cell">${s.p}</td>
                <td class="stat-cell">${s.w}</td>
                <td class="stat-cell">${s.d}</td>
                <td class="stat-cell">${s.l}</td>
                <td class="stat-cell" style="${s.gd>0?'color:#22c55e':s.gd<0?'color:#dc2626':''}">${s.gd>0?'+':''}${s.gd}</td>
                <td class="pts-cell">${s.pts}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
    }
    grid.innerHTML = html;
  },

  // ── Team Power Rankings ──
  renderTeamsPower(filter = '') {
    const list = document.getElementById('teamsPowerList');
    const teams = Object.entries(WC2026_DATA.teamStats).map(([name, stats]) => {
      const rank = WC2026_DATA.fifaRankings[name];
      const rankScore = rank ? Math.max(0, (100 - rank.rank) / 100) * 10 : 5;
      const formScore = this.formPts(stats.recentForm || []) / 15 * 10;
      const historyScore = stats.worldcupWins > 0 ? Math.min(10, 5 + stats.worldcupWins * 0.5) : 5 + (stats.worldcupFinals||0)*0.3;
      const power = stats.attack*0.25 + stats.defense*0.25 + rankScore*0.20 + formScore*0.15 + historyScore*0.15;
      return { name, stats, rank, power };
    });
    teams.sort((a, b) => b.power - a.power);
    const maxPower = teams[0].power;

    // Filter by search
    const filtered = filter
      ? teams.filter(t => {
          const zh = this.zhName(t.name).toLowerCase();
          const en = t.name.toLowerCase();
          return zh.includes(filter.toLowerCase()) || en.includes(filter.toLowerCase());
        })
      : teams;

    let html = '';
    filtered.forEach((t, i) => {
      // Find original rank
      const origIdx = teams.indexOf(t);
      const emoji = this.emoji(t.name);
      const zh = this.zhName(t.name);
      const pct = (t.power / maxPower * 100).toFixed(0);
      const barColor = origIdx < 5 ? '#f59e0b' : origIdx < 16 ? '#16a34a' : origIdx < 32 ? '#dc2626' : '#4d7a5e';
      const rankClass = origIdx===0?' top1':origIdx===1?' top2':origIdx===2?' top3':'';
      const isSelected = this._selectedTeam === t.name;

      html += `
        <div class="teams-power-row${isSelected ? ' team-selected' : ''}" data-team="${t.name}" onclick="App.showTeamDetail('${t.name}')">
          <div class="power-rank${rankClass}">${origIdx+1}</div>
          <div class="power-flag">${emoji}</div>
          <div class="power-name">
            ${zh}
            <div class="power-name-sub">${t.rank?`FIFA #${t.rank.rank}`:''} ${t.stats.worldcupWins>0?'🏆'.repeat(t.stats.worldcupWins):''}</div>
          </div>
          <div class="power-metrics">
            <div class="power-metric"><div class="pm-val" style="color:#16a34a">${t.stats.attack.toFixed(1)}</div><div class="pm-label">进攻</div></div>
            <div class="power-metric"><div class="pm-val" style="color:#dc2626">${t.stats.defense.toFixed(1)}</div><div class="pm-label">防守</div></div>
            <div class="power-metric"><div class="pm-val" style="color:#f59e0b">${t.power.toFixed(1)}</div><div class="pm-label">综合</div></div>
          </div>
          <div class="power-bar-wrap"><div class="power-bar" style="width:${pct}%;background:${barColor};"></div></div>
          <div class="power-expand-icon">${isSelected ? '▲' : '▼'}</div>
        </div>`;

      // Inline detail panel right below the selected team row
      if (isSelected) {
        const detail = WC2026_DATA.teamDetails[t.name];
        const simple = WC2026_DATA._simpleTeamDetails[t.name];
        const teamGroup = this._findTeamGroup(t.name);
        const activeTab = this._teamDetailTab || 'squad';
        let tabContent = '';
        if (activeTab === 'squad') tabContent = this._renderTeamSquad(t.name, detail, simple);
        else if (activeTab === 'injuries') tabContent = this._renderTeamInjuries(t.name, detail, simple);
        else if (activeTab === 'analysis') tabContent = this._renderTeamAnalysis(t.name, detail, simple, t.stats, t.rank);
        else if (activeTab === 'history') tabContent = this._renderTeamHistory(t.name, t.stats, t.rank, teamGroup);

        html += `
        <div class="team-detail-panel inline-detail" id="inlineTeamDetail">
          <div class="td-header">
            <div class="td-team-info">
              <span class="td-flag">${emoji}</span>
              <div class="td-name-wrap">
                <div class="td-name">${zh}</div>
                <div class="td-sub">${t.rank ? `FIFA 排名 #${t.rank.rank}` : ''} · ${teamGroup}组 · ${t.stats.worldcupWins > 0 ? '🏆'.repeat(t.stats.worldcupWins) : ''}</div>
              </div>
            </div>
            <button class="td-close-btn" onclick="App.showTeamDetail('${t.name}')">✕ <span data-i18n="team.tab.close">${I18n.lang === 'zh' ? '收起' : I18n.lang === 'es' ? 'Cerrar' : I18n.lang === 'fr' ? 'Fermer' : 'Close'}</span></button>
          </div>
          <div class="td-tabs">
            <button class="td-tab${activeTab==='squad'?' active':''}" onclick="App._switchTeamTab('squad','${t.name}')">💰 ${I18n.lang === 'zh' ? '大名单身价' : I18n.lang === 'es' ? 'Plantilla y Valor' : I18n.lang === 'fr' ? 'Effectif & Valeur' : 'Squad & Value'}</button>
            <button class="td-tab${activeTab==='injuries'?' active':''}" onclick="App._switchTeamTab('injuries','${t.name}')">🏥 ${t('team.tab.injuries')}</button>
            <button class="td-tab${activeTab==='analysis'?' active':''}" onclick="App._switchTeamTab('analysis','${t.name}')">📊 ${t('team.tab.analysis')}</button>
            <button class="td-tab${activeTab==='history'?' active':''}" onclick="App._switchTeamTab('history','${t.name}')">📜 ${I18n.lang === 'zh' ? '历史对战' : I18n.lang === 'es' ? 'Historial' : I18n.lang === 'fr' ? 'Historique' : 'History'}</button>
          </div>
          <div class="td-content">
            ${tabContent}
          </div>
        </div>`;
      }
    });
    list.innerHTML = html;
  },

  _findTeamGroup(teamName) {
    for (const [grp, data] of Object.entries(WC2026_DATA.groups)) {
      if (data.teams.includes(teamName)) return grp;
    }
    return '';
  },

  // ── Show Team Detail (inline expand) ──
  showTeamDetail(teamName) {
    // Toggle: if same team clicked, close
    if (this._selectedTeam === teamName) {
      this._selectedTeam = null;
      this.renderTeamsPower(document.getElementById('teamSearchInput')?.value || '');
      return;
    }

    this._selectedTeam = teamName;
    this._teamDetailTab = this._teamDetailTab || 'squad';
    this.renderTeamsPower(document.getElementById('teamSearchInput')?.value || '');

    // Scroll the inline panel into view smoothly
    setTimeout(() => {
      const el = document.getElementById('inlineTeamDetail');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  },

  _switchTeamTab(tab, teamName) {
    this._teamDetailTab = tab;
    // Only update the content area + tab active state, don't re-render entire list
    const panel = document.getElementById('inlineTeamDetail');
    if (!panel) { this.showTeamDetail(teamName); return; }

    // Update tab active states using data attribute
    panel.querySelectorAll('.td-tab').forEach((btn, idx) => {
      const tabOrder = ['squad', 'injuries', 'analysis', 'history'];
      btn.classList.toggle('active', tabOrder[idx] === tab);
    });

    // Update content area only
    const contentEl = panel.querySelector('.td-content');
    if (!contentEl) { this.showTeamDetail(teamName); return; }

    const detail = WC2026_DATA.teamDetails[teamName];
    const simple = WC2026_DATA._simpleTeamDetails[teamName];
    const stats = WC2026_DATA.teamStats[teamName];
    const rank = WC2026_DATA.fifaRankings[teamName];
    const teamGroup = this._findTeamGroup(teamName);

    if (tab === 'squad') contentEl.innerHTML = this._renderTeamSquad(teamName, detail, simple);
    else if (tab === 'injuries') contentEl.innerHTML = this._renderTeamInjuries(teamName, detail, simple);
    else if (tab === 'analysis') contentEl.innerHTML = this._renderTeamAnalysis(teamName, detail, simple, stats, rank);
    else if (tab === 'history') contentEl.innerHTML = this._renderTeamHistory(teamName, stats, rank, teamGroup);

    // Keep scroll position — no scrollIntoView on tab switch
  },

  // ── Render: Squad & Market Value ──
  _renderTeamSquad(teamName, detail, simple) {
    const emoji = this.emoji(teamName);
    const zh = this.zhName(teamName);

    if (detail && detail.squad) {
      const totalVal = detail.totalValue;
      let rows = detail.squad.map((p, i) => `
        <tr>
          <td class="squad-num">${i+1}</td>
          <td class="squad-pos"><span class="pos-badge pos-${p.pos}">${p.pos}</span></td>
          <td class="squad-name">${p.name}</td>
          <td class="squad-club">${p.club}</td>
          <td class="squad-val">${p.val}</td>
        </tr>
      `).join('');

      return `
        <div class="squad-summary">
          <div class="squad-total-val">💰 全队总身价 <strong>${totalVal}</strong></div>
          <div class="squad-count">📋 大名单 ${detail.squad.length} 人</div>
        </div>
        <table class="squad-table">
          <thead><tr><th>#</th><th>位置</th><th>球员</th><th>俱乐部</th><th>身价</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }

    // Simple fallback
    if (simple) {
      return `
        <div class="squad-summary">
          <div class="squad-total-val">💰 全队总身价 <strong>${simple.totalValue}</strong></div>
        </div>
        <div class="simple-detail-card">
          <div class="simple-label">⭐ 核心球员</div>
          <div class="simple-value">${simple.starPlayers}</div>
        </div>
        <div class="detail-note">📝 更多大名单信息将在开赛前更新</div>
      `;
    }

    return '<div class="detail-note">暂无大名单数据</div>';
  },

  // ── Render: Injuries ──
  _renderTeamInjuries(teamName, detail, simple) {
    if (detail && detail.injuries && detail.injuries.length > 0) {
      let rows = detail.injuries.map(inj => `
        <div class="injury-item">
          <div class="injury-player">🔴 ${inj.name}</div>
          <div class="injury-type">${inj.type}</div>
          <div class="injury-status">${inj.status}</div>
        </div>
      `).join('');

      return `
        <div class="injury-summary">🏥 伤停球员 <strong>${detail.injuries.length}</strong> 人</div>
        <div class="injury-list">${rows}</div>
        ${detail.injuries.some(i => i.status.includes('缺席')) ? '<div class="injury-warn">⚠️ 存在关键球员缺席，可能影响比赛表现</div>' : ''}
      `;
    }

    // Simple fallback
    if (simple) {
      return `
        <div class="injury-summary">🏥 伤停情况</div>
        <div class="simple-detail-card">
          <div class="simple-value">${simple.injuries}</div>
        </div>
      `;
    }

    return '<div class="injury-ok">✅ 当前无重大伤停，全员健康</div>';
  },

  // ── Render: World Cup Analysis ──
  _renderTeamAnalysis(teamName, detail, simple, stats, rank) {
    const emoji = this.emoji(teamName);
    const zh = this.zhName(teamName);
    const attack = stats.attack;
    const defense = stats.defense;
    const form = stats.recentForm || [];

    // Build radar-like metrics
    const attackWidth = Math.min(100, attack * 10);
    const defenseWidth = Math.min(100, defense * 10);
    const formScore = this.formPts(form) / 15 * 10;
    const formWidth = Math.min(100, formScore * 10);
    const rankScore = rank ? Math.max(0, (100 - rank.rank) / 100) * 10 : 5;
    const rankWidth = Math.min(100, rankScore * 10);

    const analysis = detail?.analysis || simple?.analysis || '暂无分析数据';

    return `
      <div class="analysis-metrics">
        <div class="am-row">
          <span class="am-label">⚔️ 进攻</span>
          <div class="am-bar-wrap"><div class="am-bar am-attack" style="width:${attackWidth}%"></div></div>
          <span class="am-val">${attack.toFixed(1)}</span>
        </div>
        <div class="am-row">
          <span class="am-label">🛡️ 防守</span>
          <div class="am-bar-wrap"><div class="am-bar am-defense" style="width:${defenseWidth}%"></div></div>
          <span class="am-val">${defense.toFixed(1)}</span>
        </div>
        <div class="am-row">
          <span class="am-label">📈 状态</span>
          <div class="am-bar-wrap"><div class="am-bar am-form" style="width:${formWidth}%"></div></div>
          <span class="am-val">${formScore.toFixed(1)}</span>
        </div>
        <div class="am-row">
          <span class="am-label">🏅 排名</span>
          <div class="am-bar-wrap"><div class="am-bar am-rank" style="width:${rankWidth}%"></div></div>
          <span class="am-val">${rank ? '#'+rank.rank : '-'}</span>
        </div>
      </div>
      <div class="analysis-quick-stats">
        <div class="aqs-item"><span class="aqs-val">${stats.style || '-'}</span><span class="aqs-label">战术风格</span></div>
        <div class="aqs-item"><span class="aqs-val">${stats.starPlayer || '-'}</span><span class="aqs-label">核心球员</span></div>
        <div class="aqs-item"><span class="aqs-val">${form.map(f => this.formBadge(f)).join(' ')}</span><span class="aqs-label">近期走势</span></div>
        <div class="aqs-item"><span class="aqs-val">${stats.worldcupWins}🏆</span><span class="aqs-label">世界杯冠军</span></div>
      </div>
      <div class="analysis-text">
        <div class="at-title">📋 ${zh}世界杯前景分析</div>
        <div class="at-body">${analysis}</div>
      </div>
    `;
  },

  // ── Render: Historical Matches ──
  _renderTeamHistory(teamName, stats, rank, teamGroup) {
    const emoji = this.emoji(teamName);
    const zh = this.zhName(teamName);

    // World Cup overall stats
    const wcStats = stats.wc_matches || 0;
    const wcGF = stats.wc_goals_scored || 0;
    const wcGA = stats.wc_goals_conceded || 0;
    const avgGF = stats.avgGoalsScored || 0;
    const avgGA = stats.avgGoalsConceded || 0;

    // Find all h2h records involving this team
    const h2hRecords = [];
    for (const [key, val] of Object.entries(WC2026_DATA.h2h)) {
      const [t1, t2] = key.split('|');
      if (t1 === teamName || t2 === teamName) {
        const opponent = t1 === teamName ? t2 : t1;
        const isTeamA = t1 === teamName;
        const wins = isTeamA ? val.aw : val.lw;
        const draws = val.d;
        const losses = isTeamA ? val.lw : val.aw;
        h2hRecords.push({ opponent, p: val.p, wins, draws, losses });
      }
    }

    // Completed matches in this tournament
    const thisWC = WC2026_DATA.completedResults.filter(r => r.home === teamName || r.away === teamName);

    // Upcoming matches in this tournament
    const upcoming = WC2026_DATA.upcomingMatches.filter(m => m.home === teamName || m.away === teamName);

    let thisWCHtml = '';
    if (thisWC.length > 0) {
      thisWCHtml = `
        <div class="history-section">
          <div class="hs-title">🎯 本届世界杯已赛</div>
          ${thisWC.map(r => {
            const isHome = r.home === teamName;
            const won = isHome ? r.hg > r.ag : r.ag > r.hg;
            const drew = r.hg === r.ag;
            const resultClass = won ? 'h-win' : drew ? 'h-draw' : 'h-loss';
            const resultText = won ? '胜' : drew ? '平' : '负';
            const opp = isHome ? r.away : r.home;
            const oppZh = this.zhName(opp);
            const oppE = this.emoji(opp);
            const dualTime = this._formatDualTimeCompact(r.time, r.venue);
            return `<div class="h-match ${resultClass}">
              <span class="hm-result">${resultText}</span>
              <span class="hm-teams">${emoji} ${zh} ${r.hg} - ${r.ag} ${oppZh} ${oppE}</span>
              <span class="hm-info">${r.group}组 · ${r.date} ${dualTime}</span>
            </div>`;
          }).join('')}
        </div>`;
    }

    let upcomingHtml = '';
    if (upcoming.length > 0) {
      upcomingHtml = `
        <div class="history-section">
          <div class="hs-title">📅 本届世界杯待赛</div>
          ${upcoming.map(m => {
            const isHome = m.home === teamName;
            const opp = isHome ? m.away : m.home;
            const oppZh = this.zhName(opp);
            const oppE = this.emoji(opp);
            const dualTime = this._formatDualTimeCompact(m.time, m.venue);
            return `<div class="h-match h-upcoming">
              <span class="hm-result">⏳</span>
              <span class="hm-teams">${emoji} ${zh} vs ${oppZh} ${oppE}</span>
              <span class="hm-info">${this.groupLabel(m.group)} · ${m.date} ${dualTime}</span>
            </div>`;
          }).join('')}
        </div>`;
    }

    let h2hHtml = '';
    if (h2hRecords.length > 0) {
      h2hHtml = `
        <div class="history-section">
          <div class="hs-title">⚔️ 世界杯历史对战记录</div>
          <table class="h2h-detail-table">
            <thead><tr><th>对手</th><th>场次</th><th>胜</th><th>平</th><th>负</th><th>胜率</th></tr></thead>
            <tbody>
              ${h2hRecords.map(r => {
                const oppZh = this.zhName(r.opponent);
                const oppE = this.emoji(r.opponent);
                const winPct = r.p > 0 ? Math.round(r.wins / r.p * 100) : 0;
                const winClass = winPct >= 50 ? 'h2h-pos' : winPct >= 30 ? 'h2h-neu' : 'h2h-neg';
                return `<tr>
                  <td>${oppE} ${oppZh}</td>
                  <td>${r.p}</td>
                  <td class="h2h-w">${r.wins}</td>
                  <td class="h2h-d">${r.draws}</td>
                  <td class="h2h-l">${r.losses}</td>
                  <td class="${winClass}">${winPct}%</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;
    }

    return `
      <div class="history-overview">
        <div class="ho-card"><div class="ho-val">${wcStats}</div><div class="ho-label">世界杯总场次</div></div>
        <div class="ho-card"><div class="ho-val" style="color:#22c55e">${wcGF}</div><div class="ho-label">总进球</div></div>
        <div class="ho-card"><div class="ho-val" style="color:#dc2626">${wcGA}</div><div class="ho-label">总失球</div></div>
        <div class="ho-card"><div class="ho-val">${avgGF.toFixed(2)}</div><div class="ho-label">场均进球</div></div>
        <div class="ho-card"><div class="ho-val">${avgGA.toFixed(2)}</div><div class="ho-label">场均失球</div></div>
        <div class="ho-card"><div class="ho-val" style="color:#f59e0b">${stats.worldcupWins}🏆</div><div class="ho-label">冠军次数</div></div>
      </div>
      ${thisWCHtml}
      ${upcomingHtml}
      ${h2hHtml}
      ${h2hRecords.length === 0 && thisWC.length === 0 ? '<div class="detail-note">暂无历史对战数据</div>' : ''}
    `;
  },

  // ── Init Team Search ──
  initTeamSearch() {
    const input = document.getElementById('teamSearchInput');
    if (!input) return;
    input.addEventListener('input', () => {
      // If selected team not in filtered results, deselect
      if (this._selectedTeam) {
        const zh = this.zhName(this._selectedTeam).toLowerCase();
        const en = this._selectedTeam.toLowerCase();
        const q = input.value.toLowerCase();
        if (q && !zh.includes(q) && !en.includes(q)) {
          this._selectedTeam = null;
        }
      }
      this.renderTeamsPower(input.value);
    });
  },

  formPts(form) {
    let pts = 0;
    for (const r of form) { if (r==='W') pts+=3; else if (r==='D') pts+=1; }
    return pts;
  },

  // ── Filter Init ──
  initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderSchedule(btn.dataset.filter);
      });
    });
  },

  // ── AI Panel 初始化 ──
  initDeepSeek() {
    const analyzeBtn = document.getElementById('dsAnalyzeBtn');
    const keyStatus = document.getElementById('dsKeyStatus');

    DeepSeekEngine.loadApiKey();
    const readyMsg = I18n.lang === 'zh' ? '✅ AI 分析助手就绪 · 点击生成提示词，一键跳转AI平台' : I18n.lang === 'es' ? '✅ Asistente IA listo · Genera prompt y salta a plataforma IA' : I18n.lang === 'fr' ? '✅ Assistant IA prêt · Générez prompt et allez à plateforme IA' : '✅ AI assistant ready · Generate prompt and jump to AI platform';
    if (keyStatus) this._showKeyStatus(keyStatus, 'ok', readyMsg);

    // 初始化AI平台跳转按钮
    this._renderAIJumpButtons();

    // 默认 prompt 类型
    this._promptType = 'full';

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        await this._runDeepSeekAnalysis();
      });
    }
  },

  _updateKeyStatus(key, statusEl) {
    if (!statusEl) return;
    if (!key) { statusEl.className = 'ds-key-status'; return; }
    if (key.startsWith('sk-') && key.length >= 20) {
      this._showKeyStatus(statusEl, 'ok', `✅ Key 已配置：${key.substring(0,8)}${'*'.repeat(8)}...`);
    } else {
      this._showKeyStatus(statusEl, 'warn', '⚠️ Key 格式似乎不正确');
    }
  },

  _showKeyStatus(el, type, msg) {
    if (!el) return;
    el.className = `ds-key-status ${type}`;
    el.textContent = msg;
  },

  async _runDeepSeekAnalysis() {
    if (!this._currentPredResult) {
      const msg = I18n.lang === 'zh' ? '请先选择今日比赛！' : I18n.lang === 'es' ? '¡Selecciona un partido primero!' : I18n.lang === 'fr' ? 'Sélectionnez un match d\'abord !' : 'Please select a match first!';
      alert(msg);
      return;
    }

    const pred = this._currentPredResult;
    const homeZh = this.zhName(pred.homeTeam);
    const awayZh = this.zhName(pred.awayTeam);

    const analyzeBtn = document.getElementById('dsAnalyzeBtn');
    const btnContent = document.getElementById('dsAnalyzeBtnContent');

    // 短暂加载动画（Prompt 生成是同步的，给用户视觉反馈）
    analyzeBtn.disabled = true;
    const loadingText = I18n.lang === 'zh' ? '✨ 正在生成提示词...' : I18n.lang === 'es' ? '✨ Generando prompt...' : I18n.lang === 'fr' ? '✨ Génération du prompt...' : '✨ Generating prompt...';
    btnContent.innerHTML = `<div class="ds-loading-dots"><span></span><span></span><span></span></div> ${loadingText}`;

    // 获取赛前情报（伤停/阵容/新闻）
    let intelligence = null;
    if (typeof LiveData !== 'undefined') {
      try {
        intelligence = await LiveData.fetchMatchIntelligence(pred.homeTeam, pred.awayTeam, '');
      } catch(e) {
        console.warn('[App] 情报获取失败:', e.message);
      }
    }

    // ── 生成 Prompt（无 API 调用）──
    let promptText;
    if (this._promptType === 'lite' && typeof MimoEngine !== 'undefined') {
      promptText = MimoEngine.buildPrompt(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh, intelligence);
    } else {
      promptText = DeepSeekEngine.buildPrompt(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh, intelligence);
    }

    // 显示 Prompt 区域
    const promptArea = document.getElementById('promptResultArea');
    const promptTextarea = document.getElementById('promptTextarea');
    if (promptArea) promptArea.style.display = 'block';
    if (promptTextarea) promptTextarea.value = promptText;
    this._currentPrompt = promptText;

    // 生成搜索关键词
    this._renderKeywords(pred, homeZh, awayZh);

    // 生成本地统计分析作为参考
    const localData = DeepSeekEngine.generateLocalAnalysis(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh);
    const localSection = document.getElementById('localAnalysisSection');
    const localContent = document.getElementById('localAnalysisContent');
    if (localSection) localSection.style.display = 'block';
    if (localContent) localContent.innerHTML = DeepSeekEngine.formatResponse(localData.content);

    // 更新按钮
    analyzeBtn.disabled = false;
    const refreshText = I18n.lang === 'zh' ? '🔄 重新生成提示词' : I18n.lang === 'es' ? '🔄 Regenerar prompt' : I18n.lang === 'fr' ? '🔄 Régénérer le prompt' : '🔄 Regenerate prompt';
    btnContent.innerHTML = refreshText;

    // 更新徽章
    const badge = document.getElementById('dsModelBadge');
    if (badge) {
      badge.textContent = t('dual.ready');
      badge.style.background = 'rgba(34,197,94,0.25)';
    }
  },

  // ── 切换 Prompt 类型 ──
  _switchPromptType(type) {
    this._promptType = type;
    document.querySelectorAll('.prompt-type-btn').forEach(btn => btn.classList.remove('active'));
    if (type === 'full') {
      document.getElementById('promptTypeFull')?.classList.add('active');
    } else {
      document.getElementById('promptTypeLite')?.classList.add('active');
    }
    // 如果已有结果，重新生成
    if (this._currentPredResult && document.getElementById('promptResultArea')?.style.display === 'block') {
      this._runDeepSeekAnalysis();
    }
  },

  // ── 渲染 AI 平台跳转按钮 ──
  _renderAIJumpButtons() {
    const container = document.getElementById('aiJumpButtons');
    if (!container || typeof DeepSeekEngine === 'undefined') return;
    const platforms = DeepSeekEngine.getAIPlatforms();
    container.innerHTML = platforms.map(p => `
      <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="ai-jump-btn" style="border-color:${p.color}40;" title="${p.name}">
        <span class="ai-jump-icon">${p.icon}</span>
        <span class="ai-jump-name">${p.name}</span>
      </a>
    `).join('');
  },

  // ── 复制 Prompt 到剪贴板 ──
  async _copyPrompt() {
    const text = this._currentPrompt || '';
    if (!text) return;
    const btn = document.getElementById('promptCopyBtn');
    const originalText = btn?.textContent;
    try {
      await navigator.clipboard.writeText(text);
      if (btn) {
        btn.textContent = I18n.lang === 'zh' ? '✅ 已复制' : I18n.lang === 'es' ? '✅ Copiado' : I18n.lang === 'fr' ? '✅ Copié' : '✅ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 2000);
      }
    } catch(e) {
      // 降级方案
      const textarea = document.getElementById('promptTextarea');
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        if (btn) {
          btn.textContent = '✅';
          setTimeout(() => { btn.textContent = originalText; }, 2000);
        }
      }
    }
  },

  // ── 复制单个关键词 ──
  async _copyKeyword(text, btnEl) {
    try {
      await navigator.clipboard.writeText(text);
      if (btnEl) {
        const orig = btnEl.textContent;
        btnEl.textContent = '✅';
        btnEl.classList.add('copied');
        setTimeout(() => { btnEl.textContent = orig; btnEl.classList.remove('copied'); }, 1500);
      }
    } catch(e) {
      // ignore
    }
  },

  // ── 渲染搜索关键词 ──
  _renderKeywords(pred, homeZh, awayZh) {
    const container = document.getElementById('keywordsList');
    if (!container) return;
    const keywords = DeepSeekEngine.buildKeywords(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh);
    container.innerHTML = keywords.map(k => `
      <button class="keyword-chip" onclick="App._copyKeyword('${k.replace(/'/g, "\\'")}', this)">${k}</button>
    `).join('');
  },

  // ── 从AI结果中提取比分（保留用于本地分析）──
  _extractScore(content) {
    if (!content) return null;
    const regexes = [
      /首选比分[：:]\s*\*{0,2}(\d+)\s*[:：]\s*(\d+)\*{0,2}/,
      /比分[：:]\s*\*{0,2}(\d+)\s*[:：]\s*(\d+)\*{0,2}/,
      /预测.*?(\d+)\s*[:：]\s*(\d+)/,
      /(\d+)\s*[:：]\s*(\d+)/
    ];
    for (const regex of regexes) {
      const match = content.match(regex);
      if (match) return `${match[1]}:${match[2]}`;
    }
    return null;
  },

  // ── Render + Auto Generate Prompt ──
  renderPredictionResultAndDS(result, showLottery, weather, matchInfo) {
    this._currentPredResult = result;
    this.renderPredictionResult(result, showLottery, weather, matchInfo);

    // Reset Prompt 面板
    const promptArea = document.getElementById('promptResultArea');
    const localSection = document.getElementById('localAnalysisSection');
    const btnContent = document.getElementById('dsAnalyzeBtnContent');
    if (promptArea) promptArea.style.display = 'none';
    if (localSection) localSection.style.display = 'none';
    if (btnContent) btnContent.innerHTML = I18n.lang === 'zh' ? '✨ 生成AI分析提示词' : I18n.lang === 'es' ? '✨ Generar prompt IA' : I18n.lang === 'fr' ? '✨ Générer prompt IA' : '✨ Generate AI prompt';

    const analyzeBtn = document.getElementById('dsAnalyzeBtn');
    if (analyzeBtn) analyzeBtn.disabled = false;

    // 自动生成 Prompt
    setTimeout(() => {
      const btn = document.getElementById('dsAnalyzeBtn');
      if (btn && !btn.disabled) this._runDeepSeekAnalysis();
    }, 600);
  }
};
