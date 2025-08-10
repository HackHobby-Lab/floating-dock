const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let settingsWindow;

const LINKS_FILE = path.join(app.getPath('userData'), 'links.json');

function loadLinks() {
  try {
    const raw = fs.readFileSync(LINKS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [
      { name: 'Google Docs', url: 'https://docs.google.com/' },
      { name: 'Google Sheets', url: 'https://sheets.google.com/' },
      { name: 'GitHub', url: 'https://github.com/' }
    ];
  }
}

function saveLinks(links) {
  try {
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
  } catch (e) {
    console.error('Failed to save links:', e);
  }
  // notify main window
  if (mainWindow) mainWindow.webContents.send('update-links', links);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 300,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // send initial links once ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('update-links', loadLinks());
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 420,
    title: 'Dock Settings',
    parent: mainWindow,
    modal: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'settingsPreload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile('settings.html');

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  ipcMain.on('open-settings', () => {
    createSettingsWindow();
  });

  ipcMain.handle('get-links', () => {
    return loadLinks();
  });

  ipcMain.on('save-links', (event, links) => {
    // basic validation: array of objects with name & url
    if (Array.isArray(links)) {
      const valid = links.filter(l => l && l.name && l.url);
      saveLinks(valid);
    }
  });
  ipcMain.on('update-links', (event, links) => {
  // Save the links.json
  const fs = require('fs');
  fs.writeFileSync(path.join(__dirname, 'links.json'), JSON.stringify(links, null, 2));

  // Tell the main window to reload its links
  if (mainWindow) {
    mainWindow.webContents.send('links-updated', links);
  }
});


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});