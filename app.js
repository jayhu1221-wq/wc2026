// ============================================
// app.js — UI Controller v3 (精简 + 天气 + 三重比分)
// ============================================

// 全局翻译函数别名（i18n.js 中定义了 window.t，此处引用以确保作用域内可用）
var _t = typeof window !== 'undefined' && typeof window.t === 'function'
  ? window.t.bind(window)
  : function(k){ return k; };

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
    const dayMarker = local.dayOffset === -1 ? `<span class="time-day-offset">${_t('common.day.before')}</span>`
                   : local.dayOffset === 1 ? `<span class="time-day-offset">${_t('common.day.after')}</span>` : '';
    const localLabel = `<span class="time-local">📍 ${local.localTime} ${local.country}</span>${dayMarker}`;
    return `<span class="dual-time">${bjLabel}<span class="time-sep">|</span>${localLabel}</span>`;
  },

  // ── 格式化双时区时间HTML（精简版，用于小卡片） ──
  _formatDualTimeCompact(bjTimeStr, venue) {
    const local = this._getLocalTime(bjTimeStr, venue);
    let bjLabel = `🇨🇳${bjTimeStr}`;
    if (!local) return bjLabel;
    const dayMarker = local.dayOffset === -1 ? `(${_t('common.day.before')})` : local.dayOffset === 1 ? `(${_t('common.day.after')})` : '';
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
    if (diffMs <= 0) return _t('common.kickoff');

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
    return _t('common.kickoff');
  },

  async init() {
    // 1. 导航标签绑定（必须在 DOM 就绪后调用）
    this.initNav();

    // 2. 初始化实时数据层（失败不影响后续渲染）
    try {
      if (typeof LiveData !== 'undefined') {
        await LiveData.init();
      }
    } catch(e) {
      console.warn('[App.init] LiveData.init failed:', e.message);
    }

    // 3. 渲染所有模块（每个独立 try/catch，互不阻塞）
    const renderFns = [
      ['renderTodayMatches', () => this.renderTodayMatches()],
      ['renderSchedule',      () => this.renderSchedule()],
      ['renderResults',       () => this.renderResults()],
      ['renderGroups',        () => this.renderGroups()],
      ['renderBracket',      () => this.renderBracket()],
      ['renderTeamsPower',    () => this.renderTeamsPower()],
    ];
    renderFns.forEach(([name, fn]) => {
      try { fn(); } catch(e) {
        console.error('[App.init] ' + name + ' ERROR:', e.message, e.stack);
      }
    });

    // 4. 初始化交互
    this.initFilters();
    this.initAI();
    this.initTeamSearch();
    this.startAutoRefresh();
    this.updateRefreshStatus();
    this._initResizeHandler();
    this._initDayChangeDetector();
    this._initDataFreshnessIndicator();

    // 5. 监听语言切换事件（先移除旧监听，防止重复绑定）
    document.removeEventListener('langchange', this._langChangeHandler);
    this._langChangeHandler = () => {
      this.renderTodayMatches();
      this.renderSchedule();
      this.renderResults();
      this.renderGroups();
      this.renderBracket();
      this.renderTeamsPower();
      this.initAI();
    };
    document.addEventListener('langchange', this._langChangeHandler);
  },

  // ── 安全初始化导航：确保 DOM 就绪 ──
  _safeInitNav() {
    const tabs = document.querySelectorAll('.nav-tab');
    if (tabs.length > 0) {
      this.initNav();
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initNav(), { once: true });
    } else {
      // DOM 已就绪但 nav-tab 仍未出现，稍后重试
      setTimeout(() => this._safeInitNav(), 100);
    }
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

  // ── Helper: Get team flag (img → emoji fallback) ──
  emoji(en, size) {
    const iso = WC2026_DATA.teamISO && WC2026_DATA.teamISO[en];
    const fallbackEmoji = WC2026_DATA.teamEmoji[en] || '🏴';
    if (iso) {
      const h = size || 24;
      var w = Math.round(h * 1.33);
      // 图片加载失败时回退为 emoji（通过 data-emoji 属性传递回退字符）
      var fe = fallbackEmoji.replace(/'/g, "\\'");
      return '<img src="https://flagcdn.com/' + iso + '.svg" width="' + w + '" height="' + h + '" alt="' + en + '" data-fe="' + fe + '" style="border-radius:2px;vertical-align:middle;display:inline-block;" onerror="var s=document.createElement(\'span\');s.textContent=this.getAttribute(\'data-fe\');s.style.fontSize=\''+h+'px\';s.style.verticalAlign=\'middle\';this.replaceWith(s)">';
    }
    return fallbackEmoji;
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
        this.switchTab(btn.dataset.tab);
      });
    });
  },

  // ── 切换标签页（供 initNav 和 HTML onclick 双重调用）──
  switchTab(tab) {
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-tab[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    const activeSection = document.getElementById(`tab-${tab}`);
    if (activeSection) activeSection.classList.add('active');
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
      <span class="day-section-title">${_t('today.matches')}</span>
      <span class="day-section-badge">${this.todayDate}</span>
      <span class="day-section-count">${todayCompleted.length + todayUpcoming.length} ${_t('today.match.unit')}</span>
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
          <div class="today-match-group">🏆 ${this.groupLabel(r.group)} · ${dualTime} · <span style="color:#9ca3af;font-size:10px;">📍 ${this.venueName(r.venue)}</span></div>
          <div class="today-match-teams">
            <span class="today-team">${hE} ${hZh}</span>
            <span class="today-vs-score" style="color:#22c55e;font-weight:900;">${r.hg} - ${r.ag}</span>
            <span class="today-team">${aZh} ${aE}</span>
          </div>
          <div class="today-match-status-ft">${_t('match.ft')}</div>
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
        statusHtml = `<div class="today-match-live">${_t('match.live')} · ${liveMin}</div><div class="live-score-display" style="text-align:center;font-size:24px;font-weight:900;color:#ef4444;margin:4px 0;">${liveHg} - ${liveAg}</div>`;
      } else if (matchStatus === 'likely_completed') {
        statusHtml = `<div class="today-match-live" style="color:#f97316;">${_t('match.likely.completed')}</div>`;
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
              <div class="score-tag primary" title="${_t('pred.score.primary')}">🥇 ${pred.primaryScore.home}:${pred.primaryScore.away} <span class="pct">${pred.primaryScore.pct}%</span></div>
              <div class="score-tag secondary" title="${_t('pred.score.secondary')}">🥈 ${pred.secondaryScore.home}:${pred.secondaryScore.away} <span class="pct">${pred.secondaryScore.pct}%</span></div>
              <div class="score-tag defensive" title="${_t('pred.score.defensive')}">🎯 ${pred.defensiveScore.home}:${pred.defensiveScore.away} <span class="pct">${pred.defensiveScore.pct}%</span></div>
            </div>
            <div class="today-probs">
              <span class="prob-chip home">${_t('prob.home.win')} ${Math.round(pred.homeWinProb*100)}%</span>
              <span class="prob-chip draw">${_t('prob.draw.short')} ${Math.round(pred.drawProb*100)}%</span>
              <span class="prob-chip away">${_t('prob.away.win')} ${Math.round(pred.awayWinProb*100)}%</span>
            </div>
          ` : ''}
          ${statusHtml}
          <div id="weather-card-today-${i}" class="weather-mini">
            <span class="weather-loading">${_t('weather.loading')}</span>
          </div>
          <button class="today-match-predict-btn" onclick="event.stopPropagation(); App.showDayPrediction('today',${i})">
            📊 ${_t('today.view.ai')}
          </button>
        </div>
      `;
    });

    // ====== 明日区域 ======
    const tomorrowUpcoming = this.getTomorrowMatches();
    const tomorrowCompleted = this.getTomorrowCompletedMatches();

    html += `<div class="day-section-header tomorrow-section">
      <span class="day-section-icon">📆</span>
      <span class="day-section-title">${_t('today.tomorrow')}</span>
      <span class="day-section-badge tomorrow">${this.tomorrowDate}</span>
      <span class="day-section-count">${tomorrowCompleted.length + tomorrowUpcoming.length} ${_t('today.match.unit')}</span>
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
          <div class="today-match-group">🏆 ${this.groupLabel(r.group)} · ${dualTime} · <span style="color:#9ca3af;font-size:10px;">📍 ${this.venueName(r.venue)}</span></div>
          <div class="today-match-teams">
            <span class="today-team">${hE} ${hZh}</span>
            <span class="today-vs-score" style="color:#22c55e;font-weight:900;">${r.hg} - ${r.ag}</span>
            <span class="today-team">${aZh} ${aE}</span>
          </div>
          <div class="today-match-status-ft">${_t('match.ft')}</div>
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
        statusHtml = `<div class="today-match-live">${_t('match.live')} · ${liveMin}</div><div class="live-score-display" style="text-align:center;font-size:24px;font-weight:900;color:#ef4444;margin:4px 0;">${liveHg} - ${liveAg}</div>`;
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
              <div class="score-tag primary" title="${_t('pred.score.primary')}">🥇 ${pred.primaryScore.home}:${pred.primaryScore.away} <span class="pct">${pred.primaryScore.pct}%</span></div>
              <div class="score-tag secondary" title="${_t('pred.score.secondary')}">🥈 ${pred.secondaryScore.home}:${pred.secondaryScore.away} <span class="pct">${pred.secondaryScore.pct}%</span></div>
              <div class="score-tag defensive" title="${_t('pred.score.defensive')}">🎯 ${pred.defensiveScore.home}:${pred.defensiveScore.away} <span class="pct">${pred.defensiveScore.pct}%</span></div>
            </div>
            <div class="today-probs">
              <span class="prob-chip home">${_t('prob.home.win')} ${Math.round(pred.homeWinProb*100)}%</span>
              <span class="prob-chip draw">${_t('prob.draw.short')} ${Math.round(pred.drawProb*100)}%</span>
              <span class="prob-chip away">${_t('prob.away.win')} ${Math.round(pred.awayWinProb*100)}%</span>
            </div>
          ` : ''}
          ${statusHtml}
          <div id="weather-card-tomorrow-${i}" class="weather-mini">
            <span class="weather-loading">${_t('weather.loading')}</span>
          </div>
          <button class="today-match-predict-btn" onclick="event.stopPropagation(); App.showDayPrediction('tomorrow',${i})">
            📊 ${_t('today.view.ai')}
          </button>
        </div>
      `;
    });

    if (todayCompleted.length + todayUpcoming.length + tomorrowCompleted.length + tomorrowUpcoming.length === 0) {
      html = `<div style="text-align:center;padding:20px;color:var(--text-muted);">${_t('today.no.matches')}</div>`;
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
      <span class="weather-city">${this.venueName(weather.city)}</span>
      <span class="weather-temp">${weather.temp}°C</span>
      <span class="weather-wind">💨${weather.wind}km/h</span>
      <span class="weather-desc">${weather.desc}</span>
      ${weather.mock ? `<span class="weather-mock">${_t('weather.estimated')}</span>` : ''}
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
    this.renderPredictionResultAndAI(pred, true, weather, m);

    document.getElementById('predictionResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    document.getElementById('resultHomeFlag').innerHTML = hE;
    document.getElementById('resultHomeName').textContent = hZh;
    document.getElementById('resultHomeRank').textContent = homeRank ? `${_t('pred.fifa.rank')}${homeRank.rank}` : '';
    document.getElementById('resultAwayFlag').innerHTML = aE;
    document.getElementById('resultAwayName').textContent = aZh;
    document.getElementById('resultAwayRank').textContent = awayRank ? `${_t('pred.fifa.rank')}${awayRank.rank}` : '';

    // ─ Weather strip ─
    const weatherEl = document.getElementById('matchWeatherStrip');
    if (weatherEl && weather && !weather.error) {
      weatherEl.innerHTML = `
        <div class="weather-strip">
          <span>${weather.icon} <strong>${this.venueName(weather.city)}</strong></span>
          <span>🌡️ ${weather.temp}°C（${_t('weather.feels')} ${weather.feelsLike}°C）</span>
          <span>💧 ${_t('weather.humidity')} ${weather.humidity}%</span>
          <span>💨 ${_t('weather.wind')} ${weather.wind} km/h</span>
          <span class="weather-impact">${weather.impact}</span>
          ${weather.mock ? `<span style="opacity:.5;font-size:10px;">（${_t('weather.estimated')}）</span>` : ''}
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
            <div class="ts-label">${_t('pred.score.primary')}</div>
            <div class="ts-score">${primaryScore.home} : ${primaryScore.away}</div>
            <div class="ts-pct">${_t('pred.probability')} ${primaryScore.pct}%</div>
            <div class="ts-note">${_t('pred.best.pick')}</div>
          </div>
          <div class="ts-card secondary-card">
            <div class="ts-label">${_t('pred.score.secondary')}</div>
            <div class="ts-score">${secondaryScore.home} : ${secondaryScore.away}</div>
            <div class="ts-pct">${_t('pred.probability')} ${secondaryScore.pct}%</div>
            <div class="ts-note">${_t('pred.second.pick')}</div>
          </div>
          <div class="ts-card defensive-card">
            <div class="ts-label">${_t('pred.score.defensive')}</div>
            <div class="ts-score">${defensiveScore.home} : ${defensiveScore.away}</div>
            <div class="ts-pct">${_t('pred.probability')} ${defensiveScore.pct}%</div>
            <div class="ts-note">${_t('pred.upset.pick')}</div>
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
          <span>${hZh} ${winPct}%</span><span>${_t('pred.draw.label')} ${drawPctH}%</span><span>${aZh} ${lossPct}%</span>
        </div>`;
    } else {
      h2hEl.innerHTML += `<p style="color:var(--text-dim); font-size:12px;">${_t('pred.no.h2h')}</p>`;
    }

    // ─ Form ─
    const form = components.form;
    document.getElementById('formData').innerHTML = `
      <div class="metric-row">
        <span class="metric-label">${hE} ${hZh}</span>
        <span class="metric-value">
          ${(homeStats.recentForm || []).map(f => this.formBadge(f)).join(' ')} (${form.homeForm}${_t('pred.form.pts')})
        </span>
      </div>
      <div class="metric-row">
        <span class="metric-label">${aE} ${aZh}</span>
        <span class="metric-value">
          ${(awayStats.recentForm || []).map(f => this.formBadge(f)).join(' ')} (${form.awayForm}${_t('pred.form.pts')})
        </span>
      </div>`;

    // ─ Attack & Defense ─
    const ad = components.attackDefense;
    document.getElementById('attackData').innerHTML = `
      <div class="metric-row"><span class="metric-label">${hZh} ${_t('analysis.attack.label')}</span><span class="metric-value ${ad.homeAttack>=8.5?'high':''}">${ad.homeAttack.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">${hZh} ${_t('analysis.defense.label')}</span><span class="metric-value ${ad.homeDefense>=8.0?'high':''}">${ad.homeDefense.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">${aZh} ${_t('analysis.attack.label')}</span><span class="metric-value ${ad.awayAttack>=8.5?'high':''}">${ad.awayAttack.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">${aZh} ${_t('analysis.defense.label')}</span><span class="metric-value ${ad.awayDefense>=8.0?'high':''}">${ad.awayDefense.toFixed(1)}/10</span></div>
      <div class="metric-row"><span class="metric-label">${_t('pred.expected.goals')}</span><span class="metric-value">${(parseFloat(result.expectedGoals?.home||1.5)+parseFloat(result.expectedGoals?.away||1.5)).toFixed(1)} ${_t('pred.goals.unit')}</span></div>`;

    // ─ Players ─
    document.getElementById('playerData').innerHTML = `
      <div class="metric-row"><span class="metric-label">${hE} ${_t('pred.core.player')}</span><span class="metric-value" style="font-size:12px;">${homeStats.starPlayer}</span></div>
      <div class="metric-row"><span class="metric-label">${aE} ${_t('pred.core.player')}</span><span class="metric-value" style="font-size:12px;">${awayStats.starPlayer}</span></div>
      <div class="metric-row"><span class="metric-label">${hZh} ${_t('pred.tactics')}</span><span class="metric-value" style="font-size:12px;">${homeStats.style}</span></div>
      <div class="metric-row"><span class="metric-label">${aZh} ${_t('pred.tactics')}</span><span class="metric-value" style="font-size:12px;">${awayStats.style}</span></div>
      <div class="metric-row"><span class="metric-label">${_t('pred.championships')}</span><span class="metric-value">${homeStats.worldcupWins}🏆 vs ${awayStats.worldcupWins}🏆</span></div>`;

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
      parlays.push({ type: _t('parlay.type.winloss'), picks: [{ label: _t('parlay.home.win'), detail: `${hZh} ${_t('parlay.home.win')} · ${_t('pred.probability')} ${hPct}%` }], odds: this._estimateOdds(hPct) });
    } else if (aPct >= 60) {
      parlays.push({ type: _t('parlay.type.winloss'), picks: [{ label: _t('parlay.away.win'), detail: `${aZh} ${_t('parlay.away.win')} · ${_t('pred.probability')} ${aPct}%` }], odds: this._estimateOdds(aPct) });
    } else {
      parlays.push({ type: _t('parlay.type.winloss'), picks: [{ label: _t('parlay.unbeaten.pick'), detail: `${favTeam} ${_t('parlay.unbeaten')} · ${_t('pred.probability')} ${favPct + dPct}%` }], odds: this._estimateOdds(favPct + dPct) });
    }

    parlays.push({
      type: _t('parlay.type.goals'),
      picks: [{ label: totalGoals >= 3 ? _t('parlay.over.pick') : _t('parlay.under.pick'), detail: `${_t('parlay.total.goals.pred')} ${totalGoals}，${totalGoals>=3?_t('parlay.over.pick'):_t('parlay.under.pick')}${_t('parlay.tendency')}` }],
      odds: totalGoals >= 3 ? 1.80 : 1.75
    });

    parlays.push({
      type: _t('parlay.type.score1'),
      picks: [
        { label: `${primaryScore.home}:${primaryScore.away}`, detail: `${_t('parlay.primary.score')} · ${_t('pred.probability')} ${primaryScore.pct}%` }
      ],
      odds: this._estimateOdds(parseFloat(primaryScore.pct) * 1.5)
    });

    parlays.push({
      type: _t('parlay.type.score2'),
      picks: [
        { label: `${secondaryScore.home}:${secondaryScore.away}`, detail: `${_t('parlay.secondary.score')} · ${_t('pred.probability')} ${secondaryScore.pct}%` }
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
        const dayLabel = oMatch.day === 'tomorrow' ? _t('parlay.tomorrow.tag') : '';
        parlays.push({
          type: _t('parlay.type.parlay2'),
          picks: [
            { label: `${_t('parlay.match.unit')}1`, detail: `${favTeam} ${_t('parlay.unbeaten')}` },
            { label: `${_t('parlay.match.unit')}2${dayLabel}`, detail: `${oFav} ${_t('parlay.unbeaten')}` }
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
          const dl = am.day === 'tomorrow' ? _t('parlay.tomorrow.tag') : '';
          picks3.push({ label: `场${picks3.length+2}${dl}`, detail: `${fav} ${_t('parlay.unbeaten')}` });
          odds3 *= this._estimateOdds(favP);
          used.add(ap.homeTeam);
          used.add(ap.awayTeam);
        }
        if (picks3.length >= 1) {
          parlays.push({
            type: _t('parlay.type.parlay3'),
            picks: [{ label: `${_t('parlay.match.unit')}1`, detail: `${favTeam} ${_t('parlay.unbeaten')}` }, ...picks3],
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
          <span class="odds-label">${_t('parlay.ref.odds')}</span>
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
            <span class="match-status status-ft">${_t('match.ft')}</span>
            <span class="match-venue-tag">📍 ${this.venueName(r.venue)}</span>
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
            statusBadge = `<span class="match-status status-live">${_t('match.live')} · ${m.liveScore.min || '--'}</span>`;
            scoreDisplay = `<span class="match-score-block score-live-pulse" style="color:#ef4444;font-weight:900;">${m.liveScore.hg} - ${m.liveScore.ag}</span>`;
          } else {
            statusBadge = `<span class="match-status status-live">${_t('match.live')}</span>`;
            scoreDisplay = '<span class="match-score-block score-live-pulse" style="color:#fbbf24;">VS</span>';
          }
        } else if (matchStatus === 'likely_completed') {
          statusBadge = `<span class="match-status" style="color:#f97316;">${_t('match.likely.completed')}</span>`;
          scoreDisplay = `<span class="match-score-block" style="color:#f97316;">${_t('match.tbd.score')}</span>`;
        } else {
          statusBadge = `<span class="match-status status-upcoming">${_t('match.upcoming.short')}</span>`;
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
        <div class="schedule-day-header">🏆 ${_t('bracket.ko.round')}</div>
        <div class="schedule-match upcoming">
          <span class="match-group-badge">KO</span>
          <div class="match-teams-block">
            <div class="match-teams-row">
              <span class="match-home">${_t('bracket.group.qualifier')}</span>
              <span class="match-score-block upcoming-label">VS</span>
              <span class="match-away">${_t('bracket.group.qualifier')}</span>
            </div>
          </div>
          <span class="match-status status-upcoming">${_t('common.TBD')}</span>
          <span class="match-venue-tag">${_t('bracket.multi.city')}</span>
        </div>
        <div class="schedule-day-header">🏆 ${_t('bracket.final.match')}</div>
        <div class="schedule-match upcoming">
          <span class="match-group-badge">${_t('bracket.final.tag')}</span>
          <div class="match-teams-block">
            <div class="match-teams-row">
              <span class="match-home">${_t('bracket.sf.winner')}</span>
              <span class="match-score-block upcoming-label">VS</span>
              <span class="match-away">${_t('bracket.sf.winner')}</span>
            </div>
          </div>
          <span class="match-status status-upcoming">${_t('common.TBD')}</span>
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
          result = _t('parlay.hit.full');
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
            result = _t('parlay.hit.direction');
            resultClass = 'partial';
            resultIcon = '✓';
            correctWins++;
          } else {
            result = _t('parlay.hit.miss');
            resultClass = 'wrong';
            resultIcon = '✗';
          }
        }

        totalWithPred++;
        totalMatches++;

        predHtml = `
          <div class="rc-prediction">
            <div class="rc-pred-label">${_t('results.ai.pred')}</div>
            <div class="rc-pred-comparison">
              <div class="rc-pred-side rc-pred-predicted">
                <div class="rc-pred-side-label">${_t('results.predicted')}</div>
                <div class="rc-pred-score">${predHg} - ${predAg}</div>
              </div>
              <div class="rc-pred-vs">→</div>
              <div class="rc-pred-side rc-pred-actual">
                <div class="rc-pred-side-label">${_t('results.actual')}</div>
                <div class="rc-pred-score">${actualHg} - ${actualAg}</div>
              </div>
              <div class="rc-pred-result rc-pred-${resultClass}">${resultIcon} ${result}</div>
            </div>
          </div>`;
      } else {
        // 无预测数据
        predHtml = `
          <div class="rc-prediction rc-pred-na">
            <div class="rc-pred-label">${_t('results.ai.pred')}</div>
            <div class="rc-pred-na-text">${_t('results.not.recorded')}</div>
          </div>`;
        totalMatches++;
      }

      html += `
        <div class="result-card">
          <div class="rc-header">
            <div class="rc-date">${r.date}</div>
            <div class="rc-time">${dualTime}</div>
            <div class="rc-group">${r.group}${_t('common.group')}</div>
          </div>
          <div class="rc-teams">
            <div class="rc-team">
              <div style="margin-bottom:4px;">${this.emoji(r.home, 36)}</div>
              <div>${hZh}</div>
            </div>
            <div class="rc-score">${r.hg} - ${r.ag}</div>
            <div class="rc-team">
              <div style="margin-bottom:4px;">${this.emoji(r.away, 36)}</div>
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
            <div class="accuracy-label">${_t('results.accuracy')}</div>
            <div class="accuracy-value">${accuracy}<span class="accuracy-unit">%</span></div>
            <div class="accuracy-sub">${_t('results.direction')} · ${correctWins}/${totalWithPred}${_t('results.match.unit')}</div>
          </div>
        </div>
        <div class="accuracy-card accuracy-exact">
          <div class="accuracy-icon">🎯</div>
          <div class="accuracy-content">
            <div class="accuracy-label">${_t('results.exact.hit')}</div>
            <div class="accuracy-value">${exactRate}<span class="accuracy-unit">%</span></div>
            <div class="accuracy-sub">${_t('results.exact.rate')} · ${exactHits}/${totalWithPred}${_t('results.match.unit')}</div>
          </div>
        </div>
        <div class="accuracy-card accuracy-total">
          <div class="accuracy-icon">⚽</div>
          <div class="accuracy-content">
            <div class="accuracy-label">${_t('results.completed')}</div>
            <div class="accuracy-value">${totalMatches}<span class="accuracy-unit">${_t('results.match.unit')}</span></div>
            <div class="accuracy-sub">${WC2026_DATA.completedResults.length > 0 ? WC2026_DATA.completedResults[WC2026_DATA.completedResults.length-1].date + ' ' + _t('results.latest') : ''}</div>
          </div>
        </div>
      </div>`;

    if (!html) html = `<div style="text-align:center;padding:48px;color:var(--text-dim);">${_t('results.no.data')}</div>`;
    grid.innerHTML = html;

    // 统计卡片独立渲染到专属容器
    const banner = document.getElementById('accuracyBanner');
    if (banner) banner.innerHTML = summaryHtml;
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
        <span class="bk-name">${label || _t('bracket.tbd')}</span>
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
        <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">${_t('bracket.tbd')}</span></div>
        <div class="bk-vs"><span>VS</span></div>
        <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">${_t('bracket.tbd')}</span></div>
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
      ${roundCol(upperR32, 8, _t('bracket.r32'), '6/28-7/3', 'R32', 'upper', false)}
      ${connectorCol(4, 'right')}
      ${roundCol([], 4, _t('bracket.r16'), '7/4-7/7', 'R16', 'upper', true)}
      ${connectorCol(2, 'right')}
      ${roundCol([], 2, _t('bracket.qf'), '7/8-7/11', 'QF', 'upper', true)}
      ${connectorCol(1, 'right')}
      <div class="bk-round-col bk-sf-col">
        <div class="bk-round-title">${_t('bracket.sf1')}<span class="bk-round-date">7/14</span></div>
        <div class="bk-round-matches">
          <div class="bk-pair">${emptyMatchCard('SF', 0, 'upper')}</div>
        </div>
      </div>
    `;

    // ── Center: 3rd Place + Final ──
    const centerCol = `
      <div class="bk-center-col">
        <div class="bk-center-label">${_t('bracket.final.stage')}</div>
        <div class="bk-match bk-3rd-place">
          <div class="bk-match-header">
            <span class="bk-round-tag">${_t('bracket.3rd')}</span>
            <span class="bk-round-date">7/18</span>
          </div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">${_t('bracket.sf1.loser')}</span></div>
          <div class="bk-vs"><span>VS</span></div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">${_t('bracket.sf2.loser')}</span></div>
        </div>
        <div class="bk-match bk-final">
          <div class="bk-match-header">
            <span class="bk-round-tag bk-final-tag">${_t('bracket.final')}</span>
            <span class="bk-round-date">7/19</span>
          </div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">${_t('bracket.sf1.winner')}</span></div>
          <div class="bk-vs bk-vs-final"><span>VS</span></div>
          <div class="bk-team bk-empty"><span class="bk-emoji">🏴</span><span class="bk-name">${_t('bracket.sf2.winner')}</span></div>
        </div>
        <div class="bk-champion-slot">
          <div class="bk-trophy">🏆</div>
          <div class="bk-champion-label">${_t('bracket.champion')}</div>
        </div>
      </div>
    `;

    // ── Lower Half: SF2 ← QF(3-4) ← R16(5-8) ← R32(9-16) ──
    const lowerHalf = `
      <div class="bk-round-col bk-sf-col">
        <div class="bk-round-title">${_t('bracket.sf2')}<span class="bk-round-date">7/15</span></div>
        <div class="bk-round-matches">
          <div class="bk-pair">${emptyMatchCard('SF', 0, 'lower')}</div>
        </div>
      </div>
      ${connectorCol(1, 'left')}
      ${roundCol([], 2, _t('bracket.qf'), 'QF', 'lower', true)}
      ${connectorCol(2, 'left')}
      ${roundCol([], 4, _t('bracket.r16'), 'R16', 'lower', true)}
      ${connectorCol(4, 'left')}
      ${roundCol(lowerR32, 8, _t('bracket.r32'), 'R32', 'lower', false)}
    `;

    // ── Assemble ──
    container.innerHTML = `
      <div class="bk-legend">
        <div class="bk-legend-left">
          <span>${_t('bracket.based.on')} <strong>${filledCount}</strong>${_t('bracket.seats')}</span>
        </div>
        <div class="bk-legend-right">
          <span class="bk-legend-dot" style="background:#4ade80"></span> ${_t('bracket.upper')}
          <span class="bk-legend-dot" style="background:#f59e0b"></span> ${_t('bracket.final.tag')}
          <span class="bk-legend-dot" style="background:#60a5fa"></span> ${_t('bracket.lower')}
          <span class="bk-legend-dot" style="background:#4d7a5e"></span> ${_t('bracket.tbd')}
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
        console.log(`[App] Date change: ${lastDate} → ${currentDate}, forcing refresh`);
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
    indicator.innerHTML = `<span class="df-dot"></span><span class="df-label">${_t('common.local.data')}</span>`;
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
        <div class="group-card-header">🏅 ${this.groupLabel(grp)}</div>
        <table class="group-table">
          <thead><tr><th>${_t('group.table.pos')}</th><th>${_t('group.table.team')}</th><th>${_t('group.table.played')}</th><th>${_t('group.table.win')}</th><th>${_t('group.table.draw')}</th><th>${_t('group.table.loss')}</th><th>${_t('group.table.gd')}</th><th>${_t('group.table.pts')}</th></tr></thead>
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
    if (!list) { console.error('[renderTeamsPower] #teamsPowerList not found'); return; }
    
    try {
      var statsCount = Object.keys(WC2026_DATA.teamStats || {}).length;
    } catch(e) {
      list.innerHTML = '<div style="color:#f87171;padding:12px;">⚠️ 数据加载失败: teamStats</div>';
      return;
    }

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
            <div class="power-name-sub">${t.rank?`${_t('pred.fifa.rank')}${t.rank.rank}`:''} ${t.stats.worldcupWins>0?'🏆'.repeat(t.stats.worldcupWins):''}</div>
          </div>
          <div class="power-metrics">
            <div class="power-metric"><div class="pm-val" style="color:#16a34a">${t.stats.attack.toFixed(1)}</div><div class="pm-label">${_t('tp.attack')}</div></div>
            <div class="power-metric"><div class="pm-val" style="color:#dc2626">${t.stats.defense.toFixed(1)}</div><div class="pm-label">${_t('tp.defense')}</div></div>
            <div class="power-metric"><div class="pm-val" style="color:#f59e0b">${t.power.toFixed(1)}</div><div class="pm-label">${_t('tp.overall')}</div></div>
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
                <div class="td-sub">${t.rank ? `${_t('pred.fifa.rank')}${t.rank.rank}` : ''} · ${teamGroup}${_t('common.group')} · ${t.stats.worldcupWins > 0 ? '🏆'.repeat(t.stats.worldcupWins) : ''}</div>
              </div>
            </div>
            <button class="td-close-btn" onclick="App.showTeamDetail('${t.name}')">✕ <span data-i18n="team.tab.close">${_t('td.close')}</span></button>
          </div>
          <div class="td-tabs">
            <button class="td-tab${activeTab==='squad'?' active':''}" onclick="App._switchTeamTab('squad','${t.name}')">💰 ${_t('td.squad.value.tab')}</button>
            <button class="td-tab${activeTab==='injuries'?' active':''}" onclick="App._switchTeamTab('injuries','${t.name}')">🏥 ${_t('team.tab.injuries')}</button>
            <button class="td-tab${activeTab==='analysis'?' active':''}" onclick="App._switchTeamTab('analysis','${t.name}')">📊 ${_t('team.tab.analysis')}</button>
            <button class="td-tab${activeTab==='history'?' active':''}" onclick="App._switchTeamTab('history','${t.name}')">📜 ${_t('td.history.tab')}</button>
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
          <div class="squad-total-val">${_t('td.squad.value')} <strong>${totalVal}</strong></div>
          <div class="squad-count">${_t('td.squad.count')} ${detail.squad.length} ${_t('td.squad.people')}</div>
        </div>
        <table class="squad-table">
          <thead><tr><th>#</th><th>${_t('td.position')}</th><th>${_t('td.player')}</th><th>${_t('td.club')}</th><th>${_t('td.value')}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }

    // Simple fallback
    if (simple) {
      return `
        <div class="squad-summary">
          <div class="squad-total-val">${_t('td.squad.value')} <strong>${simple.totalValue}</strong></div>
        </div>
        <div class="simple-detail-card">
          <div class="simple-label">${_t('td.star.player')}</div>
          <div class="simple-value">${simple.starPlayers}</div>
        </div>
        <div class="detail-note">${_t('td.more.info')}</div>
      `;
    }

    return `<div class="detail-note">${_t('td.no.squad')}</div>`;
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
        <div class="injury-summary">${_t('td.injury.players')} <strong>${detail.injuries.length}</strong> ${_t('td.injury.count')}</div>
        <div class="injury-list">${rows}</div>
        ${detail.injuries.some(i => i.status.includes('缺席')) ? `<div class="injury-warn">${_t('td.injury.warn')}</div>` : ''}
      `;
    }

    // Simple fallback
    if (simple) {
      return `
        <div class="injury-summary">${_t('td.injury.status')}</div>
        <div class="simple-detail-card">
          <div class="simple-value">${simple.injuries}</div>
        </div>
      `;
    }

    return '<div class="' + 'injury-ok' + '">' + _t('td.no.injury') + '</div>';
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

    const analysis = detail?.analysis || simple?.analysis || _t('td.no.analysis');

    return `
      <div class="analysis-metrics">
        <div class="am-row">
          <span class="am-label">⚔️ ${_t('tp.attack')}</span>
          <div class="am-bar-wrap"><div class="am-bar am-attack" style="width:${attackWidth}%"></div></div>
          <span class="am-val">${attack.toFixed(1)}</span>
        </div>
        <div class="am-row">
          <span class="am-label">🛡️ ${_t('tp.defense')}</span>
          <div class="am-bar-wrap"><div class="am-bar am-defense" style="width:${defenseWidth}%"></div></div>
          <span class="am-val">${defense.toFixed(1)}</span>
        </div>
        <div class="am-row">
          <span class="am-label">📈 ${_t('td.form')}</span>
          <div class="am-bar-wrap"><div class="am-bar am-form" style="width:${formWidth}%"></div></div>
          <span class="am-val">${formScore.toFixed(1)}</span>
        </div>
        <div class="am-row">
          <span class="am-label">🏅 ${_t('td.rank')}</span>
          <div class="am-bar-wrap"><div class="am-bar am-rank" style="width:${rankWidth}%"></div></div>
          <span class="am-val">${rank ? '#'+rank.rank : '-'}</span>
        </div>
      </div>
      <div class="analysis-quick-stats">
        <div class="aqs-item"><span class="aqs-val">${stats.style || '-'}</span><span class="aqs-label">${_t('td.tactical.style')}</span></div>
        <div class="aqs-item"><span class="aqs-val">${stats.starPlayer || '-'}</span><span class="aqs-label">${_t('td.star.player')}</span></div>
        <div class="aqs-item"><span class="aqs-val">${form.map(f => this.formBadge(f)).join(' ')}</span><span class="aqs-label">${_t('td.recent.trend')}</span></div>
        <div class="aqs-item"><span class="aqs-val">${stats.worldcupWins}🏆</span><span class="aqs-label">${_t('td.wc.championships')}</span></div>
      </div>
      <div class="analysis-text">
        <div class="at-title">📋 ${zh}${_t('td.wc.prospect')}</div>
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
          <div class="hs-title">🎯 ${_t('td.this.wc.played')}</div>
          ${thisWC.map(r => {
            const isHome = r.home === teamName;
            const won = isHome ? r.hg > r.ag : r.ag > r.hg;
            const drew = r.hg === r.ag;
            const resultClass = won ? 'h-win' : drew ? 'h-draw' : 'h-loss';
            const resultText = won ? _t('common.win.short') : drew ? _t('common.draw.short') : _t('common.loss.short');
            const opp = isHome ? r.away : r.home;
            const oppZh = this.zhName(opp);
            const oppE = this.emoji(opp);
            const dualTime = this._formatDualTimeCompact(r.time, r.venue);
            return `<div class="h-match ${resultClass}">
              <span class="hm-result">${resultText}</span>
              <span class="hm-teams">${emoji} ${zh} ${r.hg} - ${r.ag} ${oppZh} ${oppE}</span>
              <span class="hm-info">${this.groupLabel(r.group)} · ${r.date} ${dualTime}</span>
            </div>`;
          }).join('')}
        </div>`;
    }

    let upcomingHtml = '';
    if (upcoming.length > 0) {
      upcomingHtml = `
        <div class="history-section">
          <div class="hs-title">📅 ${_t('td.this.wc.upcoming')}</div>
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
          <div class="hs-title">${_t('td.h2h.records')}</div>
          <table class="h2h-detail-table">
            <thead><tr><th>${_t('td.h2h.opponent')}</th><th>${_t('td.h2h.matches')}</th><th>${_t('common.win.short')}</th><th>${_t('common.draw.short')}</th><th>${_t('common.loss.short')}</th><th>${_t('td.h2h.winrate')}</th></tr></thead>
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
        <div class="ho-card"><div class="ho-val">${wcStats}</div><div class="ho-label">${_t('td.wc.total.matches')}</div></div>
        <div class="ho-card"><div class="ho-val" style="color:#22c55e">${wcGF}</div><div class="ho-label">${_t('td.wc.total.goals')}</div></div>
        <div class="ho-card"><div class="ho-val" style="color:#dc2626">${wcGA}</div><div class="ho-label">${_t('td.wc.total.conceded')}</div></div>
        <div class="ho-card"><div class="ho-val">${avgGF.toFixed(2)}</div><div class="ho-label">${_t('td.wc.avg.goals')}</div></div>
        <div class="ho-card"><div class="ho-val">${avgGA.toFixed(2)}</div><div class="ho-label">${_t('td.wc.avg.conceded')}</div></div>
        <div class="ho-card"><div class="ho-val" style="color:#f59e0b">${stats.worldcupWins}🏆</div><div class="ho-label">${_t('td.wc.trophies')}</div></div>
      </div>
      ${thisWCHtml}
      ${upcomingHtml}
      ${h2hHtml}
      ${h2hRecords.length === 0 && thisWC.length === 0 ? '<div class="detail-note">' + _t('td.no.history') + '</div>' : ''}
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
  initAI() {
    const analyzeBtn = document.getElementById('dsAnalyzeBtn');
    const keyStatus = document.getElementById('dsKeyStatus');

    AIEngine.loadApiKey();
    const readyMsg = _t('ds.ready.msg');
    if (keyStatus) this._showKeyStatus(keyStatus, 'ok', readyMsg);

    // 语言切换时更新状态文字
    document.removeEventListener('langchange', this._dsLangHandler);
    this._dsLangHandler = () => {
      const el = document.getElementById('dsKeyStatus');
      if (el && el.classList.contains('ok')) el.textContent = _t('ds.ready.msg');
      const btnContent = document.getElementById('dsAnalyzeBtnContent');
      const btn = document.getElementById('dsAnalyzeBtn');
      if (btnContent) btnContent.innerHTML = _t('ds.generate.btn');
      if (btn && btn.textContent && btn.textContent.includes('✅')) btn.textContent = _t('ds.copied');
    };
    document.addEventListener('langchange', this._dsLangHandler);

    // 初始化AI平台跳转按钮
    this._renderAIJumpButtons();

    // 加载服务端可用的大模型列表
    this._loadAIProviders();

    // 默认 prompt 类型
    this._promptType = 'full';

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        await this._runAIAnalysis();
      });
    }
  },

  _showKeyStatus(el, type, msg) {
    if (!el) return;
    el.className = `ds-key-status ${type}`;
    el.textContent = msg;
  },

  async _runAIAnalysis() {
    if (!this._currentPredResult) {
      alert(_t('ds.select.first'));
      return;
    }

    const pred = this._currentPredResult;
    const homeZh = this.zhName(pred.homeTeam);
    const awayZh = this.zhName(pred.awayTeam);

    const analyzeBtn = document.getElementById('dsAnalyzeBtn');
    const btnContent = document.getElementById('dsAnalyzeBtnContent');

    // 短暂加载动画（Prompt 生成是同步的，给用户视觉反馈）
    analyzeBtn.disabled = true;
    const loadingText = _t('ds.generating');
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
      promptText = AIEngine.buildPrompt(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh, intelligence);
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
    const localData = AIEngine.generateLocalAnalysis(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh);
    const localSection = document.getElementById('localAnalysisSection');
    const localContent = document.getElementById('localAnalysisContent');
    if (localSection) localSection.style.display = 'block';
    if (localContent) localContent.innerHTML = AIEngine.formatResponse(localData.content);

    // 更新按钮
    analyzeBtn.disabled = false;
    const refreshText = _t('ds.regenerate');
    btnContent.innerHTML = refreshText;

    // 更新徽章
    const badge = document.getElementById('dsModelBadge');
    if (badge) {
      badge.textContent = _t('dual.ready');
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
      this._runAIAnalysis();
    }
  },

  // ── 渲染 AI 平台跳转按钮 ──
  _renderAIJumpButtons() {
    const container = document.getElementById('aiJumpButtons');
    if (!container || typeof AIEngine === 'undefined') return;
    const platforms = AIEngine.getAIPlatforms();
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
        btn.textContent = _t('ds.copied');
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
    const keywords = AIEngine.buildKeywords(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh);
    container.innerHTML = keywords.map(k => `
      <button class="keyword-chip" onclick="App._copyKeyword('${k.replace(/'/g, "\\'")}', this)">${k}</button>
    `).join('');
  },

  // ── Render + Auto Generate Prompt ──
  renderPredictionResultAndAI(result, showLottery, weather, matchInfo) {
    this._currentPredResult = result;
    this.renderPredictionResult(result, showLottery, weather, matchInfo);

    // Reset Prompt 面板
    const promptArea = document.getElementById('promptResultArea');
    const localSection = document.getElementById('localAnalysisSection');
    const btnContent = document.getElementById('dsAnalyzeBtnContent');
    if (promptArea) promptArea.style.display = 'none';
    if (localSection) localSection.style.display = 'none';
    if (btnContent) btnContent.innerHTML = _t('ds.generate.btn');

    const analyzeBtn = document.getElementById('dsAnalyzeBtn');
    if (analyzeBtn) analyzeBtn.disabled = false;

    // 自动生成 Prompt（仅提示词模式下）
    if (this._analysisMode !== 'auto') {
      setTimeout(() => {
        const btn = document.getElementById('dsAnalyzeBtn');
        if (btn && !btn.disabled) this._runAIAnalysis();
      }, 600);
    }
  },

  // =============================================
  //  大模型自动分析模块（服务端代理模式）
  //  API Key 内嵌于 Railway 后端，前端无需输入
  // =============================================

  _analysisMode: 'prompt',   // 'prompt' | 'auto'
  _selectedProvider: 'auto', // 'auto' | provider name
  _aiProviders: [],          // cached provider list from /api/status

  // ── 从服务端加载可用的大模型列表 ──
  async _loadAIProviders() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      const providers = data.services?.ai?.providers || [];
      this._aiProviders = providers;

      const container = document.getElementById('aiProviderButtons');
      const wrapper = document.getElementById('aiProviderSelector');
      if (!container || !wrapper) return;

      if (providers.length === 0) {
        wrapper.style.display = 'none';
        return;
      }

      wrapper.style.display = 'block';

      // "自动选择" 按钮（默认选中）
      let html = `<button class="ai-provider-btn auto active" onclick="App._selectProvider('auto')">
        <span class="provider-icon">⚡</span>
        <span>${_t('auto.model.auto')}</span>
      </button>`;

      // 各 Provider 按钮
      providers.forEach(p => {
        const icon = p.name.toLowerCase().includes('mimo') ? '🌟'
                   : p.name.toLowerCase().includes('openrouter') ? '🌐'
                   : '🤖';
        const statusClass = p.isGlobal ? '' : 'cn';
        const statusText = p.isGlobal ? _t('auto.model.global') : _t('auto.model.cn');
        html += `<button class="ai-provider-btn" onclick="App._selectProvider('${p.name}')" title="${p.endpoint}">
          <span class="provider-icon">${icon}</span>
          <span>${p.name}</span>
          <span class="provider-status ${statusClass}">${statusText}</span>
        </button>`;
      });

      container.innerHTML = html;
    } catch(e) {
      console.warn('[AI] 加载大模型列表失败:', e.message);
    }
  },

  // ── 选择大模型 Provider ──
  _selectProvider(name) {
    this._selectedProvider = name;
    document.querySelectorAll('.ai-provider-btn').forEach(btn => btn.classList.remove('active'));
    // 通过 onclick 属性匹配
    const btns = document.querySelectorAll('.ai-provider-btn');
    btns.forEach(btn => {
      if (btn.getAttribute('onclick')?.includes(`'${name}'`)) {
        btn.classList.add('active');
      }
    });
    console.log('[AI] 已选择 Provider:', name);
  },

  // ── 切换分析模式 ──
  _switchAnalysisMode(mode) {
    this._analysisMode = mode;
    document.querySelectorAll('.ds-mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(mode === 'auto' ? 'dsModeAuto' : 'dsModePrompt')?.classList.add('active');

    const promptSwitcher = document.getElementById('promptTypeSwitcher');
    const autoConfig = document.getElementById('autoAnalysisConfig');
    const promptBtn = document.getElementById('dsAnalyzeBtn');
    const autoBtn = document.getElementById('dsAutoAnalyzeBtn');
    const promptArea = document.getElementById('promptResultArea');
    const autoResult = document.getElementById('autoAnalysisResult');

    if (mode === 'auto') {
      if (promptSwitcher) promptSwitcher.style.display = 'none';
      if (autoConfig) autoConfig.style.display = 'block';
      if (promptBtn) promptBtn.style.display = 'none';
      if (autoBtn) autoBtn.style.display = 'flex';
      if (promptArea) promptArea.style.display = 'none';
    } else {
      if (promptSwitcher) promptSwitcher.style.display = 'flex';
      if (autoConfig) autoConfig.style.display = 'none';
      if (promptBtn) promptBtn.style.display = 'flex';
      if (autoBtn) autoBtn.style.display = 'none';
      if (autoResult) autoResult.style.display = 'none';
    }
  },

  // ── 执行大模型自动分析（调用后端 /api/analyze）──
  async _runAutoAnalysis() {
    if (!this._currentPredResult) return;

    const pred = this._currentPredResult;
    const homeZh = this.zhName(pred.homeTeam);
    const awayZh = this.zhName(pred.awayTeam);

    const btn = document.getElementById('dsAutoAnalyzeBtn');
    const btnContent = document.getElementById('dsAutoAnalyzeBtnContent');
    const resultDiv = document.getElementById('autoAnalysisResult');
    const contentDiv = document.getElementById('autoAnalysisContent');
    const modelBadge = document.getElementById('autoResultModel');

    if (btn) btn.disabled = true;
    if (btnContent) btnContent.innerHTML = `<div class="ds-loading-dots"><span></span><span></span><span></span></div> 分析中...`;
    if (resultDiv) resultDiv.style.display = 'block';
    if (contentDiv) contentDiv.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted);"><div class="ds-loading-dots" style="display:inline-block;"><span></span><span></span><span></span></div><p style="margin-top:12px;">正在调用大模型进行深度分析，请稍候...</p></div>`;

    try {
      // 获取赛前情报
      let intelligence = null;
      if (typeof LiveData !== 'undefined') {
        try {
          intelligence = await LiveData.fetchMatchIntelligence(pred.homeTeam, pred.awayTeam, '');
        } catch(e) { console.warn('[AutoAnalysis] 情报获取失败:', e.message); }
      }

      // 生成 Prompt（与复制提示词模式相同逻辑）
      const promptText = (this._promptType === 'lite' && typeof MimoEngine !== 'undefined')
        ? MimoEngine.buildPrompt(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh, intelligence)
        : AIEngine.buildPrompt(pred.homeTeam, pred.awayTeam, pred, homeZh, awayZh, intelligence);

      // 调用后端 /api/analyze 端点（服务端已内嵌 API Key）
      console.log('[AutoAnalysis] 调用 /api/analyze, provider:', this._selectedProvider, 'prompt length:', promptText.length);
      
      const apiRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptText,
          provider: this._selectedProvider || 'auto'
        })
      });

      const result = await apiRes.json();

      if (!result.ok) {
        // 服务端返回错误 — 直接展示错误信息，不做降级
        throw new Error(result.message || '分析请求失败');
      }

      const aiContent = result.content || '';
      if (!aiContent) throw new Error('大模型返回空结果');

      // 显示成功结果
      if (contentDiv) contentDiv.innerHTML = AIEngine.formatResponse(aiContent);
      if (modelBadge) modelBadge.textContent = `Server · ${result.model || 'AI'}`;
      if (btnContent) btnContent.innerHTML = '🔄 重新分析';

    } catch(e) {
      console.error('[AutoAnalysis] 分析失败:', e.message);

      // 失败时显示错误提示，绝不降级到本地分析
      if (contentDiv) contentDiv.innerHTML = `
        <div style="padding:24px;text-align:center;color:#f87171;">
          <div style="font-size:36px;margin-bottom:12px;">⚠️</div>
          <p style="font-weight:700;font-size:16px;margin-bottom:8px;">${e.message.includes('暂未上线') || e.message.includes('不可用') || e.message.includes('离线') || e.message.includes('超时') || e.message.includes('负载') || e.message.includes('失败') ? e.message : '⚠️ 无法完成分析'}</p>
          <p style="font-size:13px;color:var(--text-muted);margin-top:12px;">大模型服务暂时不可用，请稍后再试，或切换到「📋 复制提示词模式」手动在其他 AI 平台进行分析</p>
        </div>`;
      if (btnContent) btnContent.innerHTML = '🤖 开始大模型分析';
    } finally {
      if (btn) btn.disabled = false;
    }
  }
};

// 初始化由 index.html 脚本加载完成后统一触发（见 index.html loadNext 回调）
