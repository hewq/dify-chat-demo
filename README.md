# Frontend AI Assistant

一个基于 Dify + DeepSeek + React + Express 的 AI 知识库问答应用。

## 功能

- 支持知识库问答
- 支持多轮对话
- 支持流式输出
- 支持 Markdown 渲染
- 支持代码高亮
- 支持引用来源展示
- 通过 Express 代理保护 Dify API Key

## 技术栈

- React
- TypeScript
- Vite
- Express
- Dify
- DeepSeek
- React Markdown
- Highlight.js

## 架构

```text
Browser
  ↓
Vite React App
  ↓
Express API Proxy
  ↓
Dify Chat API
  ↓
Knowledge Retrieval + DeepSeek
```

## 本地启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 .env.example 为 .env：

```bash
cp .env.example .env
```

然后填写：

```env
DIFY_API_KEY=your_dify_app_api_key
DIFY_API_URL=https://api.dify.ai/v1/chat-messages
```

### 3. 启动项目

```bash
npm run dev:all
```

前端地址：

```
http://localhost:5173
```

后端代理：

```
http://localhost:3001
```

## 核心流程

1. 用户在前端输入问题
2. 前端请求 `/api/chat/stream`
3. Express 服务端携带 Dify API Key 调用 Dify
4. Dify 执行知识库检索和模型回答
5. 服务端将流式响应转发给前端
6. 前端逐步渲染 AI 回答
7. 回答完成后展示引用来源

## 服务端设计

项目使用 Express 作为 BFF 层，用于隐藏 Dify API Key，并统一处理 Dify 请求、流式响应转发和错误处理。

服务端按职责拆分为：

- `config/env.ts`：环境变量校验
- `routes/chat.ts`：聊天接口
- `services/dify.ts`：Dify API 调用
- `utils/errors.ts`：错误响应

## 代码质量

项目配置了基础质量保障：

- TypeScript strict mode
- ESLint
- Prettier
- Husky
- lint-staged
- pre-commit typecheck

常用命令：

```bash
npm run lint
npm run format
npm run typecheck
npm run check
```
