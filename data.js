// ============================================
// data.js — 2026 World Cup Complete Data
// ============================================

const WC2026_DATA = {

  // ── 球队中文名映射 ──
  teamZhName: {
    "Argentina":    "阿根廷",    "Spain":        "西班牙",    "France":       "法国",
    "England":      "英格兰",    "Portugal":     "葡萄牙",    "Brazil":       "巴西",
    "Morocco":      "摩洛哥",    "Netherlands":  "荷兰",      "Belgium":      "比利时",
    "Germany":      "德国",      "Croatia":      "克罗地亚",  "Colombia":     "哥伦比亚",
    "Mexico":       "墨西哥",    "Senegal":      "塞内加尔",  "Uruguay":      "乌拉圭",
    "USA":          "美国",      "Japan":        "日本",      "Switzerland":  "瑞士",
    "Iran":         "伊朗",      "Turkey":       "土耳其",    "Ecuador":      "厄瓜多尔",
    "Austria":      "奥地利",    "South Korea":  "韩国",      "Australia":    "澳大利亚",
    "Algeria":      "阿尔及利亚","Egypt":        "埃及",      "Canada":       "加拿大",
    "Norway":       "挪威",      "Ivory Coast":  "科特迪瓦",  "Panama":       "巴拿马",
    "Sweden":       "瑞典",      "Czech Republic":"捷克",     "Paraguay":     "巴拉圭",
    "Scotland":     "苏格兰",    "Tunisia":      "突尼斯",    "DR Congo":     "刚果（金）",
    "Uzbekistan":   "乌兹别克斯坦","Jordan":     "约旦",      "Saudi Arabia": "沙特阿拉伯",
    "Cape Verde":   "佛得角",    "Ghana":        "加纳",      "New Zealand":  "新西兰",
    "South Africa": "南非",      "Bosnia":       "波黑",      "Qatar":        "卡塔尔",
    "Haiti":        "海地",      "Curacao":      "库拉索",    "Iraq":         "伊拉克"
  },

  // ── FIFA Rankings (June 11, 2026 update) ──
  fifaRankings: {
    "Argentina":    { rank: 1,  pts: 1877 },
    "Spain":        { rank: 2,  pts: 1875 },
    "France":       { rank: 3,  pts: 1871 },
    "England":      { rank: 4,  pts: 1828 },
    "Portugal":     { rank: 5,  pts: 1768 },
    "Brazil":       { rank: 6,  pts: 1766 },
    "Morocco":      { rank: 7,  pts: 1755 },
    "Netherlands":  { rank: 8,  pts: 1754 },
    "Belgium":      { rank: 9,  pts: 1742 },
    "Germany":      { rank: 10, pts: 1736 },
    "Croatia":      { rank: 11, pts: 1715 },
    "Colombia":     { rank: 13, pts: 1698 },
    "Mexico":       { rank: 14, pts: 1687 },
    "Senegal":      { rank: 15, pts: 1684 },
    "Uruguay":      { rank: 16, pts: 1673 },
    "USA":          { rank: 17, pts: 1671 },
    "Japan":        { rank: 18, pts: 1662 },
    "Switzerland":  { rank: 19, pts: 1650 },
    "Iran":         { rank: 20, pts: 1620 },
    "Turkey":       { rank: 22, pts: 1606 },
    "Ecuador":      { rank: 23, pts: 1599 },
    "Austria":      { rank: 24, pts: 1597 },
    "South Korea":  { rank: 25, pts: 1592 },
    "Australia":    { rank: 27, pts: 1579 },
    "Algeria":      { rank: 28, pts: 1571 },
    "Egypt":        { rank: 29, pts: 1562 },
    "Canada":       { rank: 30, pts: 1559 },
    "Norway":       { rank: 31, pts: 1557 },
    "Ivory Coast":  { rank: 33, pts: 1541 },
    "Panama":       { rank: 34, pts: 1539 },
    "Sweden":       { rank: 38, pts: 1510 },
    "Czech Republic":{ rank: 40, pts: 1506 },
    "Paraguay":     { rank: 41, pts: 1505 },
    "Scotland":     { rank: 42, pts: 1503 },
    "Tunisia":      { rank: 45, pts: 1476 },
    "DR Congo":     { rank: 46, pts: 1474 },
    "Uzbekistan":   { rank: 50, pts: 1459 },
    "Jordan":       { rank: 67, pts: 1390 },
    "Saudi Arabia": { rank: 56, pts: 1427 },
    "Cape Verde":   { rank: 68, pts: 1387 },
    "Ghana":        { rank: 66, pts: 1396 },
    "New Zealand":  { rank: 98, pts: 1265 },
    "South Africa": { rank: 65, pts: 1401 },
    "Bosnia":       { rank: 72, pts: 1372 },
    "Qatar":        { rank: 74, pts: 1360 },
    "Haiti":        { rank: 81, pts: 1321 },
    "Curacao":      { rank: 78, pts: 1340 },
    "Iraq":         { rank: 63, pts: 1405 }
  },

  // ── Group Structure ──
  groups: {
    "A": {
      teams: ["Mexico", "South Korea", "South Africa", "Czech Republic"],
      emoji: { "Mexico": "🇲🇽", "South Korea": "🇰🇷", "South Africa": "🇿🇦", "Czech Republic": "🇨🇿" }
    },
    "B": {
      teams: ["Canada", "Qatar", "Switzerland", "Bosnia"],
      emoji: { "Canada": "🇨🇦", "Qatar": "🇶🇦", "Switzerland": "🇨🇭", "Bosnia": "🇧🇦" }
    },
    "C": {
      teams: ["Brazil", "Morocco", "Scotland", "Haiti"],
      emoji: { "Brazil": "🇧🇷", "Morocco": "🇲🇦", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Haiti": "🇭🇹" }
    },
    "D": {
      teams: ["USA", "Australia", "Paraguay", "Turkey"],
      emoji: { "USA": "🇺🇸", "Australia": "🇦🇺", "Paraguay": "🇵🇾", "Turkey": "🇹🇷" }
    },
    "E": {
      teams: ["Germany", "Ivory Coast", "Ecuador", "Curacao"],
      emoji: { "Germany": "🇩🇪", "Ivory Coast": "🇨🇮", "Ecuador": "🇪🇨", "Curacao": "🇨🇼" }
    },
    "F": {
      teams: ["Netherlands", "Japan", "Tunisia", "Sweden"],
      emoji: { "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Tunisia": "🇹🇳", "Sweden": "🇸🇪" }
    },
    "G": {
      teams: ["Belgium", "Iran", "New Zealand", "Egypt"],
      emoji: { "Belgium": "🇧🇪", "Iran": "🇮🇷", "New Zealand": "🇳🇿", "Egypt": "🇪🇬" }
    },
    "H": {
      teams: ["Spain", "Saudi Arabia", "Uruguay", "Cape Verde"],
      emoji: { "Spain": "🇪🇸", "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾", "Cape Verde": "🇨🇻" }
    },
    "I": {
      teams: ["France", "Senegal", "Norway", "Iraq"],
      emoji: { "France": "🇫🇷", "Senegal": "🇸🇳", "Norway": "🇳🇴", "Iraq": "🇮🇶" }
    },
    "J": {
      teams: ["Argentina", "Austria", "Jordan", "Algeria"],
      emoji: { "Argentina": "🇦🇷", "Austria": "🇦🇹", "Jordan": "🇯🇴", "Algeria": "🇩🇿" }
    },
    "K": {
      teams: ["Portugal", "Colombia", "Uzbekistan", "DR Congo"],
      emoji: { "Portugal": "🇵🇹", "Colombia": "🇨🇴", "Uzbekistan": "🇺🇿", "DR Congo": "🇨🇩" }
    },
    "L": {
      teams: ["England", "Croatia", "Ghana", "Panama"],
      emoji: { "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷", "Ghana": "🇬🇭", "Panama": "🇵🇦" }
    }
  },

  // ── All team emojis map ──
  teamEmoji: {
    "Argentina":    "🇦🇷", "Spain":        "🇪🇸", "France":       "🇫🇷",
    "England":      "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Portugal":     "🇵🇹", "Brazil":       "🇧🇷",
    "Morocco":      "🇲🇦", "Netherlands":  "🇳🇱", "Belgium":      "🇧🇪",
    "Germany":      "🇩🇪", "Croatia":      "🇭🇷", "Colombia":     "🇨🇴",
    "Mexico":       "🇲🇽", "Senegal":      "🇸🇳", "Uruguay":      "🇺🇾",
    "USA":          "🇺🇸", "Japan":        "🇯🇵", "Switzerland":  "🇨🇭",
    "Iran":         "🇮🇷", "Turkey":       "🇹🇷", "Ecuador":      "🇪🇨",
    "Austria":      "🇦🇹", "South Korea":  "🇰🇷", "Australia":    "🇦🇺",
    "Algeria":      "🇩🇿", "Egypt":        "🇪🇬", "Canada":       "🇨🇦",
    "Norway":       "🇳🇴", "Ivory Coast":  "🇨🇮", "Panama":       "🇵🇦",
    "Sweden":       "🇸🇪", "Czech Republic":"🇨🇿", "Paraguay":     "🇵🇾",
    "Scotland":     "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Tunisia":      "🇹🇳", "DR Congo":     "🇨🇩",
    "Uzbekistan":   "🇺🇿", "Jordan":       "🇯🇴", "Saudi Arabia": "🇸🇦",
    "Cape Verde":   "🇨🇻", "Ghana":        "🇬🇭", "New Zealand":  "🇳🇿",
    "South Africa": "🇿🇦", "Bosnia":       "🇧🇦", "Qatar":        "🇶🇦",
    "Haiti":        "🇭🇹", "Curacao":      "🇨🇼", "Iraq":         "🇮🇶",
    "Senegal":      "🇸🇳"
  },

  // ── Venue Timezone & Country Mapping (2026 World Cup) ──
  // offset: UTC offset during June-July (DST accounted for US/CA; Mexico abolished DST in 2022)
  // country: ISO country code abbreviation
  venueTimezone: {
    // Mexico (UTC-6, no DST)
    "阿兹特卡球场":        { offset: -6, country: "MX", city: "墨西哥城" },
    "瓜达拉哈拉体育场":     { offset: -6, country: "MX", city: "瓜达拉哈拉" },
    "蒙特雷体育场":         { offset: -6, country: "MX", city: "蒙特雷" },
    // Canada (DST in effect: Eastern UTC-4, Pacific UTC-7)
    "BMO Field 多伦多":    { offset: -4, country: "CA", city: "多伦多" },
    "BC Place 温哥华":      { offset: -7, country: "CA", city: "温哥华" },
    // USA Eastern (DST: UTC-4)
    "SoFi 体育场":         { offset: -4, country: "US", city: "洛杉矶" },
    "MetLife 体育场":       { offset: -4, country: "US", city: "纽约" },
    "吉利特体育场":         { offset: -4, country: "US", city: "波士顿" },
    "吉利特体育场 波士顿":   { offset: -4, country: "US", city: "波士顿" },
    "林肯金融场 费城":      { offset: -4, country: "US", city: "费城" },
    "费城 林肯金融场":      { offset: -4, country: "US", city: "费城" },
    "亚特兰大体育场":       { offset: -4, country: "US", city: "亚特兰大" },
    "迈阿密体育场":         { offset: -4, country: "US", city: "迈阿密" },
    // USA Central (DST: UTC-5)
    "NRG 体育场 休斯顿":    { offset: -5, country: "US", city: "休斯顿" },
    "休斯顿 NRG":           { offset: -5, country: "US", city: "休斯顿" },
    "AT&T 体育场 达拉斯":   { offset: -5, country: "US", city: "达拉斯" },
    "达拉斯 AT&T":          { offset: -5, country: "US", city: "达拉斯" },
    "堪萨斯城体育场":       { offset: -5, country: "US", city: "堪萨斯城" },
    // USA Pacific (DST: UTC-7)
    "旧金山湾区体育场":     { offset: -7, country: "US", city: "旧金山" },
    "洛杉矶体育场":         { offset: -7, country: "US", city: "洛杉矶" },
    "西雅图体育场":         { offset: -7, country: "US", city: "西雅图" },
    // USA Mountain (DST: UTC-6)
    // 通用 / fallback
    "多城市":               { offset: -5, country: "US", city: "" },
  },

  // ── Completed Match Results ──
  // pred: 赛前AI预测（primaryScore）| null: 未记录预测
  completedResults: [
    // --- 第一轮（6月12-15日）---
    { date:"6月12日", time:"03:00", group:"A", home:"Mexico",      away:"South Africa",  hg:2, ag:0, venue:"阿兹特卡球场",         pred:{hg:2,ag:0} },
    { date:"6月12日", time:"10:00", group:"A", home:"South Korea", away:"Czech Republic", hg:2, ag:1, venue:"瓜达拉哈拉体育场",    pred:{hg:1,ag:1} },
    { date:"6月13日", time:"03:00", group:"B", home:"Canada",      away:"Bosnia",         hg:1, ag:1, venue:"BMO Field 多伦多",    pred:{hg:2,ag:0} },
    { date:"6月13日", time:"09:00", group:"D", home:"USA",         away:"Paraguay",       hg:4, ag:1, venue:"SoFi 体育场",          pred:{hg:3,ag:0} },
    { date:"6月14日", time:"03:00", group:"B", home:"Qatar",       away:"Switzerland",    hg:1, ag:1, venue:"旧金山湾区体育场",     pred:{hg:0,ag:2} },
    { date:"6月14日", time:"06:00", group:"C", home:"Brazil",      away:"Morocco",        hg:1, ag:1, venue:"MetLife 体育场",       pred:{hg:2,ag:0} },
    { date:"6月14日", time:"09:00", group:"C", home:"Haiti",       away:"Scotland",       hg:0, ag:1, venue:"吉利特体育场 波士顿",  pred:{hg:0,ag:2} },
    { date:"6月14日", time:"12:00", group:"D", home:"Australia",   away:"Turkey",         hg:2, ag:0, venue:"BC Place 温哥华",      pred:{hg:1,ag:1} },
    { date:"6月15日", time:"01:00", group:"E", home:"Germany",     away:"Curacao",        hg:7, ag:1, venue:"NRG 体育场 休斯顿",    pred:{hg:4,ag:0} },
    { date:"6月15日", time:"04:00", group:"F", home:"Netherlands", away:"Japan",          hg:2, ag:2, venue:"AT&T 体育场 达拉斯",  pred:{hg:2,ag:1} },
    { date:"6月15日", time:"07:00", group:"E", home:"Ivory Coast", away:"Ecuador",        hg:1, ag:0, venue:"林肯金融场 费城",      pred:{hg:1,ag:1} },
    { date:"6月15日", time:"10:00", group:"F", home:"Sweden",      away:"Tunisia",        hg:5, ag:1, venue:"蒙特雷体育场",         pred:{hg:2,ag:0} },
    // --- 第一轮（6月16日）---
    { date:"6月16日", time:"00:00", group:"H", home:"Spain",        away:"Cape Verde",    hg:0, ag:0, venue:"亚特兰大体育场",        pred:{hg:2,ag:0} },
    { date:"6月16日", time:"03:00", group:"G", home:"Belgium",      away:"Egypt",         hg:1, ag:1, venue:"西雅图体育场",          pred:{hg:2,ag:0} },
    { date:"6月16日", time:"06:00", group:"H", home:"Saudi Arabia", away:"Uruguay",       hg:1, ag:1, venue:"迈阿密体育场",          pred:{hg:0,ag:2} },
    { date:"6月16日", time:"09:00", group:"G", home:"Iran",         away:"New Zealand",   hg:2, ag:2, venue:"洛杉矶体育场",          pred:{hg:1,ag:0} },
    // --- 第一轮（6月17日 已完赛）---
    { date:"6月17日", time:"03:00", group:"I", home:"France",       away:"Senegal",       hg:3, ag:1, venue:"MetLife 体育场",         pred:{hg:2,ag:0} },
    { date:"6月17日", time:"06:00", group:"I", home:"Iraq",         away:"Norway",        hg:1, ag:4, venue:"吉利特体育场",           pred:{hg:0,ag:2} },
    // --- 第一轮（6月17日 已完赛，API确认）---
    { date:"6月17日", time:"09:00", group:"J", home:"Argentina",   away:"Algeria",       hg:3, ag:0, venue:"堪萨斯城体育场",         pred:{hg:2,ag:0} },
    { date:"6月17日", time:"12:00", group:"J", home:"Austria",     away:"Jordan",        hg:3, ag:1, venue:"旧金山湾区体育场",       pred:{hg:2,ag:0} },
    // --- 第一轮（6月18日 已完赛，API确认 2026-06-18 16:30）---
    { date:"6月18日", time:"01:00", group:"K", home:"Portugal",     away:"DR Congo",     hg:1, ag:1, venue:"休斯顿 NRG",            pred:{hg:2,ag:0} },
    { date:"6月18日", time:"04:00", group:"L", home:"England",      away:"Croatia",      hg:4, ag:2, venue:"AT&T 体育场 达拉斯",    pred:{hg:2,ag:0} },
    { date:"6月18日", time:"07:00", group:"L", home:"Ghana",        away:"Panama",       hg:1, ag:0, venue:"BMO Field 多伦多",      pred:{hg:1,ag:0} },
    { date:"6月18日", time:"10:00", group:"K", home:"Uzbekistan",   away:"Colombia",     hg:1, ag:3, venue:"阿兹特卡球场",          pred:{hg:0,ag:2} },
    // --- 第一轮（6月19日 已完赛，API确认 2026-06-19 10:30）---
    { date:"6月19日", time:"00:00", group:"A", home:"Czech Republic",away:"South Africa",hg:1, ag:1, venue:"亚特兰大体育场",        pred:{hg:1,ag:0} },
    { date:"6月19日", time:"03:00", group:"B", home:"Switzerland",  away:"Bosnia",       hg:4, ag:1, venue:"洛杉矶体育场",          pred:{hg:2,ag:0} },
    { date:"6月19日", time:"06:00", group:"B", home:"Canada",       away:"Qatar",        hg:6, ag:0, venue:"BC Place 温哥华",       pred:{hg:2,ag:0} },
    // --- 第二轮（6月19-23日 已完赛，API确认 2026-06-23 11:55）---
    { date:"6月19日", time:"09:00", group:"A", home:"Mexico",       away:"South Korea",  hg:1, ag:0, venue:"瓜达拉哈拉体育场" },
    { date:"6月20日", time:"03:00", group:"D", home:"USA",          away:"Australia",    hg:2, ag:0, venue:"西雅图体育场" },
    { date:"6月20日", time:"06:00", group:"C", home:"Scotland",     away:"Morocco",      hg:0, ag:1, venue:"吉利特体育场" },
    { date:"6月20日", time:"08:30", group:"C", home:"Brazil",       away:"Haiti",        hg:3, ag:0, venue:"费城 林肯金融场" },
    { date:"6月20日", time:"11:00", group:"D", home:"Turkey",       away:"Paraguay",     hg:0, ag:1, venue:"旧金山湾区体育场" },
    { date:"6月21日", time:"01:00", group:"F", home:"Netherlands",  away:"Sweden",       hg:5, ag:1, venue:"休斯顿 NRG" },
    { date:"6月21日", time:"04:00", group:"E", home:"Germany",      away:"Ivory Coast",  hg:2, ag:1, venue:"BMO Field 多伦多" },
    { date:"6月21日", time:"08:00", group:"E", home:"Ecuador",      away:"Curacao",      hg:0, ag:0, venue:"堪萨斯城体育场" },
    { date:"6月21日", time:"12:00", group:"F", home:"Japan",        away:"Tunisia",      hg:4, ag:0, venue:"蒙特雷体育场" },
    { date:"6月22日", time:"00:00", group:"H", home:"Spain",        away:"Saudi Arabia", hg:4, ag:0, venue:"亚特兰大体育场" },
    { date:"6月22日", time:"03:00", group:"G", home:"Belgium",      away:"Iran",         hg:0, ag:0, venue:"洛杉矶体育场" },
    { date:"6月22日", time:"06:00", group:"H", home:"Uruguay",      away:"Cape Verde",   hg:2, ag:2, venue:"迈阿密体育场" },
    { date:"6月22日", time:"09:00", group:"G", home:"New Zealand",  away:"Egypt",        hg:1, ag:3, venue:"BC Place 温哥华" },
    { date:"6月23日", time:"01:00", group:"J", home:"Argentina",    away:"Austria",      hg:2, ag:0, venue:"堪萨斯城体育场" },
    { date:"6月23日", time:"05:00", group:"I", home:"France",       away:"Iraq",         hg:3, ag:0, venue:"MetLife 体育场" },
    { date:"6月23日", time:"08:00", group:"I", home:"Norway",       away:"Senegal",      hg:3, ag:2, venue:"吉利特体育场" }
  ],

  // ── Upcoming Matches with Beijing Time ──
  upcomingMatches: [
    // June 23 — 进行中
    { date:"6月23日", time:"11:00", group:"J", home:"Jordan",        away:"Algeria",     venue:"旧金山湾区体育场", liveScore:{hg:1,ag:0,min:"--"}, status:"live" },
    // June 24
    { date:"6月24日", time:"01:00", group:"K", home:"Portugal",      away:"Uzbekistan",  venue:"阿兹特卡球场" },
    { date:"6月24日", time:"04:00", group:"L", home:"England",       away:"Ghana",       venue:"AT&T 体育场 达拉斯" },
    { date:"6月24日", time:"07:00", group:"L", home:"Panama",        away:"Croatia",     venue:"BMO Field 多伦多" },
    { date:"6月24日", time:"10:00", group:"K", home:"Colombia",      away:"DR Congo",    venue:"休斯顿 NRG" },
    // June 25 — 同组同时开球
    { date:"6月25日", time:"03:00", group:"B", home:"Switzerland",   away:"Canada",      venue:"洛杉矶体育场" },
    { date:"6月25日", time:"03:00", group:"B", home:"Bosnia",        away:"Qatar",       venue:"西雅图体育场" },
    { date:"6月25日", time:"06:00", group:"C", home:"Morocco",       away:"Haiti",       venue:"迈阿密体育场" },
    { date:"6月25日", time:"06:00", group:"C", home:"Scotland",      away:"Brazil",      venue:"费城 林肯金融场" },
    { date:"6月25日", time:"09:00", group:"A", home:"Czech Republic",away:"Mexico",      venue:"亚特兰大体育场" },
    { date:"6月25日", time:"09:00", group:"A", home:"South Africa",  away:"South Korea", venue:"蒙特雷体育场" },
    // June 26 — 同组同时开球
    { date:"6月26日", time:"04:00", group:"E", home:"Ecuador",       away:"Germany",     venue:"堪萨斯城体育场" },
    { date:"6月26日", time:"04:00", group:"E", home:"Curacao",       away:"Ivory Coast", venue:"吉利特体育场" },
    { date:"6月26日", time:"07:00", group:"F", home:"Tunisia",       away:"Netherlands", venue:"BC Place 温哥华" },
    { date:"6月26日", time:"07:00", group:"F", home:"Japan",         away:"Sweden",      venue:"休斯顿 NRG" },
    { date:"6月26日", time:"10:00", group:"D", home:"Turkey",        away:"USA",         venue:"旧金山湾区体育场" },
    { date:"6月26日", time:"10:00", group:"D", home:"Paraguay",      away:"Australia",   venue:"达拉斯 AT&T" }
  ],

  // ── Team Stats Database ──
  teamStats: {
    // Format: { attack, defense, form, worldcupWins, worldcupFinals, style, starPlayer }
    "Argentina": {
      attack: 9.2, defense: 8.4, form: 9.2,
      worldcupWins: 3, worldcupFinals: 6,
      wc_goals_scored: 148, wc_goals_conceded: 67, wc_matches: 89,
      avgGoalsScored: 1.66, avgGoalsConceded: 0.75,
      style: "技术流 + 反击",
      starPlayer: "利昂内尔·梅西 / 胡利安·阿尔瓦雷斯",
      recentForm: ["W","W","W","W","D"]
    },
    "France": {
      attack: 9.2, defense: 8.8, form: 9.0,
      worldcupWins: 2, worldcupFinals: 3,
      wc_goals_scored: 134, wc_goals_conceded: 67, wc_matches: 74,
      avgGoalsScored: 1.81, avgGoalsConceded: 0.91,
      style: "整体压迫 + 快速反击",
      starPlayer: "基利安·姆巴佩 / 奥雷连·朱阿梅尼",
      recentForm: ["W","W","D","W","W"]
    },
    "Spain": {
      attack: 8.7, defense: 8.5, form: 8.6,
      worldcupWins: 1, worldcupFinals: 1,
      wc_goals_scored: 118, wc_goals_conceded: 72, wc_matches: 75,
      avgGoalsScored: 1.57, avgGoalsConceded: 0.96,
      style: "Tiki-Taka 控球",
      starPlayer: "亚马尔 / 佩德里 / 莫拉塔",
      recentForm: ["D","W","W","W","D"]
    },
    "England": {
      attack: 8.5, defense: 8.0, form: 8.5,
      worldcupWins: 1, worldcupFinals: 1,
      wc_goals_scored: 112, wc_goals_conceded: 81, wc_matches: 72,
      avgGoalsScored: 1.56, avgGoalsConceded: 1.13,
      style: "高位压迫",
      starPlayer: "贝林厄姆 / 福登 / 沙卡",
      recentForm: ["W","D","W","W","W"]
    },
    "Brazil": {
      attack: 8.8, defense: 8.0, form: 8.0,
      worldcupWins: 5, worldcupFinals: 7,
      wc_goals_scored: 174, wc_goals_conceded: 94, wc_matches: 113,
      avgGoalsScored: 1.54, avgGoalsConceded: 0.83,
      style: "技术 + 速度",
      starPlayer: "维尼修斯 / 罗德里戈",
      recentForm: ["D","D","W","D","W"]
    },
    "Germany": {
      attack: 8.6, defense: 8.1, form: 8.8,
      worldcupWins: 4, worldcupFinals: 8,
      wc_goals_scored: 138, wc_goals_conceded: 93, wc_matches: 110,
      avgGoalsScored: 1.25, avgGoalsConceded: 0.85,
      style: "整体性 + 高强度",
      starPlayer: "穆西亚拉 / 维尔茨 / 基米希",
      recentForm: ["W","W","W","W","W"]
    },
    "Portugal": {
      attack: 8.6, defense: 7.8, form: 8.4,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 82, wc_goals_conceded: 59, wc_matches: 63,
      avgGoalsScored: 1.30, avgGoalsConceded: 0.94,
      style: "边路突破",
      starPlayer: "B费 / 贡萨洛·拉莫斯",
      recentForm: ["W","W","D","W","W"]
    },
    "Netherlands": {
      attack: 8.2, defense: 7.9, form: 7.8,
      worldcupWins: 0, worldcupFinals: 3,
      wc_goals_scored: 75, wc_goals_conceded: 47, wc_matches: 52,
      avgGoalsScored: 1.44, avgGoalsConceded: 0.90,
      style: "全攻全守",
      starPlayer: "荷兰范戴克 / 加克波 / 霍尔斯特",
      recentForm: ["D","D","W","W","D"]
    },
    "Morocco": {
      attack: 7.8, defense: 8.3, form: 8.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 24, wc_goals_conceded: 23, wc_matches: 24,
      avgGoalsScored: 1.00, avgGoalsConceded: 0.96,
      style: "低位防守 + 快速反击",
      starPlayer: "哈克米 / 恩-内斯里",
      recentForm: ["D","D","D","W","W"]
    },
    "Belgium": {
      attack: 8.0, defense: 7.9, form: 7.5,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 46, wc_goals_conceded: 33, wc_matches: 45,
      avgGoalsScored: 1.02, avgGoalsConceded: 0.73,
      style: "中场控制",
      starPlayer: "德布劳内 / 查韦斯",
      recentForm: ["D","W","D","L","W"]
    },
    "Japan": {
      attack: 7.6, defense: 7.4, form: 7.6,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 27, wc_goals_conceded: 26, wc_matches: 29,
      avgGoalsScored: 0.93, avgGoalsConceded: 0.90,
      style: "压迫 + 高强度",
      starPlayer: "久保建英 / 三笘薰 / 上田绮世",
      recentForm: ["D","D","W","L","W"]
    },
    "Croatia": {
      attack: 7.8, defense: 7.9, form: 7.5,
      worldcupWins: 0, worldcupFinals: 2,
      wc_goals_scored: 64, wc_goals_conceded: 45, wc_matches: 52,
      avgGoalsScored: 1.23, avgGoalsConceded: 0.87,
      style: "中场主导",
      starPlayer: "莫德里奇 / 科瓦契奇",
      recentForm: ["D","W","D","W","L"]
    },
    "Uruguay": {
      attack: 7.7, defense: 7.8, form: 7.6,
      worldcupWins: 2, worldcupFinals: 2,
      wc_goals_scored: 110, wc_goals_conceded: 66, wc_matches: 64,
      avgGoalsScored: 1.72, avgGoalsConceded: 1.03,
      style: "防守反击",
      starPlayer: "达尔文·努涅斯 / 费德里科·巴尔维德",
      recentForm: ["W","D","W","W","D"]
    },
    "Colombia": {
      attack: 7.9, defense: 7.5, form: 7.7,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 37, wc_goals_conceded: 28, wc_matches: 31,
      avgGoalsScored: 1.19, avgGoalsConceded: 0.90,
      style: "进攻足球",
      starPlayer: "詹姆斯·罗德里格斯 / 博格巴",
      recentForm: ["W","W","W","D","W"]
    },
    "USA": {
      attack: 7.5, defense: 7.3, form: 7.5,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 36, wc_goals_conceded: 32, wc_matches: 35,
      avgGoalsScored: 1.03, avgGoalsConceded: 0.91,
      style: "高体能压迫",
      starPlayer: "克里斯蒂安·普利西奇 / 福森",
      recentForm: ["W","W","D","W","W"]
    },
    "Mexico": {
      attack: 7.8, defense: 7.4, form: 8.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 68, wc_goals_conceded: 90, wc_matches: 62,
      avgGoalsScored: 1.10, avgGoalsConceded: 1.45,
      style: "整体型足球",
      starPlayer: "赫苏斯·科罗纳",
      recentForm: ["W","W","D","W","W"]
    },
    "Senegal": {
      attack: 7.5, defense: 7.6, form: 7.6,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 9, wc_goals_conceded: 8, wc_matches: 8,
      avgGoalsScored: 1.13, avgGoalsConceded: 1.00,
      style: "快速进攻",
      starPlayer: "萨迪奥·马内",
      recentForm: ["W","D","W","W","D"]
    },
    "Switzerland": {
      attack: 7.6, defense: 7.8, form: 7.8,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 57, wc_goals_conceded: 67, wc_matches: 52,
      avgGoalsScored: 1.10, avgGoalsConceded: 1.29,
      style: "整体防守",
      starPlayer: "格拉尼特·扎卡 / 舍尔",
      recentForm: ["W","D","W","W","W"]
    },
    "Ecuador": {
      attack: 7.3, defense: 7.1, form: 7.2,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 11, wc_goals_conceded: 10, wc_matches: 11,
      avgGoalsScored: 1.00, avgGoalsConceded: 0.91,
      style: "进攻足球",
      starPlayer: "恩纳·瓦伦西亚",
      recentForm: ["L","D","W","W","D"]
    },
    "Iran": {
      attack: 7.0, defense: 7.3, form: 7.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 17, wc_goals_conceded: 21, wc_matches: 19,
      avgGoalsScored: 0.89, avgGoalsConceded: 1.11,
      style: "低位防守",
      starPlayer: "阿兹蒙",
      recentForm: ["D","D","L","W","D"]
    },
    "Turkey": {
      attack: 7.4, defense: 7.1, form: 7.3,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 17, wc_goals_conceded: 9, wc_matches: 11,
      avgGoalsScored: 1.55, avgGoalsConceded: 0.82,
      style: "中场控制",
      starPlayer: "哈坎·恰尔汗奥卢 / 厄贝",
      recentForm: ["W","W","D","W","W"]
    },
    "Norway": {
      attack: 7.8, defense: 7.2, form: 7.8,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 10, wc_goals_conceded: 8, wc_matches: 9,
      avgGoalsScored: 1.11, avgGoalsConceded: 0.89,
      style: "直球快攻",
      starPlayer: "埃尔林·哈兰德",
      recentForm: ["W","W","W","W","D"]
    },
    "Austria": {
      attack: 7.5, defense: 7.3, form: 7.8,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 55, wc_goals_conceded: 41, wc_matches: 32,
      avgGoalsScored: 1.72, avgGoalsConceded: 1.28,
      style: "高压压迫",
      starPlayer: "马塞尔·萨比策",
      recentForm: ["W","W","W","D","D"]
    },
    "South Korea": {
      attack: 7.3, defense: 7.0, form: 7.2,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 43, wc_goals_conceded: 65, wc_matches: 39,
      avgGoalsScored: 1.10, avgGoalsConceded: 1.67,
      style: "快速反击",
      starPlayer: "孙兴慜",
      recentForm: ["W","L","D","W","D"]
    },
    "Australia": {
      attack: 6.9, defense: 7.1, form: 7.1,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 26, wc_goals_conceded: 31, wc_matches: 19,
      avgGoalsScored: 1.37, avgGoalsConceded: 1.63,
      style: "物理对抗",
      starPlayer: "马修·莱基 / 贝赫希",
      recentForm: ["W","D","W","D","W"]
    },
    "Canada": {
      attack: 7.8, defense: 7.5, form: 8.2,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 7, wc_goals_conceded: 1, wc_matches: 5,
      avgGoalsScored: 1.40, avgGoalsConceded: 0.20,
      style: "体能+组织",
      starPlayer: "阿尔方索·戴维斯",
      recentForm: ["W","D","W","W","W"]
    },
    "Scotland": {
      attack: 6.8, defense: 7.0, form: 6.9,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 23, wc_goals_conceded: 25, wc_matches: 23,
      avgGoalsScored: 1.00, avgGoalsConceded: 1.09,
      style: "物理施压",
      starPlayer: "安迪·罗伯逊",
      recentForm: ["W","D","L","W","D"]
    },
    "Egypt": {
      attack: 7.0, defense: 7.2, form: 7.1,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 16, wc_goals_conceded: 24, wc_matches: 16,
      avgGoalsScored: 1.00, avgGoalsConceded: 1.50,
      style: "防守反击",
      starPlayer: "穆罕默德·萨拉赫",
      recentForm: ["D","D","W","D","L"]
    },
    "Algeria": {
      attack: 7.1, defense: 6.9, form: 7.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 12, wc_goals_conceded: 22, wc_matches: 16,
      avgGoalsScored: 0.75, avgGoalsConceded: 1.38,
      style: "中场控制",
      starPlayer: "亚当·乌纳斯",
      recentForm: ["D","W","W","D","W"]
    },
    "Ivory Coast": {
      attack: 7.2, defense: 7.0, form: 7.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 7, wc_goals_conceded: 5, wc_matches: 9,
      avgGoalsScored: 0.78, avgGoalsConceded: 0.56,
      style: "快速边路",
      starPlayer: "塞巴斯蒂安·阿勒",
      recentForm: ["W","D","D","W","W"]
    },
    "Paraguay": {
      attack: 6.7, defense: 6.9, form: 6.5,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 44, wc_goals_conceded: 49, wc_matches: 41,
      avgGoalsScored: 1.07, avgGoalsConceded: 1.20,
      style: "防守反击",
      starPlayer: "古斯塔沃·戈麦斯",
      recentForm: ["L","D","W","D","L"]
    },
    "Saudi Arabia": {
      attack: 6.8, defense: 7.0, form: 7.1,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 12, wc_goals_conceded: 18, wc_matches: 16,
      avgGoalsScored: 0.75, avgGoalsConceded: 1.13,
      style: "防守反击",
      starPlayer: "费拉斯·阿尔布雷坎",
      recentForm: ["D","D","W","L","D"]
    },
    "Tunisia": {
      attack: 6.5, defense: 6.8, form: 6.5,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 16, wc_goals_conceded: 32, wc_matches: 25,
      avgGoalsScored: 0.64, avgGoalsConceded: 1.28,
      style: "低位防守",
      starPlayer: "哈尼·阿巴斯",
      recentForm: ["D","L","W","D","L"]
    },
    "Ghana": {
      attack: 6.6, defense: 6.5, form: 6.6,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 11, wc_goals_conceded: 13, wc_matches: 12,
      avgGoalsScored: 0.92, avgGoalsConceded: 1.08,
      style: "速度突击",
      starPlayer: "莫哈末·库杜斯",
      recentForm: ["W","D","L","W","D"]
    },
    "Panama": {
      attack: 6.4, defense: 6.7, form: 6.5,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 2, wc_goals_conceded: 11, wc_matches: 3,
      avgGoalsScored: 0.67, avgGoalsConceded: 3.67,
      style: "低位防守",
      starPlayer: "奥马尔·普尔",
      recentForm: ["D","D","W","D","L"]
    },
    "New Zealand": {
      attack: 6.0, defense: 6.3, form: 6.2,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 8, wc_goals_conceded: 20, wc_matches: 13,
      avgGoalsScored: 0.62, avgGoalsConceded: 1.54,
      style: "物理对抗",
      starPlayer: "克里斯·伍德",
      recentForm: ["D","L","D","W","D"]
    },
    "Czech Republic": {
      attack: 6.7, defense: 6.9, form: 6.6,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 28, wc_goals_conceded: 27, wc_matches: 23,
      avgGoalsScored: 1.22, avgGoalsConceded: 1.17,
      style: "中路配合",
      starPlayer: "帕特里克·施克",
      recentForm: ["L","L","D","W","D"]
    },
    "Bosnia": {
      attack: 6.5, defense: 6.3, form: 6.2,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 5, wc_goals_conceded: 8, wc_matches: 4,
      avgGoalsScored: 1.25, avgGoalsConceded: 2.00,
      style: "大中锋战术",
      starPlayer: "朱拉诺维奇",
      recentForm: ["D","L","D","W","L"]
    },
    "DR Congo": {
      attack: 6.6, defense: 6.4, form: 6.5,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 4, wc_goals_conceded: 9, wc_matches: 6,
      avgGoalsScored: 0.67, avgGoalsConceded: 1.50,
      style: "快速边路",
      starPlayer: "布鲁斯·宗达",
      recentForm: ["W","D","D","L","W"]
    },
    "Qatar": {
      attack: 6.0, defense: 6.0, form: 5.8,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 1, wc_goals_conceded: 13, wc_matches: 4,
      avgGoalsScored: 0.25, avgGoalsConceded: 3.25,
      style: "中场传控",
      starPlayer: "阿克拉姆·阿费夫",
      recentForm: ["L","D","L","L","D"]
    },
    "Iraq": {
      attack: 6.3, defense: 5.9, form: 6.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 5, wc_goals_conceded: 14, wc_matches: 7,
      avgGoalsScored: 0.71, avgGoalsConceded: 2.00,
      style: "防守反击",
      starPlayer: "莫赫纳德·阿里",
      recentForm: ["L","W","D","L","D"]
    },
    "Jordan": {
      attack: 6.2, defense: 6.0, form: 6.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 1, wc_goals_conceded: 3, wc_matches: 1,
      avgGoalsScored: 1.0, avgGoalsConceded: 3.0,
      style: "防守组织",
      starPlayer: "亚塞尔·阿罗斯",
      recentForm: ["L","D","D","W","D"]
    },
    "Cape Verde": {
      attack: 6.4, defense: 7.0, form: 7.0,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 0, wc_goals_conceded: 0, wc_matches: 1,
      avgGoalsScored: 0.00, avgGoalsConceded: 0.00,
      style: "低位防守",
      starPlayer: "弗雷德里科·巴西",
      recentForm: ["D","D","D","L","W"]
    },
    "South Africa": {
      attack: 6.2, defense: 6.3, form: 6.2,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 7, wc_goals_conceded: 16, wc_matches: 8,
      avgGoalsScored: 0.88, avgGoalsConceded: 2.00,
      style: "物理对抗",
      starPlayer: "斯图·本特利",
      recentForm: ["L","D","L","D","D"]
    },
    "Haiti": {
      attack: 5.8, defense: 5.9, form: 5.8,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 2, wc_goals_conceded: 14, wc_matches: 3,
      avgGoalsScored: 0.67, avgGoalsConceded: 4.67,
      style: "防守组织",
      starPlayer: "奥利维尔·纳米加尼",
      recentForm: ["L","D","L","D","L"]
    },
    "Curacao": {
      attack: 5.5, defense: 5.6, form: 5.5,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 0, wc_goals_conceded: 0, wc_matches: 0,
      avgGoalsScored: 0.60, avgGoalsConceded: 1.20,
      style: "防守足球",
      starPlayer: "利维·贾西",
      recentForm: ["L","D","L","L","D"]
    },
    "Uzbekistan": {
      attack: 6.2, defense: 6.2, form: 6.2,
      worldcupWins: 0, worldcupFinals: 0,
      wc_goals_scored: 0, wc_goals_conceded: 0, wc_matches: 0,
      avgGoalsScored: 1.30, avgGoalsConceded: 0.90,
      style: "中路配合",
      starPlayer: "贾苏尔·雅肖多",
      recentForm: ["W","D","W","L","W"]
    }
  },

  // ── Historical Head-to-Head World Cup Data ──
  // Key format: "TeamA|TeamB" (alphabetical order)
  h2h: {
    "Argentina|France":     { p:3, aw:2, d:1, lw:0 },
    "Argentina|Germany":    { p:6, aw:4, d:0, lw:2 },
    "Argentina|England":    { p:5, aw:3, d:1, lw:1 },
    "Argentina|Brazil":     { p:8, aw:5, d:1, lw:2 },
    "Argentina|Netherlands":{ p:5, aw:3, d:0, lw:2 },
    "Argentina|Croatia":    { p:2, aw:2, d:0, lw:0 },
    "Brazil|France":        { p:3, aw:2, d:0, lw:1 },
    "Brazil|Germany":       { p:8, aw:4, d:1, lw:3 },
    "Brazil|Netherlands":   { p:5, aw:2, d:1, lw:2 },
    "Brazil|England":       { p:5, aw:3, d:1, lw:1 },
    "France|Germany":       { p:7, aw:3, d:2, lw:2 },
    "England|Germany":      { p:6, aw:2, d:1, lw:3 },
    "Spain|Germany":        { p:6, aw:3, d:0, lw:3 },
    "Spain|France":         { p:4, aw:2, d:1, lw:1 },
    "Spain|England":        { p:3, aw:1, d:1, lw:1 },
    "Germany|Netherlands":  { p:7, aw:3, d:1, lw:3 },
    "Croatia|France":       { p:2, aw:0, d:0, lw:2 },
    "Netherlands|France":   { p:4, aw:1, d:0, lw:3 },
    "England|France":       { p:3, aw:1, d:1, lw:1 },
    "Japan|Germany":        { p:1, aw:1, d:0, lw:0 },
    "England|Netherlands":  { p:4, aw:2, d:0, lw:2 },
    "Portugal|France":      { p:4, aw:1, d:0, lw:3 },
    "Portugal|Morocco":     { p:2, aw:2, d:0, lw:0 },
    "Morocco|France":       { p:2, aw:0, d:1, lw:1 },
  },

  // ── Team Details: 大名单身价 · 伤停 · 世界杯分析 · 历史对战 ──
  teamDetails: {
    "Argentina": {
      totalValue: "€8.65亿",
      squad: [
        { name:"马丁内斯", pos:"GK", club:"阿斯顿维拉", val:"2500万" },
        { name:"莫利纳", pos:"RB", club:"马德里竞技", val:"3000万" },
        { name:"罗梅罗", pos:"CB", club:"热刺", val:"5500万" },
        { name:"奥塔门迪", pos:"CB", club:"本菲卡", val:"400万" },
        { name:"塔利亚菲科", pos:"LB", club:"里昂", val:"500万" },
        { name:"恩佐·费尔南德斯", pos:"CM", club:"切尔西", val:"7500万" },
        { name:"德保罗", pos:"CM", club:"马德里竞技", val:"3500万" },
        { name:"麦卡利斯特", pos:"CM", club:"利物浦", val:"7000万" },
        { name:"梅西", pos:"RW", club:"迈阿密国际", val:"3000万" },
        { name:"阿尔瓦雷斯", pos:"ST", club:"马德里竞技", val:"9000万" },
        { name:"劳塔罗", pos:"ST", club:"国际米兰", val:"1.1亿" }
      ],
      injuries: [
        { name:"迪巴拉", type:"肌肉拉伤", status:"缺席小组赛" },
        { name:"洛塞尔索", type:"膝盖", status:"恢复中" }
      ],
      analysis: "阿根廷作为卫冕冠军，阵容深度极强。梅西虽年届38岁仍是精神领袖，阿尔瓦雷斯和劳塔罗组成双箭头攻击力恐怖。恩佐+德保罗+麦卡利斯特的中场铁三角在2022世界杯已证明实力。后防线罗梅罗领衔稳健，马丁内斯门线技术顶级。小组赛出线无忧，但淘汰赛体能和梅西的伤病是隐患。",
      history: { matches:88, wins:48, draws:16, losses:24, gf:145, ga:67, bestResult:"冠军(1978/1986/2022)", finalAppearances:6 }
    },
    "France": {
      totalValue: "€10.2亿",
      squad: [
        { name:"迈尼昂", pos:"GK", club:"AC米兰", val:"4000万" },
        { name:"孔德", pos:"RB", club:"巴塞罗那", val:"5500万" },
        { name:"萨利巴", pos:"CB", club:"阿森纳", val:"8000万" },
        { name:"于帕梅卡诺", pos:"CB", club:"拜仁慕尼黑", val:"5000万" },
        { name:"特奥", pos:"LB", club:"AC米兰", val:"5500万" },
        { name:"朱阿梅尼", pos:"CM", club:"皇家马德里", val:"1亿" },
        { name:"卡马文加", pos:"CM", club:"皇家马德里", val:"8000万" },
        { name:"格列兹曼", pos:"AM", club:"马德里竞技", val:"2500万" },
        { name:"姆巴佩", pos:"LW", club:"皇家马德里", val:"1.8亿" },
        { name:"登贝莱", pos:"RW", club:"巴黎圣日耳曼", val:"6000万" },
        { name:"图拉姆", pos:"ST", club:"国际米兰", val:"7000万" }
      ],
      injuries: [
        { name:"坎特", type:"肌肉疲劳", status:"出战成疑" }
      ],
      analysis: "法国队拥有本届世界杯最豪华阵容之一。姆巴佩正值巅峰，萨利巴+于帕梅卡诺的防线组合稳固，朱阿梅尼和卡马文加的中场活力四射。德尚执教多年体系成熟，大赛经验丰富。但内部矛盾和更衣室问题时有发生，是需要注意的风险点。整体实力有望再度冲击决赛。",
      history: { matches:73, wins:40, draws:12, losses:21, gf:131, ga:66, bestResult:"冠军(1998/2018)", finalAppearances:3 }
    },
    "Spain": {
      totalValue: "€9.1亿",
      squad: [
        { name:"西蒙", pos:"GK", club:"毕尔巴鄂", val:"3000万" },
        { name:"卡瓦哈尔", pos:"RB", club:"皇家马德里", val:"4000万" },
        { name:"拉波尔特", pos:"CB", club:"利雅得胜利", val:"1500万" },
        { name:"勒诺尔芒", pos:"CB", club:"皇家社会", val:"4000万" },
        { name:"格里马尔多", pos:"LB", club:"勒沃库森", val:"4500万" },
        { name:"罗德里", pos:"CM", club:"曼城", val:"1.3亿" },
        { name:"佩德里", pos:"CM", club:"巴塞罗那", val:"1亿" },
        { name:"亚马尔", pos:"RW", club:"巴塞罗那", val:"1.5亿" },
        { name:"尼科·威廉姆斯", pos:"LW", club:"毕尔巴鄂", val:"7000万" },
        { name:"莫拉塔", pos:"ST", club:"AC米兰", val:"1000万" },
        { name:"奥尔莫", pos:"AM", club:"巴塞罗那", val:"6000万" }
      ],
      injuries: [],
      analysis: "西班牙新一代黄金一代崛起，亚马尔以16岁之龄成为世界级边锋令人惊叹。佩德里+罗德里组成世界最强中场，控球率碾压多数对手。德拉富恩特执教后不再死板传控，加入直塞和边路突破，进攻效率大增。唯一的短板是中锋位置缺少顶级射手，莫拉塔大赛发挥不稳定。整体实力足以争冠。",
      history: { matches:74, wins:35, draws:15, losses:24, gf:118, ga:72, bestResult:"冠军(2010)", finalAppearances:1 }
    },
    "England": {
      totalValue: "€9.5亿",
      squad: [
        { name:"皮克福德", pos:"GK", club:"埃弗顿", val:"2500万" },
        { name:"沃克", pos:"RB", club:"曼城", val:"1500万" },
        { name:"斯通斯", pos:"CB", club:"曼城", val:"3500万" },
        { name:"格伊", pos:"CB", club:"水晶宫", val:"4500万" },
        { name:"奇尔韦尔", pos:"LB", club:"切尔西", val:"2500万" },
        { name:"赖斯", pos:"CM", club:"阿森纳", val:"1.2亿" },
        { name:"贝林厄姆", pos:"AM", club:"皇家马德里", val:"1.8亿" },
        { name:"福登", pos:"LW", club:"曼城", val:"1.3亿" },
        { name:"沙卡", pos:"RW", club:"阿森纳", val:"1.2亿" },
        { name:"凯恩", pos:"ST", club:"拜仁慕尼黑", val:"9000万" },
        { name:"帕尔默", pos:"AM", club:"切尔西", val:"9000万" }
      ],
      injuries: [
        { name:"卢克·肖", type:"腿筋", status:"小组赛末轮复出" }
      ],
      analysis: "英格兰拥有最贵阵容之一，凯恩+贝林厄姆+福登+沙卡的攻击线堪称世界顶级。赖斯独撑防守中场，帕尔默是超级替补。索斯盖特离任后新帅体系尚未完全磨合，但球员个人能力足以弥补战术不足。大赛心理素质仍是最大障碍，多次在关键比赛掉链子。如果突破心理瓶颈，冠军并非遥不可及。",
      history: { matches:72, wins:32, draws:15, losses:25, gf:112, ga:81, bestResult:"冠军(1966)", finalAppearances:1 }
    },
    "Brazil": {
      totalValue: "€8.8亿",
      squad: [
        { name:"阿利松", pos:"GK", club:"利物浦", val:"3500万" },
        { name:"达尼洛", pos:"RB", club:"尤文图斯", val:"800万" },
        { name:"马尔基尼奥斯", pos:"CB", club:"巴黎圣日耳曼", val:"4000万" },
        { name:"加布里埃尔", pos:"CB", club:"阿森纳", val:"7000万" },
        { name:"特莱斯", pos:"LB", club:"利雅得胜利", val:"500万" },
        { name:"吉马良斯", pos:"CM", club:"纽卡斯尔", val:"8500万" },
        { name:"帕奎塔", pos:"CM", club:"西汉姆", val:"4500万" },
        { name:"维尼修斯", pos:"LW", club:"皇家马德里", val:"2亿" },
        { name:"罗德里戈", pos:"RW", club:"皇家马德里", val:"1.1亿" },
        { name:"理查利森", pos:"ST", club:"热刺", val:"3000万" },
        { name:"恩德里克", pos:"ST", club:"皇家马德里", val:"6000万" }
      ],
      injuries: [
        { name:"内马尔", type:"膝盖十字韧带", status:"缺席世界杯" }
      ],
      analysis: "巴西队维尼修斯正值巅峰是世界前三球员，罗德里戈搭档皇马连线默契。但内马尔重伤缺席对进攻创造力是重大打击。中场吉马良斯表现稳定但整体控制力不足，后防线老化是隐忧。九号位问题突出，理查利森状态起伏大，恩德里克尚年轻。五冠底蕴仍在但需解决战术执行问题。",
      history: { matches:112, wins:72, draws:16, losses:24, gf:173, ga:93, bestResult:"冠军(5次)", finalAppearances:7 }
    },
    "Germany": {
      totalValue: "€7.6亿",
      squad: [
        { name:"诺伊尔", pos:"GK", club:"拜仁慕尼黑", val:"500万" },
        { name:"基米希", pos:"RB", club:"拜仁慕尼黑", val:"5000万" },
        { name:"吕迪格", pos:"CB", club:"皇家马德里", val:"4000万" },
        { name:"塔", pos:"CB", club:"勒沃库森", val:"3000万" },
        { name:"米特尔施泰特", pos:"LB", club:"斯图加特", val:"2500万" },
        { name:"维尔茨", pos:"AM", club:"勒沃库森", val:"1.3亿" },
        { name:"穆西亚拉", pos:"AM", club:"拜仁慕尼黑", val:"1.3亿" },
        { name:"克罗斯", pos:"CM", club:"皇家马德里(已退役)", val:"-" },
        { name:"格纳布里", pos:"RW", club:"拜仁慕尼黑", val:"3000万" },
        { name:"哈弗茨", pos:"ST", club:"阿森纳", val:"5500万" },
        { name:"菲尔克鲁格", pos:"ST", club:"西汉姆", val:"1000万" }
      ],
      injuries: [],
      analysis: "德国队在纳格尔斯曼执教下重焕生机。穆西亚拉+维尔茨双子星是本届赛事最值得期待的新生代组合，技术能力和创造力冠绝欧洲。克罗斯退役后中场控制力有所下降，基米希需承担更多组织责任。哈弗茨中锋位置发挥稳定。小组赛首场7-1大胜库拉索展示了恐怖火力。四星底蕴+新生代冲击力=争冠热门。",
      history: { matches:109, wins:62, draws:20, losses:27, gf:131, ga:92, bestResult:"冠军(4次)", finalAppearances:8 }
    },
    "Portugal": {
      totalValue: "€7.8亿",
      squad: [
        { name:"迪奥戈·科斯塔", pos:"GK", club:"波尔图", val:"4000万" },
        { name:"坎塞洛", pos:"RB", club:"巴塞罗那", val:"2500万" },
        { name:"鲁本·迪亚斯", pos:"CB", club:"曼城", val:"7500万" },
        { name:"伊纳西奥", pos:"CB", club:"里斯本竞技", val:"4500万" },
        { name:"门德斯", pos:"LB", club:"巴黎圣日耳曼", val:"4000万" },
        { name:"布鲁诺·费尔南德斯", pos:"AM", club:"曼联", val:"6000万" },
        { name:"伯纳多·席尔瓦", pos:"CM", club:"曼城", val:"5000万" },
        { name:"维蒂尼亚", pos:"CM", club:"巴黎圣日耳曼", val:"5500万" },
        { name:"莱奥", pos:"LW", club:"AC米兰", val:"7500万" },
        { name:"贡萨洛·拉莫斯", pos:"ST", club:"巴黎圣日耳曼", val:"4000万" },
        { name:"菲利克斯", pos:"RW", club:"切尔西", val:"3500万" }
      ],
      injuries: [],
      analysis: "后C罗时代的葡萄牙更加均衡，B费+B席的中场控制力世界级，莱奥在左路的突破能力是关键武器。鲁本·迪亚斯领衔后防稳固。但中锋位置始终缺乏稳定输出，贡萨洛·拉莫斯大赛经验不足。如果前场能够高效转化机会，葡萄牙有实力走到最后四强。",
      history: { matches:63, wins:27, draws:10, losses:26, gf:82, ga:59, bestResult:"四强(2006/2022)", finalAppearances:0 }
    },
    "Netherlands": {
      totalValue: "€5.8亿",
      squad: [
        { name:"维尔布鲁根", pos:"GK", club:"布莱顿", val:"2500万" },
        { name:"弗林蓬", pos:"RB", club:"勒沃库森", val:"5000万" },
        { name:"范戴克", pos:"CB", club:"利物浦", val:"4000万" },
        { name:"阿克", pos:"CB", club:"曼城", val:"3000万" },
        { name:"哈特波尔", pos:"LB", club:"亚特兰大", val:"1500万" },
        { name:"斯豪滕", pos:"CM", club:"埃因霍温", val:"2000万" },
        { name:"赖因德斯", pos:"CM", club:"AC米兰", val:"5000万" },
        { name:"加克波", pos:"LW", club:"利物浦", val:"6000万" },
        { name:"西蒙斯", pos:"AM", club:"RB莱比锡", val:"8000万" },
        { name:"德佩", pos:"ST", club:"科林蒂安", val:"500万" },
        { name:"韦格霍斯特", pos:"ST", club:"阿贾克斯", val:"300万" }
      ],
      injuries: [],
      analysis: "荷兰队范戴克仍是最稳定中卫，加克波和西蒙斯提供进攻火力。但首场2-2战平日本暴露了防守漏洞。全攻全守传统仍在但需要更紧凑的防守组织。德佩离开欧洲后状态成疑，中锋位置依然是软肋。科曼回归执教后战术偏向务实，淘汰赛实力不容小觑。",
      history: { matches:51, wins:23, draws:12, losses:16, gf:73, ga:45, bestResult:"亚军(3次)", finalAppearances:3 }
    },
    "Morocco": {
      totalValue: "€3.2亿",
      squad: [
        { name:"布努", pos:"GK", club:"利雅得新月", val:"1500万" },
        { name:"哈基米", pos:"RB", club:"巴黎圣日耳曼", val:"6000万" },
        { name:"赛斯", pos:"CB", club:"加拉法", val:"200万" },
        { name:"阿格尔德", pos:"CB", club:"西汉姆", val:"2000万" },
        { name:"马兹拉维", pos:"LB", club:"曼联", val:"2000万" },
        { name:"阿姆拉巴特", pos:"CM", club:"费内巴切", val:"1200万" },
        { name:"欧纳希", pos:"CM", club:"马赛", val:"1500万" },
        { name:"齐耶赫", pos:"RW", club:"加拉塔萨雷", val:"600万" },
        { name:"布法尔", pos:"LW", club:"卡塔尔SC", val:"300万" },
        { name:"恩-内斯里", pos:"ST", club:"费内巴切", val:"2000万" },
        { name:"阿布赫拉尔", pos:"AM", club:"尼斯", val:"1500万" }
      ],
      injuries: [],
      analysis: "摩洛哥2022世界杯创造非洲球队历史最佳战绩(四强)，本届阵容更成熟。哈基米是世界前三右后卫，马兹拉维+阿格尔德防线稳固。首场1-1战平巴西证明实力。阿姆拉巴特独挡中场，齐耶赫创造力仍是关键。进攻端依赖恩-内斯里头球，地面进攻手段稍显单一。有望再次创造惊喜。",
      history: { matches:23, wins:7, draws:7, losses:9, gf:23, ga:22, bestResult:"四强(2022)", finalAppearances:0 }
    },
    "Belgium": {
      totalValue: "€4.5亿",
      squad: [
        { name:"库尔图瓦", pos:"GK", club:"皇家马德里", val:"2500万" },
        { name:"卡斯塔涅", pos:"RB", club:"富勒姆", val:"1800万" },
        { name:"费斯", pos:"CB", club:"莱斯特城", val:"2000万" },
        { name:"德巴斯特", pos:"CB", club:"里斯本竞技", val:"2500万" },
        { name:"泰特", pos:"LB", club:"雷恩", val:"1200万" },
        { name:"德布劳内", pos:"AM", club:"曼城", val:"5000万" },
        { name:"奥纳纳", pos:"CM", club:"阿斯顿维拉", val:"4500万" },
        { name:"特罗萨德", pos:"LW", club:"阿森纳", val:"3000万" },
        { name:"多库", pos:"RW", club:"曼城", val:"4000万" },
        { name:"卢卡库", pos:"ST", club:"那不勒斯", val:"2000万" },
        { name:"巴舒亚伊", pos:"ST", club:"加拉塔萨雷", val:"400万" }
      ],
      injuries: [],
      analysis: "比利时黄金一代进入尾声，德布劳内仍是世界最佳组织核心之一，但队友老化严重。卢卡库在大赛中的把握能力始终是双刃剑。多库提供边路活力，奥纳纳是中场新支柱。库尔图瓦伤愈回归稳固门将位置。小组出线问题不大，但淘汰赛面对强队恐力不从心。",
      history: { matches:44, wins:20, draws:10, losses:14, gf:45, ga:32, bestResult:"季军(2018)", finalAppearances:0 }
    },
    "Japan": {
      totalValue: "€2.8亿",
      squad: [
        { name:"铃木彩艳", pos:"GK", club:"帕尔马", val:"1000万" },
        { name:"酒井宏树", pos:"RB", club:"大阪樱花", val:"200万" },
        { name:"板仓滉", pos:"CB", club:"门兴", val:"1200万" },
        { name:"谷口彰悟", pos:"CB", club:"圣图尔登", val:"500万" },
        { name:"长友佑都", pos:"LB", club:"FC东京", val:"100万" },
        { name:"远藤航", pos:"CM", club:"利物浦", val:"2000万" },
        { name:"守田英正", pos:"CM", club:"里斯本竞技", val:"1500万" },
        { name:"久保建英", pos:"RW", club:"皇家社会", val:"4000万" },
        { name:"三笘薰", pos:"LW", club:"布莱顿", val:"4500万" },
        { name:"上田绮世", pos:"ST", club:"费耶诺德", val:"1500万" },
        { name:"南野拓实", pos:"AM", club:"摩纳哥", val:"1200万" }
      ],
      injuries: [],
      analysis: "日本队首场2-2战平荷兰展示了极强竞争力。三笘薰和久保建英的双翼齐飞是最大武器，远藤航在中场的拦截能力世界级。高位压迫+快速转换是森保一的招牌战术。但中锋位置缺乏顶级射手，面对低位防守时攻坚战能力不足。小组出线后有望再度在淘汰赛制造冷门。",
      history: { matches:28, wins:8, draws:7, losses:13, gf:25, ga:24, bestResult:"16强(4次)", finalAppearances:0 }
    },
    "Croatia": {
      totalValue: "€2.9亿",
      squad: [
        { name:"利瓦科维奇", pos:"GK", club:"费内巴切", val:"1500万" },
        { name:"斯坦尼西奇", pos:"RB", club:"拜仁慕尼黑", val:"1500万" },
        { name:"格瓦迪奥尔", pos:"CB", club:"曼城", val:"7000万" },
        { name:"庞格拉契奇", pos:"CB", club:"佛罗伦萨", val:"1200万" },
        { name:"索萨", pos:"LB", club:"阿贾克斯", val:"1000万" },
        { name:"莫德里奇", pos:"CM", club:"皇家马德里", val:"800万" },
        { name:"科瓦契奇", pos:"CM", club:"曼城", val:"2000万" },
        { name:"布罗佐维奇", pos:"CM", club:"利雅得胜利", val:"600万" },
        { name:"克拉马里奇", pos:"RW", club:"霍芬海姆", val:"500万" },
        { name:"佩里西奇", pos:"LW", club:"哈伊杜克", val:"200万" },
        { name:"布迪米尔", pos:"ST", club:"奥萨苏纳", val:"800万" }
      ],
      injuries: [],
      analysis: "克罗地亚铁血中场莫德里奇40岁仍在征战，格瓦迪奥尔是世界顶级中卫。但阵容老化明显，新生代球员水平与黄金一代差距较大。中场控制力仍在但体能问题突出，淘汰赛若拖入点球大战则有优势。小组出线后上限有限，八强可能已是极限。",
      history: { matches:52, wins:22, draws:12, losses:18, gf:64, ga:45, bestResult:"亚军(2018/2022)", finalAppearances:2 }
    },
    "Uruguay": {
      totalValue: "€4.1亿",
      squad: [
        { name:"罗切特", pos:"GK", club:"弗拉门戈", val:"500万" },
        { name:"南德斯", pos:"RB", club:"加拉塔萨雷", val:"800万" },
        { name:"阿劳霍", pos:"CB", club:"巴塞罗那", val:"5000万" },
        { name:"希门尼斯", pos:"CB", club:"马德里竞技", val:"2000万" },
        { name:"奥利维拉", pos:"LB", club:"吉达联合", val:"500万" },
        { name:"巴尔维德", pos:"CM", club:"皇家马德里", val:"1.2亿" },
        { name:"本坦库尔", pos:"CM", club:"热刺", val:"2000万" },
        { name:"乌加特", pos:"CM", club:"曼联", val:"5000万" },
        { name:"努涅斯", pos:"ST", club:"利物浦", val:"7000万" },
        { name:"苏亚雷斯", pos:"ST", club:"迈阿密国际", val:"200万" },
        { name:"佩利斯特里", pos:"RW", club:"帕纳辛奈科斯", val:"500万" }
      ],
      injuries: [],
      analysis: "乌拉圭拥有巴尔维德+努涅斯的世界级中轴线。巴尔维德覆盖全场的能力是攻防转换枢纽，努涅斯速度和冲击力是反击利器。阿劳霍后防稳健。但创造力不足，缺少顶级组织中场。苏亚雷斯老去后锋线依赖努涅斯一人，如果他被限制则进攻效率大幅下降。",
      history: { matches:64, wins:29, draws:12, losses:23, gf:110, ga:66, bestResult:"冠军(1930/1950)", finalAppearances:2 }
    },
    "Colombia": {
      totalValue: "€3.5亿",
      squad: [
        { name:"巴尔加斯", pos:"GK", club:"格雷米奥", val:"300万" },
        { name:"穆尼奥斯", pos:"RB", club:"水晶宫", val:"2000万" },
        { name:"达文森·桑切斯", pos:"CB", club:"加拉塔萨雷", val:"800万" },
        { name:"米纳", pos:"CB", club:"卡利亚里", val:"300万" },
        { name:"莫西卡", pos:"LB", club:"比利亚雷亚尔", val:"600万" },
        { name:"莱尔马", pos:"CM", club:"水晶宫", val:"1200万" },
        { name:"巴里奥斯", pos:"CM", club:"莫斯科火车头", val:"600万" },
        { name:"J罗", pos:"AM", club:"巴兰蒂亚", val:"300万" },
        { name:"路易斯·迪亚斯", pos:"LW", club:"利物浦", val:"7500万" },
        { name:"博尔哈", pos:"ST", club:"格雷米奥", val:"400万" },
        { name:"昆特罗", pos:"RW", club:"阿梅利亚", val:"300万" }
      ],
      injuries: [],
      analysis: "哥伦比亚队路易斯·迪亚斯是绝对核心，速度和突破能力世界级。J罗虽离开欧洲但国家队仍是精神领袖。整体阵容深度不足，中场控制力偏弱。如果迪亚斯被限制则进攻威胁大减。小组出线后有望冲击八强但上限有限。",
      history: { matches:31, wins:12, draws:8, losses:11, gf:37, ga:28, bestResult:"八强(2014)", finalAppearances:0 }
    },
    "USA": {
      totalValue: "€3.8亿",
      squad: [
        { name:"特纳", pos:"GK", club:"水晶宫", val:"600万" },
        { name:"德斯特", pos:"RB", club:"埃因霍温", val:"1200万" },
        { name:"理查兹", pos:"CB", club:"水晶宫", val:"2500万" },
        { name:"迈尔斯·罗宾逊", pos:"CB", club:"辛辛那提", val:"500万" },
        { name:"罗宾逊", pos:"LB", club:"富勒姆", val:"1000万" },
        { name:"麦肯尼", pos:"CM", club:"尤文图斯", val:"2000万" },
        { name:"穆萨", pos:"CM", club:"AC米兰", val:"2000万" },
        { name:"普利西奇", pos:"LW", club:"AC米兰", val:"4000万" },
        { name:"雷纳", pos:"AM", club:"多特蒙德", val:"1500万" },
        { name:"巴洛贡", pos:"ST", club:"摩纳哥", val:"2500万" },
        { name:"维阿", pos:"RW", club:"马赛", val:"1200万" }
      ],
      injuries: [],
      analysis: "东道主美国队首场4-1大胜巴拉圭展现强势。普利西奇是绝对核心，穆萨和麦肯尼中场活力十足。主场作战是巨大优势。巴洛贡中锋位置需要更多贡献。整体实力在二流强队水平，借助主场之利有望冲击八强甚至四强。",
      history: { matches:35, wins:13, draws:8, losses:14, gf:36, ga:32, bestResult:"季军(1930)", finalAppearances:0 }
    },
    "Mexico": {
      totalValue: "€2.2亿",
      squad: [
        { name:"奥乔亚", pos:"GK", club:"萨莱诺", val:"100万" },
        { name:"豪尔赫·桑切斯", pos:"RB", club:"阿贾克斯", val:"600万" },
        { name:"蒙特斯", pos:"CB", club:"蓝十字", val:"400万" },
        { name:"阿劳霍", pos:"CB", club:"美洲", val:"500万" },
        { name:"加利亚多", pos:"LB", club:"瓜达拉哈拉", val:"300万" },
        { name:"埃雷拉", pos:"CM", club:"休斯顿迪纳摩", val:"200万" },
        { name:"阿尔瓦雷斯", pos:"CM", club:"西汉姆", val:"2500万" },
        { name:"科罗纳", pos:"RW", club:"蓝十字", val:"300万" },
        { name:"洛萨诺", pos:"LW", club:"埃因霍温", val:"1200万" },
        { name:"希门尼斯", pos:"ST", club:"富勒姆", val:"1500万" },
        { name:"安图尼亚", pos:"AM", club:"萨莱诺", val:"200万" }
      ],
      injuries: [],
      analysis: "墨西哥首场2-0战胜南非开局不错，阿尔瓦雷斯是中场核心。洛萨诺速度是反击利器，希门尼斯在英超证明过自己。但整体阵容以墨超联赛为主，与欧洲强队存在差距。小组出线是首要目标，淘汰赛一步一个脚印。",
      history: { matches:60, wins:16, draws:15, losses:29, gf:65, ga:89, bestResult:"八强(2次)", finalAppearances:0 }
    }
  },

  // ── 为其余球队生成简化详情 ──
  // 通过 _getTeamDetail 自动补全
  _simpleTeamDetails: {
    "Senegal": { totalValue:"€2.8亿", starPlayers:"马内、库利巴利、门迪", injuries:"无重大伤停", analysis:"塞内加尔非洲杯冠军底蕴，马内仍是进攻核心。库利巴利领衔后防经验丰富，门迪门线技术顶级。中场实力有所下降，整体属于二流强队水平。" },
    "Switzerland": { totalValue:"€2.5亿", starPlayers:"扎卡、舍尔、索默", injuries:"无重大伤停", analysis:"瑞士队以扎卡为中场核心，整体打法稳健。索默门将位置世界级，舍尔后防稳健。大赛淘汰赛经验丰富，多次在16强制造冷门。进攻创造力不足是短板。" },
    "Ecuador": { totalValue:"€1.5亿", starPlayers:"恩纳·瓦伦西亚、凯塞多", injuries:"无重大伤停", analysis:"厄瓜多尔高原主场优势不在，但凯塞多在中场的拦截能力出色。恩纳·瓦伦西亚是世界杯老将。整体实力在参赛队中偏下，小组出线已算成功。" },
    "Iran": { totalValue:"€1.2亿", starPlayers:"阿兹蒙、塔雷米", injuries:"塔雷米轻伤（出战成疑）", analysis:"伊朗队塔雷米和阿兹蒙组成锋线有威胁，但整体阵容深度不足。奎罗斯执教后防守组织严密，但进攻端过于依赖两人。小组出线难度大。" },
    "Turkey": { totalValue:"€2.3亿", starPlayers:"恰尔汗奥卢、厄拜", injuries:"无重大伤停", analysis:"土耳其恰尔汗奥卢的远射和组织是核心武器。首场0-2负澳大利亚暴露了防守问题。中场控制力尚可，但锋线终结能力不足。需要改善防守才有出线希望。" },
    "Norway": { totalValue:"€2.6亿", starPlayers:"哈兰德、厄德高", injuries:"无重大伤停", analysis:"挪威拥有哈兰德这个超级武器，进球效率世界顶级。厄德高的组织串联是进攻枢纽。但整体阵容深度严重不足，后防线是明显短板。哈兰德被限制则进攻威胁大减。" },
    "Austria": { totalValue:"€2.0亿", starPlayers:"萨比策、莱默尔、阿瑙托维奇", injuries:"无重大伤停", analysis:"奥地利在朗尼克执教下高压迫打法鲜明。萨比策是攻防枢纽，莱默尔跑动覆盖惊人。但缺少顶级球星，大赛经验不足。小组出线后难以走远。" },
    "South Korea": { totalValue:"€1.8亿", starPlayers:"孙兴慜、金玟哉、李刚仁", injuries:"无重大伤停", analysis:"韩国队孙兴慜仍是旗帜人物，金玟哉后防稳健。首场2-1胜捷克展示了韧劲。李刚仁在巴黎的成长是进攻端利好。但体能和防守组织仍是短板，淘汰赛上限有限。" },
    "Australia": { totalValue:"€1.1亿", starPlayers:"莱基、贝赫希", injuries:"无重大伤停", analysis:"澳大利亚首场2-0胜土耳其表现出色。体能对抗是优势，但技术层面与强队有差距。小组赛拼出线是现实目标，淘汰赛一步算一步。" },
    "Canada": { totalValue:"€1.6亿", starPlayers:"阿尔方索·戴维斯、乔纳森·大卫", injuries:"无重大伤停", analysis:"加拿大戴维斯速度惊人，大卫锋线有威胁。首场1-1平波黑暴露了进攻效率问题。整体实力偏弱但主场(多伦多)优势明显。小组出线需要奇迹。" },
    "Algeria": { totalValue:"€1.0亿", starPlayers:"乌纳斯、马赫雷斯", injuries:"马赫雷斯状态不佳", analysis:"阿尔及利亚马赫雷斯虽年事渐高但技术仍在。乌纳斯是进攻创造力来源。整体阵容以法甲球员为主，大赛经验不足。小组出线难度极大。" },
    "Egypt": { totalValue:"€1.3亿", starPlayers:"萨拉赫、特雷泽盖", injuries:"无重大伤停", analysis:"埃及完全依赖萨拉赫的个人能力。如果他发挥出色则有可能爆冷，但被限制则进攻基本瘫痪。防守端过于保守，平局大师。小组出线需看签运。" },
    "Ivory Coast": { totalValue:"€1.8亿", starPlayers:"阿勒、凯西", injuries:"无重大伤停", analysis:"科特迪瓦首场1-0胜厄瓜多尔开门红。凯西中场屏障，阿勒支点作用明显。非洲球员个人能力强但整体纪律性差。有成为黑马的潜质。" },
    "Paraguay": { totalValue:"€8000万", starPlayers:"戈麦斯、阿尔米隆", injuries:"无重大伤停", analysis:"巴拉圭首场1-4惨败美国令人失望。阿尔米隆速度是反击利器但独木难支。整体实力在参赛队中偏下，防守漏洞明显。小组出线希望渺茫。" },
    "Scotland": { totalValue:"€9000万", starPlayers:"罗伯逊、麦克托米奈", injuries:"无重大伤停", analysis:"苏格兰罗伯逊左路攻防俱佳，麦克托米奈中场支柱。首场1-0胜海地稳健但进攻创造力不足。大赛底蕴薄弱，小组出线即算成功。" },
    "Saudi Arabia": { totalValue:"€6000万", starPlayers:"阿尔布雷坎、达瓦萨里", injuries:"无重大伤停", analysis:"沙特阿拉伯技术细腻但身体对抗严重不足。2022爆冷阿根廷后本届能否再创奇迹？小组出线难度极大，但不容小觑。" },
    "Tunisia": { totalValue:"€7000万", starPlayers:"阿巴斯、斯希里", injuries:"无重大伤停", analysis:"突尼斯首场1-5惨败瑞典，防线漏洞百出。防守组织严密的说法被打破，进攻端仅靠定位球挽回颜面。大赛常以平局和低比分为主，但本场彻底崩盘，出线希望渺茫需在剩余两场全力抢分。" },
    "Ghana": { totalValue:"€9000万", starPlayers:"库杜斯、阿尤", injuries:"无重大伤停", analysis:"加纳队库杜斯是新生代核心，速度和技术出色。但整体阵容老化，防守漏洞多。属于中下游球队，小组赛需全力拼抢。" },
    "Panama": { totalValue:"€3000万", starPlayers:"普尔、戈多伊", injuries:"无重大伤停", analysis:"巴拿马世界杯经验不足，2018年首次参赛三战皆负。本届阵容以中北美联赛为主，实力在48队中垫底。重在参与。" },
    "New Zealand": { totalValue:"€2500万", starPlayers:"克里斯·伍德", injuries:"无重大伤停", analysis:"新西兰完全依赖克里斯·伍德的高空轰炸。整体实力与主流球队差距巨大，小组出线几乎不可能。每进一球都是胜利。" },
    "Czech Republic": { totalValue:"€1.0亿", starPlayers:"施克、索切克", injuries:"无重大伤停", analysis:"捷克首场1-2负韩国表现中规中矩。施克中锋支点作用明显，索切克中场稳健。但整体阵容深度不足，小组出线需要拼抢。" },
    "Bosnia": { totalValue:"€6000万", starPlayers:"朱拉诺维奇、皮亚尼奇", injuries:"皮亚尼奇轻伤", analysis:"波黑首场1-1平加拿大，皮亚尼奇老而弥坚。但整体阵容老化，新生代球员水平有限。小组赛力争出线。" },
    "DR Congo": { totalValue:"€5000万", starPlayers:"宗达、巴坎布", injuries:"无重大伤停", analysis:"刚果(金)非洲球员身体素质出色，巴坎布有速度。但整体组织性差，大赛经验不足。小组出线难度极大。" },
    "Qatar": { totalValue:"€4000万", starPlayers:"阿费夫、阿里", injuries:"无重大伤停", analysis:"卡塔尔首场1-1平瑞士展示了一定进步。阿费夫技术细腻，阿里有支点作用。但整体实力仍偏弱，出线需靠防守。" },
    "Iraq": { totalValue:"€3500万", starPlayers:"莫赫纳德·阿里", injuries:"无重大伤停", analysis:"伊拉克亚洲杯底蕴仍在，但与世界级球队差距明显。阿里是锋线核心但独木难支。重在积累大赛经验。" },
    "Jordan": { totalValue:"€2500万", starPlayers:"阿罗斯、塔马里", injuries:"无重大伤停", analysis:"约旦首次参加世界杯，塔马里在法甲证明过自己。整体实力偏弱但斗志昂扬，每场比赛都会全力拼搏。" },
    "Cape Verde": { totalValue:"€3000万", starPlayers:"弗雷德里科·巴西", injuries:"无重大伤停", analysis:"佛得角小国大梦想，球员多在欧洲二流联赛效力。技术细腻但体能不足，与强队对抗时劣势明显。" },
    "South Africa": { totalValue:"€3500万", starPlayers:"本特利、莫迪巴", injuries:"无重大伤停", analysis:"南非首场0-2负墨西哥，攻防两端均显不足。球员多在本土联赛效力，与欧洲球队差距明显。小组赛力争积分。" },
    "Haiti": { totalValue:"€2000万", starPlayers:"纳米加尼", injuries:"无重大伤停", analysis:"海地世界杯经验极少，首场0-1负苏格兰。整体实力在48队中垫底级别，重在参与和学习。" },
    "Curacao": { totalValue:"€1500万", starPlayers:"贾西", injuries:"无重大伤停", analysis:"库拉索首场1-7惨败德国，与强队差距触目惊心。球员多在低级别联赛效力，本届重在积累经验。" },
    "Uzbekistan": { totalValue:"€2000万", starPlayers:"雅肖多、绍穆罗多夫", injuries:"无重大伤停", analysis:"乌兹别克斯坦首次参加世界杯，球员多在俄超和本土联赛。技术有一定基础但大赛经验为零，出线希望渺茫。" },
    "Sweden": { totalValue:"€1.2亿", starPlayers:"伊萨克、福斯贝里、阿亚里", injuries:"无重大伤停", analysis:"瑞典首场5-1大胜突尼斯，伊萨克速度和技术是进攻利器，阿亚里梅开二度展现远射能力。北欧球队身体对抗强，本场火力全开令人侧目。小组出线前景光明，但需保持稳定性。" }
  }
};

// ── Group standings computation from results ──
function computeGroupStandings() {
  const standings = {};

  // Initialize
  for (const [grp, data] of Object.entries(WC2026_DATA.groups)) {
    standings[grp] = {};
    for (const team of data.teams) {
      standings[grp][team] = { p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 };
    }
  }

  // Process completed results
  for (const r of WC2026_DATA.completedResults) {
    const grp = r.group;
    const home = r.home;
    const away = r.away;
    const hg = r.hg;
    const ag = r.ag;

    if (!standings[grp]) continue;
    if (!standings[grp][home] || !standings[grp][away]) continue;

    standings[grp][home].p++;
    standings[grp][away].p++;
    standings[grp][home].gf += hg;
    standings[grp][home].ga += ag;
    standings[grp][away].gf += ag;
    standings[grp][away].ga += hg;
    standings[grp][home].gd = standings[grp][home].gf - standings[grp][home].ga;
    standings[grp][away].gd = standings[grp][away].gf - standings[grp][away].ga;

    if (hg > ag) {
      standings[grp][home].w++;
      standings[grp][home].pts += 3;
      standings[grp][away].l++;
    } else if (hg < ag) {
      standings[grp][away].w++;
      standings[grp][away].pts += 3;
      standings[grp][home].l++;
    } else {
      standings[grp][home].d++;
      standings[grp][away].d++;
      standings[grp][home].pts++;
      standings[grp][away].pts++;
    }
  }

  return standings;
}
