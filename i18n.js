// ============================================
// i18n.js — 多语言国际化系统 v1.0
// 支持语言: 中文(zh) / English(en) / Español(es) / Français(fr)
// ============================================

const I18n = {

  // 当前语言（默认从 localStorage 读取，其次浏览器语言，最后中文）
  _currentLang: 'zh',

  // 支持的语言列表
  supportedLangs: [
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ],

  // ════════════════════════════════════════════
  //  翻译字典
  // ════════════════════════════════════════════
  translations: {

    // ── 中文（默认）──
    zh: {
      // Header
      'header.badge': '🏆 2026 美加墨世界杯 · 第23届FIFA世界杯 · 美国 · 加拿大 · 墨西哥',
      'header.title': 'AI 比分预测系统',
      'header.subtitle': '融合历史对战 · 球队实力 · 伤停情报 · 阵容分析 · 天气因素的六维智能引擎',
      'header.stat.teams': '参赛球队',
      'header.stat.matches': '比赛场次',
      'header.stat.groups': '小组',
      'header.stat.cities': '举办城市',

      // Refresh bar
      'refresh.bar': '🌐 服务器代理实时数据 · 每次刷新自动同步 · 页面倒计时',
      'refresh.last': '上次同步',
      'refresh.now': '⚡ 立即同步',

      // Navigation
      'nav.predict': '🤖 AI 预测',
      'nav.schedule': '📅 赛程表',
      'nav.results': '📊 已赛结果',
      'nav.groups': '🏅 小组积分',
      'nav.bracket': '🏆 淘汰赛',
      'nav.teams': '⚡ 球队实力',

      // AI Predict tab
      'predict.header': '🤖 智能比分预测',
      'predict.desc': '基于历史对战 · FIFA排名 · 近期状态 · 天气因素 · Claude Opus AI 综合分析的预测引擎',
      'predict.today': '📅 比赛预测',
      'predict.today.badge': '今日 & 明日',
      'predict.today.subtitle': '点击任意比赛卡片查看完整 AI 分析报告 · 串关建议覆盖今明两日',

      // Prediction result
      'predict.weather': '天气',
      'predict.prob.home': '主队',
      'predict.prob.draw': '平',
      'predict.prob.away': '客队',

      // Lottery
      'lottery.title': '体育彩票 · 串关建议',
      'lottery.subtitle': 'AI 辅助参考',
      'lottery.disclaimer': '⚠️ 以上赔率为AI模型估算参考值，不构成投注建议。请理性参与，量力而行。',

      // Reasoning
      'reasoning.title': 'AI 预测理由',
      'reasoning.subtitle': '基于5维度综合分析',

      // Analysis cards
      'analysis.h2h': '📈 历史对战记录',
      'analysis.form': '⚡ 近期状态',
      'analysis.attack': '🎯 进攻 & 防守指数',
      'analysis.players': '👥 关键球员 & 战术',

      // AI Prompt Assistant
      'dual.title': 'AI 分析助手',
      'dual.subtitle': '自动生成专业分析提示词 · 一键跳转主流AI平台 · 由你掌控分析过程',
      'dual.badge': '就绪',
      'dual.btn': '✨ 生成AI分析提示词',
      'dual.prompt.full': '📋 完整分析版',
      'dual.prompt.lite': '⚡ 简洁速答版',
      'dual.prompt.title': '📝 分析提示词（已自动填入比赛数据）',
      'dual.copy': '📋 复制',
      'dual.jump.title': '🚀 一键跳转AI平台（粘贴即可获取分析）',
      'dual.keywords.title': '🔍 快速搜索关键词（点击可复制）',
      'dual.local.title': '本地统计分析参考',
      'dual.tips': '💡 使用说明 — 点击上方按钮生成提示词 → 复制 → 跳转任意AI平台 → 粘贴即可获得专业分析',
      'dual.ready': '就绪',
      'dual.consensus': '🎯 综合研判',
      'dual.consistent': '一致',
      'dual.divergent': '分歧',
      'dual.online': '双模型在线',
      'dual.partial': '部分在线',
      'dual.local': '本地引擎',
      'dual.analyzing': '生成中...',
      'dual.seeReport': '见报告',
      'dual.localEngine': '本地引擎',
      'dual.localAnalysis': '本地统计分析',
      'dual.tokens': '消耗',

      // Score distribution
      'scoredist.title': '🎲 比分概率分布（Top 8）',

      // Schedule tab
      'schedule.header': '📅 完整赛程表',
      'schedule.desc': '全部 104 场比赛 · 🟢绿色=终场 · 🔴红色=AI预测 · 🥇首选🥈次选🎯防冷',
      'schedule.all': '全部',
      'schedule.group': '小组赛',
      'schedule.knockout': '淘汰赛',
      'schedule.upcoming': '即将进行',
      'schedule.completed': '已赛',

      // Results tab
      'results.header': '📊 已赛结果',
      'results.desc': '截止目前的全部比赛结果（6月11日起）',

      // Groups tab
      'groups.header': '🏅 小组积分榜',
      'groups.desc': '实时积分排名 · 全部 12 个小组',

      // Bracket tab
      'bracket.header': '🏆 淘汰赛对阵图',
      'bracket.desc': '小组前2名 + 8个最佳第3名晋级32强 · 根据积分自动填充晋级队伍',

      // Teams tab
      'teams.header': '⚡ 球队综合实力排行',
      'teams.desc': '基于 FIFA 排名、历史战绩、近期表现综合评分 · 全部48支参赛队 · 点击球队查看详情',
      'teams.search': '🔍 搜索球队名称...',

      // Footer
      'footer.data': '📊 数据来源：FIFA 官方、历史赛事记录、国际足联排名（2026年6月更新） · 🌤️ 天气：Open-Meteo',
      'footer.ai': '🤖 AI 预测仅供参考，基于统计模型 + 蒙特卡洛模拟 + Claude Opus 4.7 大模型分析 · ⚠️ 理性投注 切勿沉迷',
      'footer.copy': '2026 FIFA World Cup AI Predictor · 服务器代理实时数据 · API密钥安全隐藏',

      // Common UI
      'common.kickoff': '即将开球',
      'common.today': '今日',
      'common.tomorrow': '明日',
      'common.win': '胜',
      'common.draw': '平',
      'common.loss': '负',
      'common.homeWin': '主胜',
      'common.awayWin': '客胜',
      'common.noAnalysis': '暂无分析数据',
      'common.TBD': '待定',
      'common.unknown': '未知',
      'common.TBD2': '待定',

      // Match status
      'status.finished': '完赛',
      'status.live': '进行中',
      'status.scheduled': '未开始',

      // Group table
      'group.table.team': '球队',
      'group.table.played': '赛',
      'group.table.win': '胜',
      'group.table.draw': '平',
      'group.table.loss': '负',
      'group.table.gf': '进球',
      'group.table.ga': '失球',
      'group.table.gd': '净胜',
      'group.table.pts': '积分',
      'group.table.pos': '名次',

      // Team detail tabs
      'team.tab.squad': '大名单',
      'team.tab.injuries': '伤停',
      'team.tab.analysis': '分析',

      // Parlay types
      'parlay.winloss': '胜负推荐',
      'parlay.undefeated': '让球不败',
      'parlay.goals': '总进球推荐',
      'parlay.over': '大球 ≥3',
      'parlay.under': '小球 ≤2',
      'parlay.score1': '波胆首选（高赔）',
      'parlay.score2': '波胆次选',
      'parlay.undefeated2': '不败',
      'parlay.game1': '场1',

      // Parlay results
      'parlay.hit.full': '完全命中',
      'parlay.hit.direction': '命中胜负',
      'parlay.hit.miss': '未中',

      // Injury
      'injury.warn': '⚠️ 存在关键球员缺席，可能影响比赛表现',
      'injury.none': '暂无伤停情报',
      'injury.full': '阵容齐整',

      // Data freshness
      'freshness.fresh': '刚刚更新',
      'freshness.recent': '数据较新',
      'freshness.stale': '数据可能过期',

      // AI prompt
      'ai.system': '你是一位世界顶级足球分析师，精通数据分析和战术解读，拥有20年世界杯报道经验。请基于数据做出客观、专业且简洁的分析，控制在400字内。请用中文回答。',
      'ai.system.mimo': '你是一位世界顶级足球分析师，精通数据分析和战术解读，拥有20年世界杯报道经验。请基于数据做出客观、专业且简洁的分析，控制在400字内。你是独立的AI分析师，请给出你自己的独立判断。请用中文回答。',
      'ai.local.engine': '本地统计分析引擎',

      // ── 今日/明日比赛 ──
      'today.matches': '今日比赛',
      'today.tomorrow': '明日比赛',
      'today.match.unit': '场',
      'today.no.matches': '今明两日暂无比赛安排',
      'today.view.ai': '查看完整AI分析',
      'prob.home.win': '主胜',
      'prob.draw.short': '平',
      'prob.away.win': '客胜',

      // ── 天气 ──
      'weather.loading': '⏳ 获取天气...',
      'weather.feels': '体感',
      'weather.humidity': '湿度',
      'weather.wind': '风速',
      'weather.estimated': '估算',

      // ── 比赛状态 ──
      'match.ft': '✅ 终场',
      'match.live': '🔴 进行中',
      'match.likely.completed': '⏳ 预计已结束 · 等待比分确认',
      'match.upcoming.short': '待赛',
      'match.toconfirm': '待确认',

      // ── 预测结果 ──
      'pred.fifa.rank': 'FIFA 排名 #',
      'pred.score.primary': '🥇 首选比分',
      'pred.score.secondary': '🥈 次选比分',
      'pred.score.defensive': '🎯 防冷比分',
      'pred.probability': '概率',
      'pred.best.pick': '最高概率方案',
      'pred.second.pick': '第二可能方案',
      'pred.upset.pick': '高赔冷门方案',
      'pred.form.pts': '分',
      'pred.expected.goals': '预期总进球',
      'pred.goals.unit': '球',
      'pred.core.player': '核心球员',
      'pred.tactics': '战术',
      'pred.championships': '冠军次数',
      'pred.draw.label': '平局',
      'pred.no.h2h': '两队未在世界杯正赛交锋过',

      // ── 分析卡片 ──
      'analysis.attack.label': '进攻',
      'analysis.defense.label': '防守',

      // ── 串关建议 ──
      'parlay.type.winloss': '胜负推荐',
      'parlay.type.goals': '总进球推荐',
      'parlay.type.score1': '波胆首选（高赔）',
      'parlay.type.score2': '波胆次选',
      'parlay.type.parlay2': '2串1 推荐',
      'parlay.type.parlay3': '3串1 推荐',
      'parlay.home.win': '主胜',
      'parlay.away.win': '客胜',
      'parlay.unbeaten': '不败',
      'parlay.unbeaten.pick': '让球不败',
      'parlay.over.pick': '大球 ≥3',
      'parlay.under.pick': '小球 ≤2',
      'parlay.ref.odds': '参考赔率',
      'parlay.match.unit': '场',
      'parlay.tomorrow.tag': '（明日）',
      'parlay.primary.score': '首选比分',
      'parlay.secondary.score': '次选比分',
      'parlay.total.goals.pred': '预测总进球',
      'parlay.tendency': '倾向',

      // ── 已赛结果 ──
      'results.accuracy': 'AI预测准确率',
      'results.direction': '胜负方向',
      'results.exact.hit': '完全命中',
      'results.exact.rate': '比分精确',
      'results.completed': '已完赛',
      'results.latest': '最新',
      'results.no.data': '暂无比赛结果',
      'results.ai.pred': '🤖 AI赛前预测',
      'results.predicted': '预测',
      'results.actual': '实际',
      'results.not.recorded': '未记录预测',
      'results.match.unit': '场',

      // ── 淘汰赛 ──
      'bracket.r32': '32强赛',
      'bracket.r16': '16强赛',
      'bracket.qf': '1/4决赛',
      'bracket.sf1': '半决赛①',
      'bracket.sf2': '半决赛②',
      'bracket.3rd': '季军赛',
      'bracket.final': '🏆 决赛',
      'bracket.tbd': '待定',
      'bracket.filled': '已填充',
      'bracket.seats': '个席位',
      'bracket.based.on': '📊 基于当前积分自动预测晋级 · 已填充',
      'bracket.upper': '上半区',
      'bracket.lower': '下半区',
      'bracket.final.stage': '🏅 决赛阶段',
      'bracket.champion': '2026 冠军',
      'bracket.sf1.loser': 'SF①负方',
      'bracket.sf2.loser': 'SF②负方',
      'bracket.sf1.winner': 'SF①胜方',
      'bracket.sf2.winner': 'SF②胜方',
      'bracket.group.qualifier': '小组晋级队',
      'bracket.multi.city': '多城市',
      'bracket.sf.winner': '半决赛胜者',
      'bracket.ko.round': '32强赛 (6月28日起) — 淘汰赛',
      'bracket.final.match': '决赛 (7月19日) — 纽约 MetLife',
      'bracket.final.tag': '决赛',

      // ── 球队实力 ──
      'tp.attack': '进攻',
      'tp.defense': '防守',
      'tp.overall': '综合',

      // ── 球队详情 ──
      'td.squad.value': '💰 全队总身价',
      'td.squad.count': '📋 大名单',
      'td.squad.people': '人',
      'td.position': '位置',
      'td.player': '球员',
      'td.club': '俱乐部',
      'td.value': '身价',
      'td.star.player': '⭐ 核心球员',
      'td.more.info': '📝 更多大名单信息将在开赛前更新',
      'td.no.squad': '暂无大名单数据',
      'td.injury.players': '🏥 伤停球员',
      'td.injury.status': '伤停情况',
      'td.no.injury': '✅ 当前无重大伤停，全员健康',
      'td.form': '状态',
      'td.rank': '排名',
      'td.tactical.style': '战术风格',
      'td.core.player': '核心球员',
      'td.recent.trend': '近期走势',
      'td.wc.championships': '世界杯冠军',
      'td.wc.prospect': '世界杯前景分析',
      'td.no.analysis': '暂无分析数据',
      'td.this.wc.played': '🎯 本届世界杯已赛',
      'td.this.wc.upcoming': '📅 本届世界杯待赛',
      'td.h2h.records': '⚔️ 世界杯历史对战记录',
      'td.h2h.opponent': '对手',
      'td.h2h.matches': '场次',
      'td.h2h.winrate': '胜率',
      'td.wc.total.matches': '世界杯总场次',
      'td.wc.total.goals': '总进球',
      'td.wc.total.conceded': '总失球',
      'td.wc.avg.goals': '场均进球',
      'td.wc.avg.conceded': '场均失球',
      'td.wc.trophies': '冠军次数',
      'td.no.history': '暂无历史对战数据',
      'td.squad.value.tab': '大名单身价',
      'td.history.tab': '历史对战',
      'td.close': '收起',
      'td.injury.warn': '⚠️ 存在关键球员缺席，可能影响比赛表现',
      'td.injury.count': '人',
      'match.tbd.score': '待确认',
      'analysis.attack.label': '进攻',
      'analysis.defense.label': '防守',
      'common.win.short': '胜',
      'common.draw.short': '平',
      'common.loss.short': '负',
      'common.group': '组',
      'common.local.data': '本地数据',
      'common.day.before': '前日',
      'common.day.after': '次日',
      // ── DeepSeek Panel ──
      'ds.ready.msg': '✅ AI 分析助手就绪 · 点击生成提示词，一键跳转AI平台',
      'ds.select.first': '请先选择今日比赛！',
      'ds.generating': '✨ 正在生成提示词...',
      'ds.regenerate': '🔄 重新生成提示词',
      'ds.copied': '✅ 已复制',
      'ds.generate.btn': '✨ 生成AI分析提示词',
      'ds.copy.fail': '复制失败，请手动复制',
    },

    // ── English ──
    en: {
      'header.badge': '🏆 2026 USA·Canada·Mexico World Cup · 23rd FIFA World Cup · USA · Canada · México',
      'header.title': 'AI Score Prediction System',
      'header.subtitle': 'Six-dimensional intelligent engine: H2H · Team Strength · Injuries · Squad Analysis · Weather Factors',
      'header.stat.teams': 'Teams',
      'header.stat.matches': 'Matches',
      'header.stat.groups': 'Groups',
      'header.stat.cities': 'Host Cities',

      'refresh.bar': '🌐 Server proxy real-time data · Auto-sync on refresh · Countdown',
      'refresh.last': 'Last sync',
      'refresh.now': '⚡ Sync Now',

      'nav.predict': '🤖 AI Predict',
      'nav.schedule': '📅 Schedule',
      'nav.results': '📊 Results',
      'nav.groups': '🏅 Standings',
      'nav.bracket': '🏆 Knockout',
      'nav.teams': '⚡ Team Power',

      'predict.header': '🤖 Intelligent Score Prediction',
      'predict.desc': 'Prediction engine based on H2H · FIFA Rankings · Recent Form · Weather · Claude Opus AI analysis',
      'predict.today': '📅 Match Predictions',
      'predict.today.badge': 'Today & Tomorrow',
      'predict.today.subtitle': 'Click any match card for full AI analysis report · Parlay tips cover today & tomorrow',

      'predict.weather': 'Weather',
      'predict.prob.home': 'Home',
      'predict.prob.draw': 'Draw',
      'predict.prob.away': 'Away',

      'lottery.title': 'Sports Betting · Parlay Tips',
      'lottery.subtitle': 'AI-assisted reference',
      'lottery.disclaimer': '⚠️ Odds are AI model estimates for reference only, not betting advice. Please bet responsibly.',

      'reasoning.title': 'AI Prediction Reasoning',
      'reasoning.subtitle': 'Based on 5-dimensional analysis',

      'analysis.h2h': '📈 Head-to-Head Records',
      'analysis.form': '⚡ Recent Form',
      'analysis.attack': '🎯 Attack & Defense Index',
      'analysis.players': '👥 Key Players & Tactics',

      'dual.title': 'AI Analysis Assistant',
      'dual.subtitle': 'Auto-generate professional analysis prompt · Jump to AI platforms · You control the process',
      'dual.badge': 'Ready',
      'dual.btn': '✨ Generate AI Prompt',
      'dual.prompt.full': '📋 Full Analysis',
      'dual.prompt.lite': '⚡ Quick Answer',
      'dual.prompt.title': '📝 Analysis Prompt (match data auto-filled)',
      'dual.copy': '📋 Copy',
      'dual.jump.title': '🚀 Jump to AI Platform (paste to get analysis)',
      'dual.keywords.title': '🔍 Quick Search Keywords (click to copy)',
      'dual.local.title': 'Local Statistical Analysis',
      'dual.tips': '💡 How to use — Click button above → Copy prompt → Jump to any AI platform → Paste for professional analysis',
      'dual.ready': 'Ready',
      'dual.consensus': '🎯 Consensus',
      'dual.consistent': 'Consistent',
      'dual.divergent': 'Divergent',
      'dual.online': 'Both Online',
      'dual.partial': 'Partial',
      'dual.local': 'Local Engine',
      'dual.analyzing': 'Generating...',
      'dual.seeReport': 'See Report',
      'dual.localEngine': 'Local Engine',
      'dual.localAnalysis': 'Local Statistical Analysis',
      'dual.tokens': 'tokens',

      'scoredist.title': '🎲 Score Probability Distribution (Top 8)',

      'schedule.header': '📅 Full Schedule',
      'schedule.desc': 'All 104 matches · 🟢Green=Final · 🔴Red=AI Prediction · 🥇1st🥈2nd🎯Upset',
      'schedule.all': 'All',
      'schedule.group': 'Group Stage',
      'schedule.knockout': 'Knockout',
      'schedule.upcoming': 'Upcoming',
      'schedule.completed': 'Completed',

      'results.header': '📊 Match Results',
      'results.desc': 'All match results since June 11',

      'groups.header': '🏅 Group Standings',
      'groups.desc': 'Real-time standings · All 12 groups',

      'bracket.header': '🏆 Knockout Bracket',
      'bracket.desc': 'Top 2 from each group + 8 best 3rd-place teams advance to Round of 32 · Auto-filled from standings',

      'teams.header': '⚡ Team Power Rankings',
      'teams.desc': 'Comprehensive rating based on FIFA ranking, history, recent form · All 48 teams · Click for details',
      'teams.search': '🔍 Search team name...',

      'footer.data': '📊 Data: FIFA official, historical records, FIFA rankings (June 2026) · 🌤️ Weather: Open-Meteo',
      'footer.ai': '🤖 AI predictions for reference only · Statistical model + Monte Carlo + Claude Opus 4.7 · ⚠️ Bet responsibly',
      'footer.copy': '2026 FIFA World Cup AI Predictor · Server proxy real-time data · API keys secured',

      'common.kickoff': 'Kickoff Soon',
      'common.today': 'Today',
      'common.tomorrow': 'Tomorrow',
      'common.win': 'W',
      'common.draw': 'D',
      'common.loss': 'L',
      'common.homeWin': 'Home Win',
      'common.awayWin': 'Away Win',
      'common.noAnalysis': 'No analysis data',
      'common.TBD': 'TBD',
      'common.unknown': 'Unknown',
      'common.TBD2': 'TBD',

      'status.finished': 'FT',
      'status.live': 'Live',
      'status.scheduled': 'Scheduled',

      'group.table.team': 'Team',
      'group.table.played': 'P',
      'group.table.win': 'W',
      'group.table.draw': 'D',
      'group.table.loss': 'L',
      'group.table.gf': 'GF',
      'group.table.ga': 'GA',
      'group.table.gd': 'GD',
      'group.table.pts': 'Pts',
      'group.table.pos': '#',

      'team.tab.squad': 'Squad',
      'team.tab.injuries': 'Injuries',
      'team.tab.analysis': 'Analysis',

      'parlay.winloss': 'Win/Loss Pick',
      'parlay.undefeated': 'Unbeaten Pick',
      'parlay.goals': 'Total Goals Pick',
      'parlay.over': 'Over ≥3',
      'parlay.under': 'Under ≤2',
      'parlay.score1': 'Top Score Pick (High Odds)',
      'parlay.score2': 'Alt Score Pick',
      'parlay.undefeated2': 'Unbeaten',
      'parlay.game1': 'Match 1',

      'parlay.hit.full': 'Full Hit',
      'parlay.hit.direction': 'Direction Hit',
      'parlay.hit.miss': 'Miss',

      'injury.warn': '⚠️ Key player absences may affect performance',
      'injury.none': 'No injury data',
      'injury.full': 'Full squad available',

      'freshness.fresh': 'Just updated',
      'freshness.recent': 'Data is recent',
      'freshness.stale': 'Data may be outdated',

      'ai.system': 'You are a world-class football analyst with 20 years of World Cup coverage experience. Provide objective, professional, and concise analysis based on data, within 400 words. Please respond in English.',
      'ai.system.mimo': 'You are a world-class football analyst with 20 years of World Cup coverage experience. Provide objective, professional, and concise analysis within 400 words. You are an independent AI analyst — give your own independent judgment. Please respond in English.',
      'ai.local.engine': 'Local Statistical Engine',

      // ── Today/Tomorrow matches ──
      'today.matches': "Today's Matches",
      'today.tomorrow': "Tomorrow's Matches",
      'today.match.unit': 'matches',
      'today.no.matches': 'No matches scheduled for today or tomorrow',
      'today.view.ai': 'View Full AI Analysis',
      'prob.home.win': 'Home Win',
      'prob.draw.short': 'Draw',
      'prob.away.win': 'Away Win',

      // ── Weather ──
      'weather.loading': '⏳ Loading weather...',
      'weather.feels': 'Feels like',
      'weather.humidity': 'Humidity',
      'weather.wind': 'Wind',
      'weather.estimated': 'Estimated',

      // ── Match status ──
      'match.ft': '✅ FT',
      'match.live': '🔴 Live',
      'match.likely.completed': '⏳ Likely ended · Awaiting confirmation',
      'match.upcoming.short': 'Upcoming',
      'match.toconfirm': 'TBD',

      // ── Prediction result ──
      'pred.fifa.rank': 'FIFA Rank #',
      'pred.score.primary': '🥇 Top Pick',
      'pred.score.secondary': '🥈 Alt Pick',
      'pred.score.defensive': '🎯 Upset Pick',
      'pred.probability': 'Prob',
      'pred.best.pick': 'Highest probability',
      'pred.second.pick': 'Second most likely',
      'pred.upset.pick': 'High-odds upset',
      'pred.form.pts': 'pts',
      'pred.expected.goals': 'Expected total goals',
      'pred.goals.unit': 'goals',
      'pred.core.player': 'Key player',
      'pred.tactics': 'Tactics',
      'pred.championships': 'WC titles',
      'pred.draw.label': 'Draw',
      'pred.no.h2h': 'No previous World Cup meetings',

      // ── Analysis cards ──
      'analysis.attack.label': 'Attack',
      'analysis.defense.label': 'Defense',

      // ── Parlay ──
      'parlay.type.winloss': 'Win/Loss Pick',
      'parlay.type.goals': 'Total Goals Pick',
      'parlay.type.score1': 'Top Score Pick (High Odds)',
      'parlay.type.score2': 'Alt Score Pick',
      'parlay.type.parlay2': '2-fold Accumulator',
      'parlay.type.parlay3': '3-fold Accumulator',
      'parlay.home.win': 'Home Win',
      'parlay.away.win': 'Away Win',
      'parlay.unbeaten': 'Unbeaten',
      'parlay.unbeaten.pick': 'Unbeaten Pick',
      'parlay.over.pick': 'Over ≥3',
      'parlay.under.pick': 'Under ≤2',
      'parlay.ref.odds': 'Ref. odds',
      'parlay.match.unit': 'M',
      'parlay.tomorrow.tag': '(Tomorrow)',
      'parlay.primary.score': 'Top score',
      'parlay.secondary.score': 'Alt score',
      'parlay.total.goals.pred': 'Predicted total goals',
      'parlay.tendency': 'lean',

      // ── Results ──
      'results.accuracy': 'AI Prediction Accuracy',
      'results.direction': 'Win/Loss direction',
      'results.exact.hit': 'Exact score hit',
      'results.exact.rate': 'Exact score',
      'results.completed': 'Completed',
      'results.latest': 'Latest',
      'results.no.data': 'No match results yet',
      'results.ai.pred': '🤖 AI Pre-match Prediction',
      'results.predicted': 'Predicted',
      'results.actual': 'Actual',
      'results.not.recorded': 'No prediction recorded',
      'results.match.unit': 'matches',

      // ── Bracket ──
      'bracket.r32': 'Round of 32',
      'bracket.r16': 'Round of 16',
      'bracket.qf': 'Quarter-finals',
      'bracket.sf1': 'Semi-final ①',
      'bracket.sf2': 'Semi-final ②',
      'bracket.3rd': '3rd Place',
      'bracket.final': '🏆 Final',
      'bracket.tbd': 'TBD',
      'bracket.filled': 'filled',
      'bracket.seats': 'slots',
      'bracket.based.on': '📊 Auto-qualified from current standings · Filled',
      'bracket.upper': 'Upper half',
      'bracket.lower': 'Lower half',
      'bracket.final.stage': '🏅 Final Stage',
      'bracket.champion': '2026 Champion',
      'bracket.sf1.loser': 'SF① Loser',
      'bracket.sf2.loser': 'SF② Loser',
      'bracket.sf1.winner': 'SF① Winner',
      'bracket.sf2.winner': 'SF② Winner',
      'bracket.group.qualifier': 'Group Qualifier',
      'bracket.multi.city': 'Multi-city',
      'bracket.sf.winner': 'SF Winner',
      'bracket.ko.round': 'Round of 32 (from Jun 28) — Knockout',
      'bracket.final.match': 'Final (Jul 19) — New York MetLife',
      'bracket.final.tag': 'Final',

      // ── Team power ──
      'tp.attack': 'Attack',
      'tp.defense': 'Defense',
      'tp.overall': 'Overall',

      // ── Team detail ──
      'td.squad.value': '💰 Total squad value',
      'td.squad.count': '📋 Squad size',
      'td.squad.people': 'players',
      'td.position': 'Pos',
      'td.player': 'Player',
      'td.club': 'Club',
      'td.value': 'Value',
      'td.star.player': '⭐ Key players',
      'td.more.info': '📝 More squad info will be updated before kickoff',
      'td.no.squad': 'No squad data available',
      'td.injury.players': '🏥 Injured players',
      'td.injury.status': 'Injury status',
      'td.no.injury': '✅ No major injuries, full squad available',
      'td.form': 'Form',
      'td.rank': 'Rank',
      'td.tactical.style': 'Tactical style',
      'td.core.player': 'Key player',
      'td.recent.trend': 'Recent trend',
      'td.wc.championships': 'WC titles',
      'td.wc.prospect': 'World Cup prospect analysis',
      'td.no.analysis': 'No analysis data',
      'td.this.wc.played': '🎯 This World Cup — Played',
      'td.this.wc.upcoming': '📅 This World Cup — Upcoming',
      'td.h2h.records': '⚔️ World Cup H2H records',
      'td.h2h.opponent': 'Opponent',
      'td.h2h.matches': 'Matches',
      'td.h2h.winrate': 'Win rate',
      'td.wc.total.matches': 'Total WC matches',
      'td.wc.total.goals': 'Total goals',
      'td.wc.total.conceded': 'Total conceded',
      'td.wc.avg.goals': 'Avg goals',
      'td.wc.avg.conceded': 'Avg conceded',
      'td.wc.trophies': 'WC titles',
      'td.no.history': 'No historical data',
      'td.squad.value.tab': 'Squad & Value',
      'td.history.tab': 'History',
      'td.close': 'Close',
      'td.injury.warn': '⚠️ Key players absent, may affect performance',
      'td.injury.count': 'players',
      'match.tbd.score': 'TBD',
      'analysis.attack.label': 'Attack',
      'analysis.defense.label': 'Defense',
      'common.win.short': 'W',
      'common.draw.short': 'D',
      'common.loss.short': 'L',
      'common.group': 'Group',
      'common.local.data': 'Local data',
      'common.day.before': 'Previous day',
      'common.day.after': 'Next day',
      // ── DeepSeek Panel ──
      'ds.ready.msg': '✅ AI assistant ready · Generate prompt and jump to AI platform',
      'ds.select.first': 'Please select a match first!',
      'ds.generating': '✨ Generating prompt...',
      'ds.regenerate': '🔄 Regenerate prompt',
      'ds.copied': '✅ Copied',
      'ds.generate.btn': '✨ Generate AI Analysis Prompt',
      'ds.copy.fail': 'Copy failed, please copy manually',
    },

    // ── Español ──
    es: {
      'header.badge': '🏆 Mundial 2026 EE.UU.·Canadá·México · 23ª Copa Mundial de la FIFA · USA · Canadá · México',
      'header.title': 'Sistema de Predicción de Marcadores IA',
      'header.subtitle': 'Motor inteligente de seis dimensiones: H2H · Potencia · Lesiones · Alineación · Clima',
      'header.stat.teams': 'Selecciones',
      'header.stat.matches': 'Partidos',
      'header.stat.groups': 'Grupos',
      'header.stat.cities': 'Sedes',

      'refresh.bar': '🌐 Datos en tiempo real vía proxy · Sincronización automática · Cuenta regresiva',
      'refresh.last': 'Última sync',
      'refresh.now': '⚡ Sincronizar',

      'nav.predict': '🤖 Predicción IA',
      'nav.schedule': '📅 Calendario',
      'nav.results': '📊 Resultados',
      'nav.groups': '🏅 Clasificación',
      'nav.bracket': '🏆 Eliminatoria',
      'nav.teams': '⚡ Potencia',

      'predict.header': '🤖 Predicción Inteligente de Marcadores',
      'predict.desc': 'Motor basado en H2H · Ranking FIFA · Forma reciente · Clima · Análisis Claude Opus IA',
      'predict.today': '📅 Predicciones de Partidos',
      'predict.today.badge': 'Hoy y Mañana',
      'predict.today.subtitle': 'Haz clic en cualquier partido para el informe completo de IA · Consejos de combinación para hoy y mañana',

      'predict.weather': 'Clima',
      'predict.prob.home': 'Local',
      'predict.prob.draw': 'Empate',
      'predict.prob.away': 'Visitante',

      'lottery.title': 'Apuestas Deportivas · Consejos Combinados',
      'lottery.subtitle': 'Referencia asistida por IA',
      'lottery.disclaimer': '⚠️ Las cuotas son estimaciones del modelo de IA solo como referencia, no son consejos de apuesta. Apuesta con responsabilidad.',

      'reasoning.title': 'Razonamiento de Predicción IA',
      'reasoning.subtitle': 'Basado en análisis de 5 dimensiones',

      'analysis.h2h': '📈 Historial de Enfrentamientos',
      'analysis.form': '⚡ Forma Reciente',
      'analysis.attack': '🎯 Índice Ataque y Defensa',
      'analysis.players': '👥 Jugadores Clave y Tácticas',

      'dual.title': 'Asistente de Análisis IA',
      'dual.subtitle': 'Genera prompt de análisis profesional · Salta a plataformas IA · Tú controlas el proceso',
      'dual.badge': 'Listo',
      'dual.btn': '✨ Generar Prompt IA',
      'dual.prompt.full': '📋 Análisis Completo',
      'dual.prompt.lite': '⚡ Respuesta Rápida',
      'dual.prompt.title': '📝 Prompt de Análisis (datos del partido auto-completados)',
      'dual.copy': '📋 Copiar',
      'dual.jump.title': '🚀 Saltar a Plataforma IA (pega para obtener análisis)',
      'dual.keywords.title': '🔍 Palabras Clave de Búsqueda (clic para copiar)',
      'dual.local.title': 'Análisis Estadístico Local',
      'dual.tips': '💡 Cómo usar — Clic en el botón → Copia el prompt → Salta a cualquier IA → Pega para análisis profesional',
      'dual.ready': 'Listo',
      'dual.consensus': '🎯 Consenso',
      'dual.consistent': 'Coinciden',
      'dual.divergent': 'Difieren',
      'dual.online': 'Ambos En Línea',
      'dual.partial': 'Parcial',
      'dual.local': 'Motor Local',
      'dual.analyzing': 'Generando...',
      'dual.seeReport': 'Ver Informe',
      'dual.localEngine': 'Motor Local',
      'dual.localAnalysis': 'Análisis Estadístico Local',
      'dual.tokens': 'tokens',

      'scoredist.title': '🎲 Distribución de Probabilidad de Marcadores (Top 8)',

      'schedule.header': '📅 Calendario Completo',
      'schedule.desc': 'Los 104 partidos · 🟢Verde=Final · 🔴Rojo=Predicción IA · 🥇1ª🥈2ª🎯Sorpresa',
      'schedule.all': 'Todos',
      'schedule.group': 'Fase de Grupos',
      'schedule.knockout': 'Eliminatoria',
      'schedule.upcoming': 'Próximos',
      'schedule.completed': 'Finalizados',

      'results.header': '📊 Resultados de Partidos',
      'results.desc': 'Todos los resultados desde el 11 de junio',

      'groups.header': '🏅 Clasificación de Grupos',
      'groups.desc': 'Clasificación en tiempo real · Los 12 grupos',

      'bracket.header': '🏆 Cuadro Eliminatorio',
      'bracket.desc': 'Los 2 primeros de cada grupo + 8 mejores terceros avanzan a 32avos · Rellenado automáticamente',

      'teams.header': '⚡ Ranking de Potencia de Selecciones',
      'teams.desc': 'Puntuación basada en ranking FIFA, historia, forma reciente · Las 48 selecciones · Clic para detalles',
      'teams.search': '🔍 Buscar selección...',

      'footer.data': '📊 Datos: FIFA oficial, registros históricos, ranking FIFA (junio 2026) · 🌤️ Clima: Open-Meteo',
      'footer.ai': '🤖 Predicciones IA solo como referencia · Modelo estadístico + Monte Carlo + Claude Opus 4.7 · ⚠️ Apuesta con responsabilidad',
      'footer.copy': '2026 FIFA World Cup AI Predictor · Datos en tiempo real vía proxy · Claves API seguras',

      'common.kickoff': 'Pronto el Inicio',
      'common.today': 'Hoy',
      'common.tomorrow': 'Mañana',
      'common.win': 'G',
      'common.draw': 'E',
      'common.loss': 'P',
      'common.homeWin': 'Gana Local',
      'common.awayWin': 'Gana Visitante',
      'common.noAnalysis': 'Sin datos de análisis',
      'common.TBD': 'Por confirmar',
      'common.unknown': 'Desconocido',
      'common.TBD2': 'Por confirmar',

      'status.finished': 'Final',
      'status.live': 'En Vivo',
      'status.scheduled': 'Programado',

      'group.table.team': 'Selección',
      'group.table.played': 'PJ',
      'group.table.win': 'G',
      'group.table.draw': 'E',
      'group.table.loss': 'P',
      'group.table.gf': 'GF',
      'group.table.ga': 'GC',
      'group.table.gd': 'DIF',
      'group.table.pts': 'Pts',
      'group.table.pos': '#',

      'team.tab.squad': 'Convocados',
      'team.tab.injuries': 'Lesiones',
      'team.tab.analysis': 'Análisis',

      'parlay.winloss': 'Pick Gana/Pierde',
      'parlay.undefeated': 'Pick Invicto',
      'parlay.goals': 'Pick Total Goles',
      'parlay.over': 'Over ≥3',
      'parlay.under': 'Under ≤2',
      'parlay.score1': 'Marcador Principal (Alta Cuota)',
      'parlay.score2': 'Marcador Alternativo',
      'parlay.undefeated2': 'Invicto',
      'parlay.game1': 'Partido 1',

      'parlay.hit.full': 'Acierto Total',
      'parlay.hit.direction': 'Acierto Dirección',
      'parlay.hit.miss': 'Fallo',

      'injury.warn': '⚠️ Ausencia de jugadores clave puede afectar el rendimiento',
      'injury.none': 'Sin datos de lesiones',
      'injury.full': 'Plantilla completa disponible',

      'freshness.fresh': 'Recién actualizado',
      'freshness.recent': 'Datos recientes',
      'freshness.stale': 'Datos pueden estar desactualizados',

      'ai.system': 'Eres un analista de fútbol de clase mundial con 20 años de experiencia en cobertura de Copas del Mundo. Proporciona análisis objetivo, profesional y conciso basado en datos, en menos de 400 palabras. Por favor responde en español.',
      'ai.system.mimo': 'Eres un analista de fútbol de clase mundial con 20 años de experiencia. Proporciona análisis objetivo y conciso en menos de 400 palabras. Eres un analista IA independiente — da tu propio juicio independiente. Por favor responde en español.',
      'ai.local.engine': 'Motor Estadístico Local',

      // ── Partidos de hoy/mañana ──
      'today.matches': 'Partidos de Hoy',
      'today.tomorrow': 'Partidos de Mañana',
      'today.match.unit': 'partidos',
      'today.no.matches': 'No hay partidos programados para hoy ni mañana',
      'today.view.ai': 'Ver análisis IA completo',
      'prob.home.win': 'Gana Local',
      'prob.draw.short': 'Empate',
      'prob.away.win': 'Gana Visitante',

      // ── Clima ──
      'weather.loading': '⏳ Cargando clima...',
      'weather.feels': 'Sensación',
      'weather.humidity': 'Humedad',
      'weather.wind': 'Viento',
      'weather.estimated': 'Estimado',

      // ── Estado del partido ──
      'match.ft': '✅ Final',
      'match.live': '🔴 En vivo',
      'match.likely.completed': '⏳ Probablemente terminado · Esperando confirmación',
      'match.upcoming.short': 'Próximo',
      'match.toconfirm': 'Por confirmar',

      // ── Resultado de predicción ──
      'pred.fifa.rank': 'Ranking FIFA #',
      'pred.score.primary': '🥇 Pronóstico principal',
      'pred.score.secondary': '🥈 Pronóstico alternativo',
      'pred.score.defensive': '🎯 Pronóstico sorpresa',
      'pred.probability': 'Prob',
      'pred.best.pick': 'Mayor probabilidad',
      'pred.second.pick': 'Segundo más probable',
      'pred.upset.pick': 'Sorpresa de alta cuota',
      'pred.form.pts': 'pts',
      'pred.expected.goals': 'Goles totales esperados',
      'pred.goals.unit': 'goles',
      'pred.core.player': 'Jugador clave',
      'pred.tactics': 'Tácticas',
      'pred.championships': 'Títulos de Mundial',
      'pred.draw.label': 'Empate',
      'pred.no.h2h': 'Sin enfrentamientos previos en Mundiales',

      // ── Tarjetas de análisis ──
      'analysis.attack.label': 'Ataque',
      'analysis.defense.label': 'Defensa',

      // ── Combinadas ──
      'parlay.type.winloss': 'Pick Gana/Pierde',
      'parlay.type.goals': 'Pick Total Goles',
      'parlay.type.score1': 'Marcador Principal (Alta Cuota)',
      'parlay.type.score2': 'Marcador Alternativo',
      'parlay.type.parlay2': 'Combinada doble',
      'parlay.type.parlay3': 'Combinada triple',
      'parlay.home.win': 'Gana Local',
      'parlay.away.win': 'Gana Visitante',
      'parlay.unbeaten': 'Invicto',
      'parlay.unbeaten.pick': 'Pick Invicto',
      'parlay.over.pick': 'Más ≥3',
      'parlay.under.pick': 'Menos ≤2',
      'parlay.ref.odds': 'Cuota ref.',
      'parlay.match.unit': 'P',
      'parlay.tomorrow.tag': '(Mañana)',
      'parlay.primary.score': 'Marcador principal',
      'parlay.secondary.score': 'Marcador alt.',
      'parlay.total.goals.pred': 'Total goles predicho',
      'parlay.tendency': 'tendencia',

      // ── Resultados ──
      'results.accuracy': 'Precisión de predicción IA',
      'results.direction': 'Dirección Gana/Pierde',
      'results.exact.hit': 'Acierto exacto',
      'results.exact.rate': 'Marcador exacto',
      'results.completed': 'Finalizados',
      'results.latest': 'Último',
      'results.no.data': 'Sin resultados todavía',
      'results.ai.pred': '🤖 Predicción IA pre-partido',
      'results.predicted': 'Predicho',
      'results.actual': 'Real',
      'results.not.recorded': 'Sin predicción registrada',
      'results.match.unit': 'partidos',

      // ── Cuadro eliminatorio ──
      'bracket.r32': 'Dieciseisavos',
      'bracket.r16': 'Octavos',
      'bracket.qf': 'Cuartos',
      'bracket.sf1': 'Semifinal ①',
      'bracket.sf2': 'Semifinal ②',
      'bracket.3rd': 'Tercer lugar',
      'bracket.final': '🏆 Final',
      'bracket.tbd': 'Por confirmar',
      'bracket.filled': 'ocupados',
      'bracket.seats': 'cupos',
      'bracket.based.on': '📊 Clasificación automática por puntos · Ocupados',
      'bracket.upper': 'Mitad superior',
      'bracket.lower': 'Mitad inferior',
      'bracket.final.stage': '🏅 Etapa Final',
      'bracket.champion': 'Campeón 2026',
      'bracket.sf1.loser': 'Perdedor SF①',
      'bracket.sf2.loser': 'Perdedor SF②',
      'bracket.sf1.winner': 'Ganador SF①',
      'bracket.sf2.winner': 'Ganador SF②',
      'bracket.group.qualifier': 'Clasificado de grupo',
      'bracket.multi.city': 'Multi-ciudad',
      'bracket.sf.winner': 'Ganador SF',
      'bracket.ko.round': 'Dieciseisavos (desde 28 jun) — Eliminatoria',
      'bracket.final.match': 'Final (19 jul) — Nueva York MetLife',
      'bracket.final.tag': 'Final',

      // ── Potencia de selecciones ──
      'tp.attack': 'Ataque',
      'tp.defense': 'Defensa',
      'tp.overall': 'General',

      // ── Detalles del equipo ──
      'td.squad.value': '💰 Valor total de la plantilla',
      'td.squad.count': '📋 Tamaño de plantilla',
      'td.squad.people': 'jugadores',
      'td.position': 'Pos',
      'td.player': 'Jugador',
      'td.club': 'Club',
      'td.value': 'Valor',
      'td.star.player': '⭐ Jugadores clave',
      'td.more.info': '📝 Más información antes del inicio',
      'td.no.squad': 'Sin datos de plantilla',
      'td.injury.players': '🏥 Jugadores lesionados',
      'td.injury.status': 'Estado de lesiones',
      'td.no.injury': '✅ Sin lesiones, plantilla completa',
      'td.form': 'Forma',
      'td.rank': 'Ranking',
      'td.tactical.style': 'Estilo táctico',
      'td.core.player': 'Jugador clave',
      'td.recent.trend': 'Tendencia reciente',
      'td.wc.championships': 'Títulos mundialistas',
      'td.wc.prospect': 'Análisis de perspectiva del Mundial',
      'td.no.analysis': 'Sin datos de análisis',
      'td.this.wc.played': '🎯 Este Mundial — Jugados',
      'td.this.wc.upcoming': '📅 Este Mundial — Próximos',
      'td.h2h.records': '⚔️ Historial de enfrentamientos',
      'td.h2h.opponent': 'Oponente',
      'td.h2h.matches': 'Partidos',
      'td.h2h.winrate': 'Tasa de victorias',
      'td.wc.total.matches': 'Total partidos en Mundiales',
      'td.wc.total.goals': 'Total goles',
      'td.wc.total.conceded': 'Total recibidos',
      'td.wc.avg.goals': 'Goles por partido',
      'td.wc.avg.conceded': 'Recibidos por partido',
      'td.wc.trophies': 'Títulos mundialistas',
      'td.no.history': 'Sin datos históricos',
      'td.squad.value.tab': 'Plantilla y Valor',
      'td.history.tab': 'Historial',
      'td.close': 'Cerrar',
      'td.injury.warn': '⚠️ Jugadores clave ausentes, puede afectar el rendimiento',
      'td.injury.count': 'jugadores',
      'match.tbd.score': 'Por confirmar',
      'analysis.attack.label': 'Ataque',
      'analysis.defense.label': 'Defensa',
      'common.win.short': 'G',
      'common.draw.short': 'E',
      'common.loss.short': 'P',
      'common.group': 'Grupo',
      'common.local.data': 'Datos locales',
      'common.day.before': 'Día anterior',
      'common.day.after': 'Día siguiente',
      // ── DeepSeek Panel ──
      'ds.ready.msg': '✅ Asistente IA listo · Genera prompt y salta a plataforma IA',
      'ds.select.first': '¡Selecciona un partido primero!',
      'ds.generating': '✨ Generando prompt...',
      'ds.regenerate': '🔄 Regenerar prompt',
      'ds.copied': '✅ Copiado',
      'ds.generate.btn': '✨ Generar prompt IA',
      'ds.copy.fail': 'Fallo al copiar, por favor copia manualmente',
    },

    // ── Français ──
    fr: {
      'header.badge': '🏆 Coupe du Monde 2026 USA·Canada·Mexique · 23e Coupe du Monde de la FIFA · USA · Canada · Mexique',
      'header.title': 'Système de Prédiction de Scores IA',
      'header.subtitle': 'Moteur intelligent à six dimensions: H2H · Puissance · Blessures · Effectif · Météo',
      'header.stat.teams': 'Équipes',
      'header.stat.matches': 'Matchs',
      'header.stat.groups': 'Groupes',
      'header.stat.cities': 'Villes hôtes',

      'refresh.bar': '🌐 Données en temps réel via proxy · Sync auto au rafraîchissement · Compte à rebours',
      'refresh.last': 'Dernière sync',
      'refresh.now': '⚡ Sync Maintenant',

      'nav.predict': '🤖 Prédiction IA',
      'nav.schedule': '📅 Calendrier',
      'nav.results': '📊 Résultats',
      'nav.groups': '🏅 Classement',
      'nav.bracket': '🏆 Éliminatoires',
      'nav.teams': '⚡ Puissance',

      'predict.header': '🤖 Prédiction Intelligente de Scores',
      'predict.desc': 'Moteur basé sur H2H · Classement FIFA · Forme récente · Météo · Analyse Claude Opus IA',
      'predict.today': '📅 Prédictions de Matchs',
      'predict.today.badge': "Aujourd'hui & Demain",
      'predict.today.subtitle': 'Cliquez sur un match pour le rapport complet IA · Conseils de combinés pour aujourd\'hui et demain',

      'predict.weather': 'Météo',
      'predict.prob.home': 'Domicile',
      'predict.prob.draw': 'Nul',
      'predict.prob.away': 'Extérieur',

      'lottery.title': 'Paris Sportifs · Conseils Combinés',
      'lottery.subtitle': 'Référence assistée par IA',
      'lottery.disclaimer': '⚠️ Les cotes sont des estimations du modèle IA à titre indicatif uniquement, pas des conseils de paris. Pariez de manière responsable.',

      'reasoning.title': 'Raisonnement de Prédiction IA',
      'reasoning.subtitle': 'Basé sur une analyse à 5 dimensions',

      'analysis.h2h': '📈 Historique des Confrontations',
      'analysis.form': '⚡ Forme Récente',
      'analysis.attack': '🎯 Index Attaque & Défense',
      'analysis.players': '👥 Joueurs Clés & Tactiques',

      'dual.title': 'Assistant d\'Analyse IA',
      'dual.subtitle': 'Générez un prompt d\'analyse professionnel · Allez aux plateformes IA · Vous contrôlez le processus',
      'dual.badge': 'Prêt',
      'dual.btn': '✨ Générer Prompt IA',
      'dual.prompt.full': '📋 Analyse Complète',
      'dual.prompt.lite': '⚡ Réponse Rapide',
      'dual.prompt.title': '📝 Prompt d\'Analyse (données du match auto-remplies)',
      'dual.copy': '📋 Copier',
      'dual.jump.title': '🚀 Aller à la Plateforme IA (collez pour obtenir l\'analyse)',
      'dual.keywords.title': '🔍 Mots-clés de Recherche (cliquez pour copier)',
      'dual.local.title': 'Analyse Statistique Locale',
      'dual.tips': '💡 Comment utiliser — Cliquez sur le bouton → Copiez le prompt → Allez à n\'importe quelle IA → Collez pour une analyse professionnelle',
      'dual.ready': 'Prêt',
      'dual.consensus': '🎯 Consensus',
      'dual.consistent': 'Concordent',
      'dual.divergent': 'Divergent',
      'dual.online': 'Les Deux En Ligne',
      'dual.partial': 'Partiel',
      'dual.local': 'Moteur Local',
      'dual.analyzing': 'Génération...',
      'dual.seeReport': 'Voir Rapport',
      'dual.localEngine': 'Moteur Local',
      'dual.localAnalysis': 'Analyse Statistique Locale',
      'dual.tokens': 'jetons',

      'scoredist.title': '🎲 Distribution de Probabilité des Scores (Top 8)',

      'schedule.header': '📅 Calendrier Complet',
      'schedule.desc': 'Les 104 matchs · 🟢Vert=Terminé · 🔴Rouge=Prédiction IA · 🥇1er🥈2e🎯Surprise',
      'schedule.all': 'Tous',
      'schedule.group': 'Phase de Groupes',
      'schedule.knockout': 'Éliminatoires',
      'schedule.upcoming': 'À Venir',
      'schedule.completed': 'Terminés',

      'results.header': '📊 Résultats des Matchs',
      'results.desc': 'Tous les résultats depuis le 11 juin',

      'groups.header': '🏅 Classement des Groupes',
      'groups.desc': 'Classement en temps réel · Les 12 groupes',

      'bracket.header': '🏆 Tableau Éliminatoire',
      'bracket.desc': 'Les 2 premiers de chaque groupe + 8 meilleurs 3e avancent aux 32es · Rempli automatiquement',

      'teams.header': '⚡ Classement de Puissance des Équipes',
      'teams.desc': 'Score basé sur classement FIFA, historique, forme récente · Les 48 équipes · Clic pour détails',
      'teams.search': '🔍 Rechercher une équipe...',

      'footer.data': '📊 Données: FIFA officiel, records historiques, classement FIFA (juin 2026) · 🌤️ Météo: Open-Meteo',
      'footer.ai': '🤖 Prédictions IA à titre indicatif · Modèle statistique + Monte Carlo + Claude Opus 4.7 · ⚠️ Pariez avec responsabilité',
      'footer.copy': '2026 FIFA World Cup AI Predictor · Données temps réel via proxy · Clés API sécurisées',

      'common.kickoff': 'Coup d\'envoi imminent',
      'common.today': "Aujourd'hui",
      'common.tomorrow': 'Demain',
      'common.win': 'V',
      'common.draw': 'N',
      'common.loss': 'D',
      'common.homeWin': 'Victoire Domicile',
      'common.awayWin': 'Victoire Extérieur',
      'common.noAnalysis': 'Pas de données d\'analyse',
      'common.TBD': 'À déterminer',
      'common.unknown': 'Inconnu',
      'common.TBD2': 'À déterminer',

      'status.finished': 'FT',
      'status.live': 'En Direct',
      'status.scheduled': 'Programmé',

      'group.table.team': 'Équipe',
      'group.table.played': 'J',
      'group.table.win': 'V',
      'group.table.draw': 'N',
      'group.table.loss': 'D',
      'group.table.gf': 'BP',
      'group.table.ga': 'BC',
      'group.table.gd': 'Diff',
      'group.table.pts': 'Pts',
      'group.table.pos': '#',

      'team.tab.squad': 'Effectif',
      'team.tab.injuries': 'Blessures',
      'team.tab.analysis': 'Analyse',

      'parlay.winloss': 'Pick Victoire/Défaite',
      'parlay.undefeated': 'Pick Invaincu',
      'parlay.goals': 'Pick Total Buts',
      'parlay.over': 'Plus ≥3',
      'parlay.under': 'Moins ≤2',
      'parlay.score1': 'Score Principal (Haute Cote)',
      'parlay.score2': 'Score Alternatif',
      'parlay.undefeated2': 'Invaincu',
      'parlay.game1': 'Match 1',

      'parlay.hit.full': 'Plein Succès',
      'parlay.hit.direction': 'Direction OK',
      'parlay.hit.miss': 'Raté',

      'injury.warn': '⚠️ L\'absence de joueurs clés peut affecter les performances',
      'injury.none': 'Pas de données de blessures',
      'injury.full': 'Effectif complet disponible',

      'freshness.fresh': 'Venant d\'être mis à jour',
      'freshness.recent': 'Données récentes',
      'freshness.stale': 'Données potentiellement obsolètes',

      'ai.system': 'Vous êtes un analyste de football de classe mondiale avec 20 ans d\'expérience en couverture de Coupes du Monde. Fournissez une analyse objective, professionnelle et concise basée sur les données, en moins de 400 mots. Veuillez répondre en français.',
      'ai.system.mimo': 'Vous êtes un analyste de football de classe mondiale avec 20 ans d\'expérience. Fournissez une analyse objective et concise en moins de 400 mots. Vous êtes un analyste IA indépendant — donnez votre propre jugement indépendant. Veuillez répondre en français.',
      'ai.local.engine': 'Moteur Statistique Local',

      // ── Matchs du jour/demain ──
      'today.matches': "Matchs d'Aujourd'hui",
      'today.tomorrow': 'Matchs de Demain',
      'today.match.unit': 'matchs',
      'today.no.matches': "Aucun match prévu aujourd'hui ou demain",
      'today.view.ai': 'Voir l\'analyse IA complète',
      'prob.home.win': 'Victoire Domicile',
      'prob.draw.short': 'Nul',
      'prob.away.win': 'Victoire Extérieur',

      // ── Météo ──
      'weather.loading': '⏳ Chargement météo...',
      'weather.feels': 'Ressenti',
      'weather.humidity': 'Humidité',
      'weather.wind': 'Vent',
      'weather.estimated': 'Estimé',

      // ── Statut du match ──
      'match.ft': '✅ Terminé',
      'match.live': '🔴 En direct',
      'match.likely.completed': '⏳ Probablement terminé · En attente de confirmation',
      'match.upcoming.short': 'À venir',
      'match.toconfirm': 'À confirmer',

      // ── Résultat de prédiction ──
      'pred.fifa.rank': 'Classement FIFA #',
      'pred.score.primary': '🥇 Pronostic principal',
      'pred.score.secondary': '🥈 Pronostic alternatif',
      'pred.score.defensive': '🎯 Pronostic surprise',
      'pred.probability': 'Prob',
      'pred.best.pick': 'Plus haute probabilité',
      'pred.second.pick': 'Deuxième plus probable',
      'pred.upset.pick': 'Surprise à haute cote',
      'pred.form.pts': 'pts',
      'pred.expected.goals': 'Total buts attendus',
      'pred.goals.unit': 'buts',
      'pred.core.player': 'Joueur clé',
      'pred.tactics': 'Tactiques',
      'pred.championships': 'Titres de Coupes du Monde',
      'pred.draw.label': 'Nul',
      'pred.no.h2h': 'Pas de confrontations précédentes en Coupe du Monde',

      // ── Cartes d'analyse ──
      'analysis.attack.label': 'Attaque',
      'analysis.defense.label': 'Défense',

      // ── Combinés ──
      'parlay.type.winloss': 'Pick Victoire/Défaite',
      'parlay.type.goals': 'Pick Total Buts',
      'parlay.type.score1': 'Score Principal (Haute Cote)',
      'parlay.type.score2': 'Score Alternatif',
      'parlay.type.parlay2': 'Combiné double',
      'parlay.type.parlay3': 'Combiné triple',
      'parlay.home.win': 'Victoire Domicile',
      'parlay.away.win': 'Victoire Extérieur',
      'parlay.unbeaten': 'Invaincu',
      'parlay.unbeaten.pick': 'Pick Invaincu',
      'parlay.over.pick': 'Plus ≥3',
      'parlay.under.pick': 'Moins ≤2',
      'parlay.ref.odds': 'Cote réf.',
      'parlay.match.unit': 'M',
      'parlay.tomorrow.tag': '(Demain)',
      'parlay.primary.score': 'Score principal',
      'parlay.secondary.score': 'Score alt.',
      'parlay.total.goals.pred': 'Total buts prédit',
      'parlay.tendency': 'tendance',

      // ── Résultats ──
      'results.accuracy': 'Précision des prédictions IA',
      'results.direction': 'Direction Victoire/Défaite',
      'results.exact.hit': 'Score exact',
      'results.exact.rate': 'Score exact',
      'results.completed': 'Terminés',
      'results.latest': 'Dernier',
      'results.no.data': 'Pas encore de résultats',
      'results.ai.pred': '🤖 Prédiction IA pré-match',
      'results.predicted': 'Prédit',
      'results.actual': 'Réel',
      'results.not.recorded': 'Pas de prédiction enregistrée',
      'results.match.unit': 'matchs',

      // ── Tableau éliminatoire ──
      'bracket.r32': '32es de finale',
      'bracket.r16': '16es de finale',
      'bracket.qf': 'Quarts de finale',
      'bracket.sf1': 'Demi-finale ①',
      'bracket.sf2': 'Demi-finale ②',
      'bracket.3rd': '3e place',
      'bracket.final': '🏆 Finale',
      'bracket.tbd': 'À déterminer',
      'bracket.filled': 'remplis',
      'bracket.seats': 'places',
      'bracket.based.on': '📊 Qualification automatique par points · Remplis',
      'bracket.upper': 'Moitié supérieure',
      'bracket.final.stage': '🏅 Phase Finale',
      'bracket.champion': 'Champion 2026',
      'bracket.sf1.loser': 'Perdant DF①',
      'bracket.sf2.loser': 'Perdant DF②',
      'bracket.sf1.winner': 'Vainqueur DF①',
      'bracket.sf2.winner': 'Vainqueur DF②',
      'bracket.group.qualifier': 'Qualifié de groupe',
      'bracket.multi.city': 'Multi-villes',
      'bracket.sf.winner': 'Vainqueur DF',
      'bracket.ko.round': '32es (dès le 28 juin) — Éliminatoires',
      'bracket.final.match': 'Finale (19 juil) — New York MetLife',
      'bracket.final.tag': 'Finale',

      // ── Puissance des équipes ──
      'tp.attack': 'Attaque',
      'tp.defense': 'Défense',
      'tp.overall': 'Général',

      // ── Détails de l'équipe ──
      'td.squad.value': '💰 Valeur totale de l\'effectif',
      'td.squad.count': '📋 Taille de l\'effectif',
      'td.squad.people': 'joueurs',
      'td.position': 'Poste',
      'td.player': 'Joueur',
      'td.club': 'Club',
      'td.value': 'Valeur',
      'td.star.player': '⭐ Joueurs clés',
      'td.more.info': '📝 Plus d\'infos avant le coup d\'envoi',
      'td.no.squad': 'Pas de données d\'effectif',
      'td.injury.players': '🏥 Joueurs blessés',
      'td.injury.status': 'État des blessures',
      'td.no.injury': '✅ Pas de blessures, effectif complet',
      'td.form': 'Forme',
      'td.rank': 'Classement',
      'td.tactical.style': 'Style tactique',
      'td.core.player': 'Joueur clé',
      'td.recent.trend': 'Tendance récente',
      'td.wc.championships': 'Titres de Coupes du Monde',
      'td.wc.prospect': 'Analyse des perspectives en Coupe du Monde',
      'td.no.analysis': 'Pas de données d\'analyse',
      'td.this.wc.played': '🎯 Cette Coupe du Monde — Joués',
      'td.this.wc.upcoming': '📅 Cette Coupe du Monde — À venir',
      'td.h2h.records': '⚔️ Historique des confrontations',
      'td.h2h.opponent': 'Adversaire',
      'td.h2h.matches': 'Matchs',
      'td.h2h.winrate': 'Taux de victoires',
      'td.wc.total.matches': 'Total matchs en Coupes du Monde',
      'td.wc.total.goals': 'Total buts',
      'td.wc.total.conceded': 'Total encaissés',
      'td.wc.avg.goals': 'Buts par match',
      'td.wc.avg.conceded': 'Encaissés par match',
      'td.wc.trophies': 'Titres de Coupes du Monde',
      'td.no.history': 'Pas de données historiques',
      'td.squad.value.tab': 'Effectif & Valeur',
      'td.history.tab': 'Historique',
      'td.close': 'Fermer',
      'td.injury.warn': '⚠️ Joueurs clés absents, peut affecter les performances',
      'td.injury.count': 'joueurs',
      'match.tbd.score': 'À confirmer',
      'analysis.attack.label': 'Attaque',
      'analysis.defense.label': 'Défense',
      'common.win.short': 'G',
      'common.draw.short': 'N',
      'common.loss.short': 'P',
      'common.group': 'Groupe',
      'common.local.data': 'Données locales',
      'common.day.before': 'Jour précédent',
      'common.day.after': 'Jour suivant',
      // ── DeepSeek Panel ──
      'ds.ready.msg': '✅ Assistant IA prêt · Générez prompt et allez à plateforme IA',
      'ds.select.first': 'Sélectionnez un match d\'abord !',
      'ds.generating': '✨ Génération du prompt...',
      'ds.regenerate': '🔄 Régénérer le prompt',
      'ds.copied': '✅ Copié',
      'ds.generate.btn': '✨ Générer prompt IA',
      'ds.copy.fail': 'Échec de la copie, veuillez copier manuellement',
    },
  },

  // ════════════════════════════════════════════
  //  球队名称翻译（英文Key → 各语言）
  // ════════════════════════════════════════════
  teamNames: {
    // 中文
    zh: {
      "Argentina":"阿根廷","Spain":"西班牙","France":"法国","England":"英格兰",
      "Portugal":"葡萄牙","Brazil":"巴西","Morocco":"摩洛哥","Netherlands":"荷兰",
      "Belgium":"比利时","Germany":"德国","Croatia":"克罗地亚","Colombia":"哥伦比亚",
      "Mexico":"墨西哥","Senegal":"塞内加尔","Uruguay":"乌拉圭","USA":"美国",
      "Japan":"日本","Iran":"伊朗","South Korea":"韩国","Australia":"澳大利亚",
      "Switzerland":"瑞士","Denmark":"丹麦","Sweden":"瑞典","Norway":"挪威",
      "Serbia":"塞尔维亚","Poland":"波兰","Austria":"奥地利","Czech Republic":"捷克",
      "Turkey":"土耳其","Greece":"希腊","Scotland":"苏格兰","Wales":"威尔士",
      "Ecuador":"厄瓜多尔","Paraguay":"巴拉圭","Peru":"秘鲁","Chile":"智利",
      "Canada":"加拿大","Qatar":"卡塔尔","Saudi Arabia":"沙特阿拉伯","Iraq":"伊拉克",
      "Egypt":"埃及","Tunisia":"突尼斯","Algeria":"阿尔及利亚","Ivory Coast":"科特迪瓦",
      "Nigeria":"尼日利亚","Cameroon":"喀麦隆","Ghana":"加纳","South Africa":"南非",
      "New Zealand":"新西兰","Jordan":"约旦","Uzbekistan":"乌兹别克斯坦","Bosnia":"波黑",
      "Haiti":"海地","Curacao":"库拉索","Cape Verde":"佛得角","DR Congo":"刚果民主共和国",
      "Panama":"巴拿马","Costa Rica":"哥斯达黎加",
    },
    // English (identity mapping)
    en: null, // null = use key directly
    // Español
    es: {
      "Argentina":"Argentina","Spain":"España","France":"Francia","England":"Inglaterra",
      "Portugal":"Portugal","Brazil":"Brasil","Morocco":"Marruecos","Netherlands":"Países Bajos",
      "Belgium":"Bélgica","Germany":"Alemania","Croatia":"Croacia","Colombia":"Colombia",
      "Mexico":"México","Senegal":"Senegal","Uruguay":"Uruguay","USA":"EE.UU.",
      "Japan":"Japón","Iran":"Irán","South Korea":"Corea del Sur","Australia":"Australia",
      "Switzerland":"Suiza","Denmark":"Dinamarca","Sweden":"Suecia","Norway":"Noruega",
      "Serbia":"Serbia","Poland":"Polonia","Austria":"Austria","Czech Republic":"República Checa",
      "Turkey":"Turquía","Greece":"Grecia","Scotland":"Escocia","Wales":"Gales",
      "Ecuador":"Ecuador","Paraguay":"Paraguay","Peru":"Perú","Chile":"Chile",
      "Canada":"Canadá","Qatar":"Catar","Saudi Arabia":"Arabia Saudita","Iraq":"Irak",
      "Egypt":"Egipto","Tunisia":"Túnez","Algeria":"Argelia","Ivory Coast":"Costa de Marfil",
      "Nigeria":"Nigeria","Cameroon":"Camerún","Ghana":"Ghana","South Africa":"Sudáfrica",
      "New Zealand":"Nueva Zelanda","Jordan":"Jordania","Uzbekistan":"Uzbekistán","Bosnia":"Bosnia",
      "Haiti":"Haití","Curacao":"Curazao","Cape Verde":"Cabo Verde","DR Congo":"R.D. Congo",
      "Panama":"Panamá","Costa Rica":"Costa Rica",
    },
    // Français
    fr: {
      "Argentina":"Argentine","Spain":"Espagne","France":"France","England":"Angleterre",
      "Portugal":"Portugal","Brazil":"Brésil","Morocco":"Maroc","Netherlands":"Pays-Bas",
      "Belgium":"Belgique","Germany":"Allemagne","Croatia":"Croatie","Colombia":"Colombie",
      "Mexico":"Mexique","Senegal":"Sénégal","Uruguay":"Uruguay","USA":"États-Unis",
      "Japan":"Japon","Iran":"Iran","South Korea":"Corée du Sud","Australia":"Australie",
      "Switzerland":"Suisse","Denmark":"Danemark","Sweden":"Suède","Norway":"Norvège",
      "Serbia":"Serbie","Poland":"Pologne","Austria":"Autriche","Czech Republic":"République Tchèque",
      "Turkey":"Turquie","Greece":"Grèce","Scotland":"Écosse","Wales":"Pays de Galles",
      "Ecuador":"Équateur","Paraguay":"Paraguay","Peru":"Pérou","Chile":"Chili",
      "Canada":"Canada","Qatar":"Qatar","Saudi Arabia":"Arabie Saoudite","Iraq":"Irak",
      "Egypt":"Égypte","Tunisia":"Tunisie","Algeria":"Algérie","Ivory Coast":"Côte d'Ivoire",
      "Nigeria":"Nigéria","Cameroon":"Cameroun","Ghana":"Ghana","South Africa":"Afrique du Sud",
      "New Zealand":"Nouvelle-Zélande","Jordan":"Jordanie","Uzbekistan":"Ouzbékistan","Bosnia":"Bosnie",
      "Haiti":"Haïti","Curacao":"Curaçao","Cape Verde":"Cap-Vert","DR Congo":"RD Congo",
      "Panama":"Panama","Costa Rica":"Costa Rica",
    },
  },

  // ════════════════════════════════════════════
  //  城市名称翻译
  // ════════════════════════════════════════════
  cityNames: {
    zh: {
      'Los Angeles':'洛杉矶','New York/New Jersey':'纽约/新泽西','Dallas':'达拉斯',
      'Houston':'休斯顿','Atlanta':'亚特兰大','Seattle':'西雅图','San Francisco':'旧金山',
      'Boston':'波士顿','Philadelphia':'费城','Miami':'迈阿密','Kansas City':'堪萨斯城',
      'Mexico City':'墨西哥城','Guadalajara':'瓜达拉哈拉','Monterrey':'蒙特雷',
      'Toronto':'多伦多','Vancouver':'温哥华',
    },
    en: null,
    es: {
      'Los Angeles':'Los Ángeles','New York/New Jersey':'Nueva York/Nueva Jersey','Dallas':'Dallas',
      'Houston':'Houston','Atlanta':'Atlanta','Seattle':'Seattle','San Francisco':'San Francisco',
      'Boston':'Boston','Philadelphia':'Filadelfia','Miami':'Miami','Kansas City':'Kansas City',
      'Mexico City':'Ciudad de México','Guadalajara':'Guadalajara','Monterrey':'Monterrey',
      'Toronto':'Toronto','Vancouver':'Vancouver',
    },
    fr: {
      'Los Angeles':'Los Angeles','New York/New Jersey':'New York/New Jersey','Dallas':'Dallas',
      'Houston':'Houston','Atlanta':'Atlanta','Seattle':'Seattle','San Francisco':'San Francisco',
      'Boston':'Boston','Philadelphia':'Philadelphie','Miami':'Miami','Kansas City':'Kansas City',
      'Mexico City':'Mexico','Guadalajara':'Guadalajara','Monterrey':'Monterrey',
      'Toronto':'Toronto','Vancouver':'Vancouver',
    },
  },

  // ════════════════════════════════════════════
  //  核心方法
  // ════════════════════════════════════════════

  // 初始化：检测语言、加载存储、应用翻译
  init() {
    // 1. 从 localStorage 读取
    let saved = null;
    try { saved = localStorage.getItem('wc2026_lang'); } catch(e) {}

    // 2. 检测浏览器语言
    if (!saved) {
      const browserLang = (navigator.language || navigator.userLanguage || 'zh').toLowerCase();
      if (browserLang.startsWith('zh')) saved = 'zh';
      else if (browserLang.startsWith('es')) saved = 'es';
      else if (browserLang.startsWith('fr')) saved = 'fr';
      else saved = 'en';
    }

    this._currentLang = saved;
    this.applyTranslations();
  },

  // 获取当前语言
  get lang() { return this._currentLang; },

  // 设置语言并保存
  setLang(lang) {
    if (!this.translations[lang]) return;
    this._currentLang = lang;
    try { localStorage.setItem('wc2026_lang', lang); } catch(e) {}
    this.applyTranslations();
    // 触发语言变更事件，让 app.js 等重新渲染
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  },

  // 翻译函数：t('key') → 当前语言的文本
  t(key) {
    const dict = this.translations[this._currentLang] || this.translations.zh;
    return dict[key] || this.translations.zh[key] || key;
  },

  // 翻译球队名称
  teamName(enName) {
    if (!enName) return '';
    const map = this.teamNames[this._currentLang];
    if (!map) return enName; // en: use key directly
    return map[enName] || enName;
  },

  // 翻译城市名称
  cityName(enName) {
    if (!enName) return '';
    const map = this.cityNames[this._currentLang];
    if (!map) return enName;
    return map[enName] || enName;
  },

  // 获取AI Prompt的语言指令
  getPromptLangInstruction() {
    const instructions = {
      zh: '请用中文回答。',
      en: 'Please respond in English.',
      es: 'Por favor responde en español.',
      fr: 'Veuillez répondre en français.',
    };
    return instructions[this._currentLang] || instructions.zh;
  },

  // 应用所有 data-i18n 属性的翻译
  applyTranslations() {
    // 更新 <html lang="...">
    document.documentElement.lang = this._currentLang === 'zh' ? 'zh-CN' : this._currentLang;

    // 更新所有带 data-i18n 的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    // 更新带 data-i18n-placeholder 的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // 更新页面标题
    const titleMap = {
      zh: '⚽ 2026 FIFA 世界杯 AI 比分预测',
      en: '⚽ 2026 FIFA World Cup AI Score Prediction',
      es: '⚽ Predicción de Marcadores IA - Copa Mundial 2026',
      fr: '⚽ Prédiction de Scores IA - Coupe du Monde 2026',
    };
    document.title = titleMap[this._currentLang] || titleMap.zh;

    // 更新语言切换器的当前选中状态
    const switcher = document.getElementById('langSwitcher');
    if (switcher) switcher.value = this._currentLang;
  },
};

// 暴露到全局
window.I18n = I18n;
window.t = (key) => I18n.t(key);

// 自动初始化（在DOM准备好时）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}
