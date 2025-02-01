const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const store = new Store();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'icon.png')
    });

    // تحميل الإعدادات المحفوظة
    const savedState = store.get('windowState');
    if (savedState) mainWindow.setBounds(savedState);

    mainWindow.loadFile('index.html');

    // حفظ حالة النافذة عند الإغلاق
    mainWindow.on('close', () => {
        store.set('windowState', mainWindow.getBounds());
    });
}

// إدارة الملفات
ipcMain.handle('show-save-dialog', async (event, defaultPath) => {
    const { filePath } = await dialog.showSaveDialog({
        defaultPath: defaultPath || 'untitled.md',
        filters: [{ name: 'Markdown Files', extensions: ['md'] }]
    });
    return filePath;
});

ipcMain.handle('show-open-dialog', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Markdown Files', extensions: ['md'] }]
    });
    return filePaths[0];
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});