// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// 定义一个白名单，以确保安全
const validChannelsSend = [
  'register-shortcut',
  'unregister-all-shortcuts',
  'show-overlay',
  'hide-overlay',
  'update-overlay',
  'paste-text',
];
const validChannelsReceive = ['shortcut-triggered', 'recording-state-changed'];

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, data: any) => {
    if (validChannelsSend.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    if (validChannelsReceive.includes(channel)) {
      // 过滤掉 event 参数
      const subscription = (event: any, ...args: any[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      // 返回一个清理函数
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
    // 返回一个空函数以保持 API 一致性
    return () => {};
  },
  // 示例：从渲染进程发送消息到主进程
  sendMessage: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  // 示例：从主进程接收消息
  onMessage: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
