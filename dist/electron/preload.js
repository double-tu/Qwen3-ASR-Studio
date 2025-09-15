"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// electron/preload.ts
const electron_1 = require("electron");
// 在这里暴露安全的 API 给渲染进程
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // 示例：从渲染进程发送消息到主进程
    sendMessage: (channel, data) => {
        electron_1.ipcRenderer.send(channel, data);
    },
    // 示例：从主进程接收消息
    onMessage: (channel, func) => {
        electron_1.ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
});
