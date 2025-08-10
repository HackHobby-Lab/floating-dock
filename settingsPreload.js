const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
  getLinks: () => ipcRenderer.invoke('get-links'),
  saveLinks: (links) => ipcRenderer.send('save-links', links)
});