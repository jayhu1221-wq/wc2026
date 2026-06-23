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

      // Dual AI
      'dual.title': '双AI大模型对比分析',
      'dual.subtitle': 'Claude Opus 4.7 × 小米MiMo 双引擎独立预测 · 交叉验证提升准确率',
      'dual.badge': '双模型',
      'dual.claude': 'Claude Opus 4.7',
      'dual.mimo': 'MiMo-V2.5-Pro',
      'dual.waiting': '等待分析',
      'dual.btn': '🔄 双模型对比分析',
      'dual.claude.title': 'Claude Opus 4.7 分析',
      'dual.mimo.title': '小米 MiMo 分析',
      'dual.consensus': '🎯 综合研判',
      'dual.tips': '🤖 双AI引擎已就绪 — Claude Opus 4.7 + 小米MiMo 独立分析，交叉验证提升预测可靠性',
      'dual.consistent': '一致',
      'dual.divergent': '分歧',
      'dual.online': '双模型在线',
      'dual.partial': '部分在线',
      'dual.local': '本地引擎',
      'dual.analyzing': '分析中...',
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
      'common TBD': '待定',
      'common.unknown': '未知',
      'common TBD2': '待定',

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

      'dual.title': 'Dual AI Model Comparison',
      'dual.subtitle': 'Claude Opus 4.7 × MiMo dual-engine independent prediction · Cross-validation for accuracy',
      'dual.badge': 'Dual Model',
      'dual.claude': 'Claude Opus 4.7',
      'dual.mimo': 'MiMo-V2.5-Pro',
      'dual.waiting': 'Waiting',
      'dual.btn': '🔄 Dual Model Analysis',
      'dual.claude.title': 'Claude Opus 4.7 Analysis',
      'dual.mimo.title': 'MiMo Analysis',
      'dual.consensus': '🎯 Consensus',
      'dual.tips': '🤖 Dual AI engines ready — Claude Opus 4.7 + MiMo independent analysis with cross-validation',
      'dual.consistent': 'Consistent',
      'dual.divergent': 'Divergent',
      'dual.online': 'Both Online',
      'dual.partial': 'Partial',
      'dual.local': 'Local Engine',
      'dual.analyzing': 'Analyzing...',
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
      'common TBD': 'TBD',
      'common.unknown': 'Unknown',
      'common TBD2': 'TBD',

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

      'dual.title': 'Comparación de Doble Modelo IA',
      'dual.subtitle': 'Claude Opus 4.7 × MiMo doble motor independiente · Validación cruzada para mayor precisión',
      'dual.badge': 'Doble Modelo',
      'dual.claude': 'Claude Opus 4.7',
      'dual.mimo': 'MiMo-V2.5-Pro',
      'dual.waiting': 'Esperando',
      'dual.btn': '🔄 Análisis Doble Modelo',
      'dual.claude.title': 'Análisis Claude Opus 4.7',
      'dual.mimo.title': 'Análisis MiMo',
      'dual.consensus': '🎯 Consenso',
      'dual.tips': '🤖 Doble motor IA listo — Claude Opus 4.7 + MiMo análisis independiente con validación cruzada',
      'dual.consistent': 'Coinciden',
      'dual.divergent': 'Difieren',
      'dual.online': 'Ambos En Línea',
      'dual.partial': 'Parcial',
      'dual.local': 'Motor Local',
      'dual.analyzing': 'Analizando...',
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
      'common TBD': 'Por confirmar',
      'common.unknown': 'Desconocido',
      'common TBD2': 'Por confirmar',

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

      'dual.title': 'Comparaison Double Modèle IA',
      'dual.subtitle': 'Claude Opus 4.7 × MiMo double moteur indépendant · Validation croisée pour la précision',
      'dual.badge': 'Double Modèle',
      'dual.claude': 'Claude Opus 4.7',
      'dual.mimo': 'MiMo-V2.5-Pro',
      'dual.waiting': 'En attente',
      'dual.btn': '🔄 Analyse Double Modèle',
      'dual.claude.title': 'Analyse Claude Opus 4.7',
      'dual.mimo.title': 'Analyse MiMo',
      'dual.consensus': '🎯 Consensus',
      'dual.tips': '🤖 Doubles moteurs IA prêts — Claude Opus 4.7 + MiMo analyse indépendante avec validation croisée',
      'dual.consistent': 'Concordent',
      'dual.divergent': 'Divergent',
      'dual.online': 'Les Deux En Ligne',
      'dual.partial': 'Partiel',
      'dual.local': 'Moteur Local',
      'dual.analyzing': 'Analyse...',
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
      'common TBD': 'À déterminer',
      'common.unknown': 'Inconnu',
      'common TBD2': 'À déterminer',

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
