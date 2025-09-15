# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

### 高层架构

本项目是一个基于 Web 的工作室，用于阿里云通义千问 ASR（自动语音识别）模型。它是一个使用 React 和 TypeScript 构建的单页应用。

-   **前端**: 应用的核心位于 `qwen3-asr-studio/` 目录中。它使用 `React`、`TypeScript` 和 `Vite` 构建。
    -   UI 组件位于 `qwen3-asr-studio/src/components/`。
    -   业务逻辑被分离到 `qwen3-asr-studio/src/services/` 中的服务：
        -   `audioService.ts`: 处理音频录制、处理和压缩。
        -   `gradioService.ts`: 管理与托管 ASR 模型的 Gradio 后端的通信。
        -   `cacheService.ts`: 使用 IndexedDB 实现历史记录、笔记和设置的客户端缓存。
-   **ASR 后端**: 该应用与一个 Gradio 服务通信，该服务不属于此代码库。此服务包装了通义千问 ASR 模型。
-   **API 封装**:
    -   `aliyun-api/`: 包含与阿里云 API 直接交互相关的代码。
    -   `modelscope-api/`: 包含用于与 ModelScope API 交互的代码。

### 常用开发任务

-   **安装依赖**:
    ```bash
    cd qwen3-asr-studio
    pnpm install
    ```

-   **运行开发服务器**:
    ```bash
    cd qwen3-asr-studio
    pnpm dev
    ```

-   **构建应用**:
    ```bash
    cd qwen3-asr-studio
    pnpm build
    ```

-   **代码检查与格式化**: 项目没有预先配置的代码检查器或格式化工具。可以考虑添加 ESLint 或 Prettier。

-   **测试**: 没有测试配置。如果需要添加测试，可以考虑使用 Vitest 或 React Testing Library 等框架。

### 给 Claude 的注意事项

-   所有前端应用的开发工作都应在 `qwen3-asr-studio/` 目录内进行。
-   该应用严重依赖浏览器 API，如 Web Audio API 和 IndexedDB。
-   在开发功能时，请注意现有的基于服务的架构。新逻辑很可能应该添加到 `qwen3-asr-studio/src/services/` 中的相关服务中。
-   用户偏好使用中文进行回答 (用中文回答用户问题)。
