# Video - 私人影视聚合平台

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

基于 [KVideo](https://github.com/KuekHaoYang/KVideo) 二次开发的私人影视聚合平台，在保留核心功能的基础上进行了**功能精简**和**界面美化优化**，提供更简洁清爽的使用体验。

## 核心功能

- **智能视频播放**：HLS 流媒体支持、播放控制、自动连播、画中画、Chromecast 投屏
- **多源并行搜索**：聚合多个视频源并行搜索，SSE 实时返回结果
- **IPTV 直播**：M3U/JSON 格式支持，HEVC 智能兼容，流媒体代理
- **弹幕系统**：Canvas 高性能渲染，支持多 API 管理
- **豆瓣集成**：影视信息获取、推荐系统、标签管理
- **个性化功能**：收藏管理、观看历史、断点续播
- **响应式设计**：桌面/移动端/TV 全适配
- **PWA 支持**：可安装为独立应用
- **跨设备同步**：基于 Redis 的配置同步（可选）

## 快速部署

### Docker 部署（推荐）

```bash
# 最简启动
docker run -d -p 3000:3000 --name video vespeng/video:latest

# 完整配置示例
docker run -d -p 3000:3000 \
  -e ADMIN_PASSWORD="admin123" \
  -e PREMIUM_PASSWORD="premium456" \
  -e ACCOUNTS="user1:用户一:admin,user2:用户二:viewer" \
  -e NEXT_PUBLIC_SITE_NAME="我的视频" \
  --name video vespeng/video:latest
```

### Node.js 部署

```bash
git clone https://github.com/vespeng/video.git
cd video
npm install
npm run build
npm start
```

### Vercel / Cloudflare 托管部署

> 注意：托管模式会禁用外部媒体代理和 IPTV 流中继，仅支持直连播放。完整功能请使用 Docker 或 Node.js 自托管。

1. 本地构建：`npm install && npm run pages:build`
2. 上传 `.vercel/output/static` 目录（不要上传源码或 .next 目录）

## 环境变量配置

### 认证相关

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ADMIN_PASSWORD` | 管理员密码 | - |
| `ACCOUNTS` | 多账户配置，格式：`用户名:密码:名称[:角色[:权限]]` | - |
| `PREMIUM_PASSWORD` | 高级内容独立密码 | - |
| `AUTH_SECRET` | 托管账户模式密钥（需配合 Redis） | - |
| `UPSTASH_REDIS_REST_URL` | Redis REST URL（用于托管账户和数据同步） | - |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST Token | - |

**账户角色**：`super_admin`（超级管理员）、`admin`（管理员）、`viewer`（观众）

**可用权限**：`source_management`、`account_management`、`danmaku_api`、`data_management`、`player_settings`、`danmaku_appearance`、`view_settings`、`iptv_access`

### 站点自定义

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_SITE_NAME` | 站点名称 | `KVideo` |
| `NEXT_PUBLIC_SITE_TITLE` | 浏览器标题 | `KVideo - 视频聚合平台` |
| `SITE_ICON_FILE` | Docker 图标文件路径 | - |
| `SITE_ICON_URL` | Docker 图标 URL | - |

### 功能配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SUBSCRIPTION_SOURCES` | 自动订阅源（JSON 数组或 URL） | - |
| `IPTV_SOURCES` | IPTV 直播源配置 | - |
| `DANMAKU_API_URL` | 弹幕 API 地址 | - |
| `AD_KEYWORDS` | 广告过滤关键词 | - |
| `MERGE_SOURCES` | 合并同名源（`true`/`1`） | - |
| `VIDEOTOGETHER_ENABLED` | 启用一起看功能 | `true` |

### 网络配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 应用端口 | `3000` |
| `ALLOW_LAN_ACCESS` | 允许局域网访问 | `false` |
| `PERSIST_SESSION` | 持久化登录会话 | `true` |

## 视频源 JSON 格式

```json
[
  {
    "id": "my_source_1",
    "name": "我的精选源",
    "baseUrl": "https://api.example.com/vod",
    "group": "normal",
    "priority": 1
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 显示名称 |
| `baseUrl` | string | 是 | API 地址 |
| `group` | string | 否 | 分组：`normal` 或 `premium` |
| `priority` | number | 否 | 优先级（数字越小越优先） |
| `enabled` | boolean | 否 | 是否启用 |
| `headers` | object | 否 | 自定义请求头 |

> **订阅源 vs 视频源**：订阅源是包含多个源的 JSON 文件链接，在「订阅管理」添加；单个 API 接口地址请在「自定义源」中添加。

## 更新方法

### Docker

```bash
docker stop video && docker rm video
docker pull vespeng/video:latest
docker run -d -p 3000:3000 --name video vespeng/video:latest
```

### Node.js

```bash
git pull origin main
npm install && npm run build && npm start
```

## 常见问题

**Q: Cloudflare Pages 部署后 404？**
A: 请确保上传的是 `.vercel/output/static` 目录，而非仓库根目录或 `.next` 目录。

**Q: IPTV 无法播放？**
A: 托管部署（Vercel/Cloudflare）默认禁用 IPTV 中继，需使用 Docker 或 Node.js 自托管。

**Q: CCTV 等频道只有声音？**
A: 部分 HEVC 编码流兼容性问题，建议使用 Chrome/Edge 浏览器，v4.5.0+ 已自动检测并优先选择 H.264。

**Q: 移动端浏览器无法播放？**
A: 部分内置浏览器不支持 MSE/HLS.js，建议使用 Chrome、Safari、Firefox 等主流浏览器。

## 技术栈

- **Next.js 16** + **React 19** + **TypeScript 5** + **Tailwind CSS 4**
- **Zustand** 状态管理、**hls.js** 播放引擎、**Lucide** 图标库

## 许可证

[MIT License](LICENSE)
