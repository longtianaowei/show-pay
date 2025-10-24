# 🐂 牛马计薪器 (Worker Salary Calculator)

<div align="center">

一个基于 Electron 的实时工资计算桌面应用，帮助打工人实时追踪工作时间和收入。

![Electron](https://img.shields.io/badge/Electron-37.2.3-47848F?style=flat-square&logo=electron)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-06B6D4?style=flat-square&logo=tailwindcss)

</div>

## ✨ 功能特性

- **💰 多种计薪方式**：支持时薪、日薪、月薪三种计算模式
- **⏱️ 实时计算**：启动计时器后实时显示当前收入
- **📊 工作进度可视化**：直观显示工作进度和剩余时间
- **🚀 加班计算**：自动识别并按配置倍率计算加班收入
- **🪟 悬浮窗口**：独立的悬浮小组件，实时显示收入和进度
- **🎨 现代化界面**：基于 TailwindCSS 的精美 UI 设计
- **💾 数据持久化**：自动保存配置和计算参数
- **🖱️ 无边框窗口**：自定义窗口控制，支持拖拽和最小化

## 🏗️ 技术架构

### 核心技术栈

- **框架**: Electron 37 + electron-vite
- **前端**: React 19 + TypeScript 5
- **样式**: TailwindCSS 4
- **状态管理**: Zustand
- **构建工具**: Vite 7
- **代码规范**: ESLint + Prettier

### 架构设计

#### 双窗口架构
- **主窗口**：完整的工资计算器界面，包含设置和进度可视化
- **悬浮窗口**：轻量级浮动显示，展示实时收入、进度和倒计时
- 通过 IPC 实现窗口间通信

#### 状态管理
- 使用 Zustand 进行全局状态管理 (`src/renderer/src/store/salaryStore.ts`)
- 单一 store 管理所有工资计算逻辑、计时器状态和设置
- 支付参数变更时自动重新计算收入

#### Electron 结构
- **主进程** (`src/main/index.ts`)：创建和管理窗口，处理 IPC 通信
- **预加载脚本** (`src/preload/index.ts`)：安全地向渲染进程暴露 API
- **渲染进程**：React 应用，通过 URL hash 路由（`#/widget` 为悬浮窗口视图）

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动开发服务器（支持热重载）
npm run dev
```

### 构建应用

```bash
# 完整构建（包含类型检查）
npm run build

# Windows 发行版
npm run build:win

# macOS 发行版
npm run build:mac

# Linux 发行版
npm run build:linux

# 仅构建不打包
npm run build:unpack
```

### 预览构建结果

```bash
npm start
```

## 🛠️ 开发命令

```bash
# 类型检查
npm run typecheck          # 检查所有代码
npm run typecheck:node     # 仅检查主进程
npm run typecheck:web      # 仅检查渲染进程

# 代码质量
npm run lint               # ESLint 检查
npm run format            # Prettier 格式化
```

## 📦 项目结构

```
show-pay/
├── src/
│   ├── main/              # Electron 主进程
│   │   └── index.ts       # 主进程入口，窗口管理
│   ├── preload/           # 预加载脚本
│   │   └── index.ts       # IPC API 暴露
│   └── renderer/          # React 渲染进程
│       └── src/
│           ├── components/    # React 组件
│           ├── store/         # Zustand 状态管理
│           │   └── salaryStore.ts  # 工资计算核心逻辑
│           ├── App.tsx        # 主应用
│           ├── Widget.tsx     # 悬浮窗口
│           └── main.tsx       # 渲染进程入口
├── resources/             # 应用资源（图标等）
├── electron.vite.config.ts  # Electron Vite 配置
├── tailwind.config.js     # TailwindCSS 配置
└── package.json
```

## 🎯 核心功能实现

### 工资计算逻辑

支持三种计薪模式：

1. **时薪模式**
2. **日薪模式**
3. **月薪模式**
### 加班计算

- 自动识别超出标准工时的时间
- 可配置加班倍率（如 1.5 倍或 2 倍）
- 实时显示加班收入占比

### IPC 通信

主要通信频道：

- `open-widget-window`: 触发创建悬浮窗口
- `salary-data-update`: 向悬浮窗口发送更新的工资数据
- `window-minimize` / `window-close`: 窗口控制事件

## 📝 配置说明

应用配置自动保存在本地，包括：

- 计薪类型（时薪/日薪/月薪）
- 薪资金额
- 工作时间设置
- 加班倍率
- 窗口位置和状态

## 💻 推荐开发环境

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开发规范

- 使用 TypeScript 编写所有代码
- 遵循 ESLint 和 Prettier 配置
- 提交前运行 `npm run typecheck` 确保类型正确
- 使用语义化的 commit message

## 📜 许可证

本项目仅供学习交流使用。

## 👨‍💻 作者

**longtianaowei**

## 🙏 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

<div align="center">

**[⬆ 回到顶部](#-牛马计薪器-worker-salary-calculator)**

Made with ❤️ by longtianaowei

</div>
