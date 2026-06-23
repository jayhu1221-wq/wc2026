# ⚽ 2026 FIFA 世界杯 AI 比分预测

基于双大模型（Claude Opus 4.7 + MiMo）交叉验证的 2026 FIFA 世界杯比分预测网站。

## ✨ 功能特性

- **智能比分预测** — 基于 FIFA 排名、历史对战、近期状态、天气因素、AI 综合分析
- **双大模型交叉验证** — Claude Opus 4.7（OpenRouter）× MiMo-V2.5-Pro，提供更可靠的分析
- **实时比分同步** — 通过 football-data.org API 获取实时赛果，每次刷新自动更新
- **完整赛程表** — 全部 104 场比赛，含小组赛、淘汰赛
- **小组积分榜** — 实时排名，12 个小组
- **淘汰赛对阵图** — 自动填充晋级队伍
- **球队实力排行** — 48 支参赛队综合评分
- **串关建议** — 覆盖今明两日的投注建议

## 🔧 技术架构

```
客户端 (前端)                    服务端 (Node.js)
┌──────────────┐               ┌──────────────────┐
│  index.html  │               │    server.js     │
│  app.js      │──fetch──→     │  /api/scores     │──→ football-data.org
│  deepseek.js │──POST───→     │  /api/ai-analysis│──→ OpenRouter (Claude)
│  mimo.js     │──POST───→     │                  │──→ MiMo API
│  livedata.js │──fetch──→     │  /api/fd/*       │──→ football-data.org
└──────────────┘               └──────────────────┘
   纯前端，无密钥              所有API密钥在此文件
```

**安全设计**: 所有 API 密钥仅存在于服务端 `server.js`，通过环境变量注入，客户端代码中零密钥。

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/wc2026-predictor.git
cd wc2026-predictor
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API 密钥：

| 变量 | 获取地址 | 用途 |
|------|---------|------|
| `FD_API_KEY` | [football-data.org](https://www.football-data.org/client/register) | 实时比分数据 |
| `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai/keys) | Claude Opus 4.7 |
| `MIMO_API_KEY` | [xiaomimimo.com](https://www.xiaomimimo.com/) | MiMo 第二模型 |

### 3. 启动服务器

```bash
node server.js
```

打开浏览器访问 `http://localhost:3000`

## 📦 部署指南

### Railway（推荐）

1. Fork 本仓库到你的 GitHub
2. 访问 [railway.app](https://railway.app)，点击 "New Project" → "Deploy from GitHub repo"
3. 选择你 fork 的仓库
4. 在 "Variables" 标签页添加环境变量：
   - `FD_API_KEY`
   - `OPENROUTER_API_KEY`
   - `MIMO_API_KEY`
5. Railway 会自动检测 `package.json` 并运行 `npm start`
6. 在 "Settings" → "Domains" 绑定你的域名

### Render

1. Fork 本仓库
2. 访问 [render.com](https://render.com)，创建 "New Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - Build Command: `npm install`（可选，本项目无依赖）
   - Start Command: `node server.js`
5. 添加环境变量（同上）
6. 绑定自定义域名

### VPS / 自建服务器

```bash
# 克隆到服务器
git clone https://github.com/YOUR_USERNAME/wc2026-predictor.git
cd wc2026-predictor

# 配置环境变量
cp .env.example .env
nano .env  # 填入密钥

# 使用 PM2 保持运行
npm install -g pm2
pm2 start server.js --name wc2026
pm2 startup
pm2 save

# Nginx 反向代理（参考配置）
# 将 your-domain.com 的 80/443 端口代理到 localhost:3000
```

## 📁 项目结构

```
wc2026-predictor/
├── server.js              # API 代理服务器（核心，含所有密钥逻辑）
├── index.html             # 主页面
├── styles.css             # 样式表
├── app.js                 # 主应用逻辑
├── deepseek.js            # Claude Opus 分析引擎（通过服务端代理）
├── mimo.js                # MiMo 分析引擎（通过服务端代理）
├── livedata.js            # 实时数据管理
├── predictor.js           # 统计预测模型
├── bracket.js             # 淘汰赛对阵图
├── weather.js             # 天气数据
├── data.js                # 静态数据（赛程、排名等）
├── live-scores.json       # 预取的实时比分缓存
├── live-data-inline.js    # 内联实时数据
├── fetch-live-data.js     # 数据预取脚本（开发工具）
├── update-data.js         # 数据更新脚本（开发工具）
├── package.json           # 项目配置
├── .env.example           # 环境变量模板
├── .env                   # 真实密钥（已被 .gitignore 忽略）
└── .gitignore
```

## 🔒 安全说明

- **所有 API 密钥通过环境变量注入**，代码中无硬编码密钥
- `.env` 文件已被 `.gitignore` 忽略，不会被提交到 GitHub
- 客户端 JS 文件中不含任何 API 密钥
- 服务端禁止直接访问 `server.js`、`fetch-live-data.js`、`.env` 等敏感文件
- football-data.org 请求有 30 秒缓存，避免超出免费版 10 次/分钟限制

## 📝 更新数据

```bash
# 重新从 football-data.org 获取最新比分数据
# （需要配置 FD_API_KEY 环境变量）
node fetch-live-data.js
```

## ⚠️ 免责声明

本网站仅供学习和娱乐用途，不构成任何投注建议。足球比赛结果具有高度不确定性，请理性参考。请在您所在地区法律法规允许的范围内使用。

## 📄 License

MIT
