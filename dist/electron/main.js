"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// electron/main.ts
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const robotjs_1 = __importDefault(require("robotjs"));
// 主窗口引用
let mainWindow;
// 悬浮窗引用
let overlayWindow;
function createOverlayWindow() {
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    overlayWindow = new electron_1.BrowserWindow({
        width: 280,
        height: 80,
        x: width - 300,
        y: height - 100,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: false,
        resizable: false,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false,
    });
    // 加载悬浮窗的 UI
    overlayWindow.loadURL('http://localhost:5173/overlay.html');
    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    // 改为加载 Vite 开发服务器的 URL
    // mainWindow.loadFile('renderer/index.html');
    mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具
    // mainWindow.webContents.openDevTools();
}
electron_1.app.whenReady().then(() => {
    createWindow();
    createOverlayWindow(); // 创建悬浮窗
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    // 注册全局快捷键
    electron_1.ipcMain.on('register-shortcut', (event, shortcut) => {
        if (electron_1.globalShortcut.isRegistered(shortcut)) {
            electron_1.globalShortcut.unregister(shortcut);
        }
        const ret = electron_1.globalShortcut.register(shortcut, () => {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('shortcut-triggered');
        });
        if (!ret) {
            console.log('registration failed');
        }
    });
    // 接收到最终文本并粘贴
    electron_1.ipcMain.on('paste-text', (event, text) => {
        const originalClipboard = electron_1.clipboard.readText();
        electron_1.clipboard.writeText(text);
        // 模拟粘贴快捷键
        const isMac = process.platform === 'darwin';
        robotjs_1.default.keyTap('v', isMac ? 'command' : 'control');
        // 恢复原始剪贴板内容
        setTimeout(() => {
            electron_1.clipboard.writeText(originalClipboard);
        }, 150);
    });
    // 注销所有快捷键
    electron_1.ipcMain.on('unregister-all-shortcuts', () => {
        electron_1.globalShortcut.unregisterAll();
    });
    // 控制悬浮窗
    electron_1.ipcMain.on('show-overlay', () => {
        overlayWindow === null || overlayWindow === void 0 ? void 0 : overlayWindow.show();
    });
    electron_1.ipcMain.on('hide-overlay', () => {
        overlayWindow === null || overlayWindow === void 0 ? void 0 : overlayWindow.hide();
    });
    // 更新悬浮窗内容
    electron_1.ipcMain.on('update-overlay', (event, state) => {
        overlayWindow === null || overlayWindow === void 0 ? void 0 : overlayWindow.webContents.send('recording-state-changed', state);
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('will-quit', () => {
    // 注销所有快捷键
    electron_1.globalShortcut.unregisterAll();
});
