// ============================================
// weather.js — 比赛城市天气数据模块
// 使用 Open-Meteo 免费 API（无需 Key）
// ============================================

const WeatherModule = {

  // 各场馆城市经纬度
  venueCoords: {
    "迈阿密体育场":           { lat: 25.958, lon: -80.239, city: "迈阿密", tz: "America/New_York" },
    "亚特兰大体育场":          { lat: 33.757, lon: -84.401, city: "亚特兰大", tz: "America/New_York" },
    "洛杉矶体育场":            { lat: 34.014, lon: -118.288, city: "洛杉矶", tz: "America/Los_Angeles" },
    "西雅图体育场":            { lat: 47.595, lon: -122.332, city: "西雅图", tz: "America/Los_Angeles" },
    "MetLife 体育场":          { lat: 40.813, lon: -74.074, city: "纽约/新泽西", tz: "America/New_York" },
    "吉利特体育场 波士顿":      { lat: 42.091, lon: -71.264, city: "波士顿", tz: "America/New_York" },
    "吉利特体育场":            { lat: 42.091, lon: -71.264, city: "波士顿", tz: "America/New_York" },
    "NRG 体育场 休斯顿":       { lat: 29.685, lon: -95.411, city: "休斯顿", tz: "America/Chicago" },
    "休斯顿 NRG":              { lat: 29.685, lon: -95.411, city: "休斯顿", tz: "America/Chicago" },
    "林肯金融场 费城":          { lat: 39.901, lon: -75.168, city: "费城", tz: "America/New_York" },
    "费城 林肯金融场":          { lat: 39.901, lon: -75.168, city: "费城", tz: "America/New_York" },
    "AT&T 体育场 达拉斯":      { lat: 32.748, lon: -97.093, city: "达拉斯", tz: "America/Chicago" },
    "BC Place 温哥华":         { lat: 49.277, lon: -123.112, city: "温哥华", tz: "America/Vancouver" },
    "BMO Field 多伦多":        { lat: 43.633, lon: -79.419, city: "多伦多", tz: "America/Toronto" },
    "旧金山湾区体育场":        { lat: 37.403, lon: -121.970, city: "旧金山", tz: "America/Los_Angeles" },
    "堪萨斯城体育场":          { lat: 39.049, lon: -94.484, city: "堪萨斯城", tz: "America/Chicago" },
    "蒙特雷体育场":            { lat: 25.669, lon: -100.310, city: "蒙特雷", tz: "America/Monterrey" },
    "阿兹特卡球场":            { lat: 19.303, lon: -99.151, city: "墨西哥城", tz: "America/Mexico_City" },
    "瓜达拉哈拉体育场":        { lat: 20.683, lon: -103.367, city: "瓜达拉哈拉", tz: "America/Mexico_City" }
  },

  // 天气代码映射（WMO）
  weatherCodes: {
    0:  { desc: "晴", icon: "☀️" },
    1:  { desc: "大部分晴", icon: "🌤️" },
    2:  { desc: "局部多云", icon: "⛅" },
    3:  { desc: "阴天", icon: "☁️" },
    45: { desc: "有雾", icon: "🌫️" },
    48: { desc: "冻雾", icon: "🌫️" },
    51: { desc: "小毛毛雨", icon: "🌦️" },
    53: { desc: "中毛毛雨", icon: "🌧️" },
    55: { desc: "大毛毛雨", icon: "🌧️" },
    61: { desc: "小雨", icon: "🌧️" },
    63: { desc: "中雨", icon: "🌧️" },
    65: { desc: "大雨", icon: "🌧️" },
    71: { desc: "小雪", icon: "🌨️" },
    73: { desc: "中雪", icon: "❄️" },
    75: { desc: "大雪", icon: "❄️" },
    80: { desc: "阵雨", icon: "🌦️" },
    81: { desc: "中阵雨", icon: "🌧️" },
    82: { desc: "强阵雨", icon: "⛈️" },
    95: { desc: "雷暴", icon: "⛈️" },
    99: { desc: "强雷暴", icon: "🌩️" }
  },

  // 缓存
  _cache: {},

  // 获取某场地当前天气
  async fetchWeather(venueStr) {
    // 模糊匹配
    let coords = null;
    for (const [key, val] of Object.entries(this.venueCoords)) {
      if (venueStr && venueStr.includes(key.substring(0, 6))) {
        coords = val;
        break;
      }
    }
    if (!coords) {
      // 尝试完整匹配
      coords = this.venueCoords[venueStr] || null;
    }
    if (!coords) {
      return { error: true, message: '未找到场馆坐标' };
    }

    const cacheKey = `${coords.lat},${coords.lon}`;
    const now = Date.now();
    if (this._cache[cacheKey] && now - this._cache[cacheKey].ts < 5 * 60 * 1000) {
      return this._cache[cacheKey].data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&wind_speed_unit=kmh&timezone=${encodeURIComponent(coords.tz)}&forecast_days=1`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();

      const cur = json.current;
      const wCode = cur.weather_code;
      const wInfo = this.weatherCodes[wCode] || { desc: "未知", icon: "🌡️" };

      const data = {
        city: coords.city,
        temp: Math.round(cur.temperature_2m),
        feelsLike: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        wind: Math.round(cur.wind_speed_10m),
        desc: wInfo.desc,
        icon: wInfo.icon,
        impact: this.getWeatherImpact(wCode, cur.wind_speed_10m, cur.temperature_2m)
      };

      this._cache[cacheKey] = { ts: now, data };
      return data;
    } catch(e) {
      // 返回模拟天气（网络不通时）
      return this.getMockWeather(coords.city);
    }
  },

  getMockWeather(city) {
    // 基于城市纬度估算天气
    const t = city === '休斯顿' ? 34 : city === '洛杉矶' ? 28 : city === '纽约/新泽西' ? 25 : 26;
    return {
      city, temp: t, feelsLike: t + 2, humidity: 55, wind: 15,
      desc: "晴", icon: "☀️",
      impact: "🟢 天气良好，适合比赛",
      mock: true
    };
  },

  // 分析天气对比赛的影响
  getWeatherImpact(code, wind, temp) {
    if (code >= 95) return "🔴 雷暴警告，比赛可能受影响";
    if (code >= 80) return "🟡 雨天阵雨，可能影响场地和传球";
    if (code >= 61) return "🟡 降雨天气，地面湿滑影响控球";
    if (wind > 50) return "🟡 大风天气，定位球和长传受影响";
    if (temp > 35) return "🟡 高温炎热，球员体能消耗加快";
    if (temp < 5) return "🟡 气温较低，场地可能偏硬";
    return "🟢 天气条件良好，适合比赛";
  }
};
