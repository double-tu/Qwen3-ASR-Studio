"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// electron/preload.ts
const electron_1 = require("electron");
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
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        if (validChannelsSend.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
        if (validChannelsReceive.includes(channel)) {
            // 过滤掉 event 参数
            const subscription = (event, ...args) => func(...args);
            electron_1.ipcRenderer.on(channel, subscription);
            // 返回一个清理函数
            return () => {
                electron_1.ipcRenderer.removeListener(channel, subscription);
            };
        }
        // 返回一个空函数以保持 API 一致性
        return () => { };
    },
    // 示例：从渲染进程发送消息到主进程
    sendMessage: (channel, data) => {
        electron_1.ipcRenderer.send(channel, data);
    },
    // 示例：从主进程接收消息
    onMessage: (channel, func) => {
        electron_1.ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
});
