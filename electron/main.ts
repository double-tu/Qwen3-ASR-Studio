// electron/main.ts
import { app, BrowserWindow, ipcMain, globalShortcut, screen, clipboard } from 'electron';
import path from 'path';
import robot from 'robotjs';

// 主窗口引用
let mainWindow: BrowserWindow | null;
// 悬浮窗引用
let overlayWindow: BrowserWindow | null;

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
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
      preload: path.join(__dirname, 'preload.js'),
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
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 改为加载 Vite 开发服务器的 URL
  // mainWindow.loadFile('renderer/index.html');
  mainWindow.loadURL('http://localhost:5173');

  // 打开开发者工具
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  createOverlayWindow(); // 创建悬浮窗

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 注册全局快捷键
  ipcMain.on('register-shortcut', (event, shortcut) => {
    if (globalShortcut.isRegistered(shortcut)) {
      globalShortcut.unregister(shortcut);
    }
    const ret = globalShortcut.register(shortcut, () => {
      mainWindow?.webContents.send('shortcut-triggered');
    });

    if (!ret) {
      console.log('registration failed');
    }
  });

  // 接收到最终文本并粘贴
  ipcMain.on('paste-text', (event, text) => {
    const originalClipboard = clipboard.readText();
    clipboard.writeText(text);

    // 模拟粘贴快捷键
    const isMac = process.platform === 'darwin';
    robot.keyTap('v', isMac ? 'command' : 'control');

    // 恢复原始剪贴板内容
    setTimeout(() => {
        clipboard.writeText(originalClipboard);
    }, 150);
  });

  // 注销所有快捷键
  ipcMain.on('unregister-all-shortcuts', () => {
    globalShortcut.unregisterAll();
  });

  // 控制悬浮窗
  ipcMain.on('show-overlay', () => {
    overlayWindow?.show();
  });

  ipcMain.on('hide-overlay', () => {
    overlayWindow?.hide();
  });

  // 更新悬浮窗内容
  ipcMain.on('update-overlay', (event, state) => {
    overlayWindow?.webContents.send('recording-state-changed', state);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
});
