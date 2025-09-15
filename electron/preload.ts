// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// 在这里暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 示例：从渲染进程发送消息到主进程
  sendMessage: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  // 示例：从主进程接收消息
  onMessage: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
