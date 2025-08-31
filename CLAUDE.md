# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron-based salary calculator application called "牛马计薪器" (Worker Salary Calculator). It allows users to track their working time and calculate real-time income based on different payment types (hourly, daily, monthly). The app features a main calculator window and a floating widget window.

## Key Architecture Components

### Dual-Window Architecture
- **Main Window**: Full-featured salary calculator interface with settings and progress visualization
- **Widget Window**: Floating compact display showing real-time income, progress, and countdown
- Communication between windows via IPC (Inter-Process Communication)

### State Management
- Uses Zustand for global state management in `src/renderer/src/store/salaryStore.ts`
- Single store manages all salary calculation logic, timer state, and settings
- Automatic income recalculation when payment parameters change

### Electron Structure
- **Main Process** (`src/main/index.ts`): Creates and manages both windows, handles IPC
- **Preload Script** (`src/preload/index.ts`): Securely exposes APIs to renderer
- **Renderer Process**: React app with routing based on URL hash (`#/widget` for widget view)

### Core Features
- Three payment calculation modes: hourly, daily, monthly
- Real-time timer with work progress tracking
- Overtime calculation with configurable rates
- Custom window controls (frameless windows)
- Persistent floating widget functionality

## Development Commands

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Type checking
npm run typecheck          # Both node and web
npm run typecheck:node     # Main process only
npm run typecheck:web      # Renderer process only

# Code quality
npm run lint               # ESLint
npm run format            # Prettier

# Build application
npm run build             # Full build with type checking
npm run build:win         # Windows distribution
npm run build:mac         # macOS distribution  
npm run build:linux       # Linux distribution
npm run build:unpack      # Build without packaging

# Preview built app
npm start
```

## Technology Stack

- **Framework**: Electron with electron-vite
- **Frontend**: React 19 + TypeScript
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier

## Important Implementation Details

### Window Routing
The renderer uses hash-based routing: main app loads at root, widget loads at `#/widget`

### IPC Communication
- `open-widget-window`: Trigger widget window creation
- `salary-data-update`: Send updated salary data to widget
- `window-minimize`/`window-close`: Window control events

### State Calculations
All salary calculations happen in the Zustand store's `calculateCurrentIncome()` method, which handles different payment types and overtime logic.