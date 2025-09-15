# AI 语音输入助手代码架构设计

我们基于现有 `qwen3-asr-studio` 项目，为您的Electron桌面应用设计一个清晰、可扩展的代码架构。

这个架构将遵循Electron的最佳实践，将负责与操作系统交互的**主进程（Main Process）**和负责UI渲染的**渲染进程（Renderer Process）**明确分离，并将现有`qwen3-asr-studio`项目作为渲染进程的核心。

### 1. 项目目录结构

我们将采用一个单体仓库（Monorepo）的结构，根目录包含Electron主进程代码，而现有的`qwen3-asr-studio`将被整合为`renderer`目录。

```
/VoiceFlow/
├── electron/                   # Electron 主进程代码
│   ├── main.ts                 # 主进程入口文件
│   ├── preload.ts              # 预加载脚本，用于主进程和渲染进程的安全通信
│   ├── tray.ts                 # 系统托盘图标管理
│   └── shortcuts.ts            # 全局快捷键管理
│
├── renderer/                   # 渲染进程代码 (基于 qwen3-asr-studio)
│   ├── public/
│   ├── src/
│   │   ├── components/         # React UI 组件 (部分可复用)
│   │   ├── services/           # 核心业务逻辑服务
│   │   │   ├── audioService.ts   # (复用) 音频处理
│   │   │   ├── cacheService.ts   # (复用) 历史记录与缓存
│   │   │   ├── sttService.ts     # (新建) 封装多种 STT API
│   │   │   └── llmService.ts     # (新建) 封装 LLM API
│   │   ├── hooks/              # React Hooks
│   │   │   └── useApi.ts         # 用于管理 API 状态
│   │   ├── pages/              # 页面级组件
│   │   │   ├── Settings.tsx      # 配置中心页面
│   │   │   └── History.tsx       # 历史记录页面
│   │   ├── App.tsx             # 应用主组件
│   │   └── index.tsx           # React 入口
│   └── package.json            # 渲染进程的依赖
│
├── shared/                     # 主进程和渲染进程共享的代码
│   └── types.ts                # 共享的 TypeScript 类型定义
│
├── package.json                # 项目根依赖 (Electron, electron-builder)
└── tsconfig.json               # TypeScript 配置文件
```

### 2. 核心模块与职责

#### **`electron/` (主进程)**
*   **职责**：处理所有与操作系统底层交互的任务。它没有UI。
*   `main.ts`:
    *   创建和管理应用窗口（例如设置窗口）。
    *   初始化系统托盘和全局快捷键。
    *   监听渲染进程通过IPC（Inter-Process Communication）发送的指令。
*   `preload.ts`:
    *   一个安全的桥梁，将主进程的部分能力（如IPC通信函数）暴露给渲染进程，遵循Electron的上下文隔离安全原则。
*   `tray.ts`:
    *   创建和管理系统右下角的托盘图标，处理点击事件（如打开设置），并根据录音状态更新图标。
*   `shortcuts.ts`:
    *   使用`globalShortcut`注册全局热键，监听用户的按键操作，并通知渲染进程开始或结束录音。

#### **`renderer/` (渲染进程)**
*   **职责**：负责所有用户界面的展示和核心业务逻辑的执行。
*   `services/`:
    *   `audioService.ts`: **直接复用**。负责录音、音频压缩和格式转换。
    *   `cacheService.ts`: **直接复用**。使用IndexedDB存储历史记录、配置等。
    *   `sttService.ts`: **新建**。基于`gradioService.ts`的模式，封装对多个STT API（Whisper, Google等）的调用逻辑。
    *   `llmService.ts`: **新建**。封装对大模型API的调用，用于文本后处理。
*   `pages/`:
    *   `Settings.tsx`: 提供完整的UI界面，让用户可以配置快捷键、API Key、Prompt等。
    *   `History.tsx`: 展示历史记录，提供播放、复制、删除等功能。

### 3. 核心工作流程（数据流）

这将解释一个完整的“语音到文本”过程是如何在架构中流转的：

1.  **启动**：应用启动时，`electron/main.ts`运行，不显示窗口，仅在系统托盘创建图标。
2.  **触发录音**：用户在任何地方按下全局快捷键（如 `Alt + Q`）。
3.  **主进程响应**：`electron/shortcuts.ts`捕获到快捷键，通过IPC向渲染进程发送一个消息，例如 `channel.send('start-recording')`。
4.  **渲染进程开始录音**：`renderer/App.tsx`中监听此消息，调用`audioService`开始录制麦克风音频。同时，主进程可以更新托盘图标为“录音中”状态。
5.  **结束录音**：用户再次按下快捷键。
6.  **主进程通知**：主进程再次通过IPC发送`'stop-recording'`消息。
7.  **渲染进程处理**：
    *   `audioService`停止录音，将音频压缩并转为WAV文件。
    *   `sttService`被调用，将音频文件发送给用户选择的STT API。
    *   获取到原始文本后，如果用户开启了后处理，则调用`llmService`将原始文本和Prompt发送给大模型。
    *   获取到最终文本。
    *   `cacheService`被调用，将原始音频、原始文本、最终文本作为一个条目存入历史记录。
8.  **输出文本**：
    *   渲染进程将最终文本通过IPC发送回主进程：`channel.send('paste-text', final_text)`。
    *   主进程接收到消息后，使用`robotjs`等库模拟键盘输入，将文本粘贴到用户当前激活的窗口中。
