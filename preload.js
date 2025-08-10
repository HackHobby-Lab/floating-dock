const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // openExternal: (url) => shell.openExternal(url),
  //   openExternal: (url) => shell.openExternal(link.url),
  openSettings: () => ipcRenderer.send('open-settings'),
  onUpdateLinks: (cb) => ipcRenderer.on('update-links', (e, links) => cb(links)),
  onLinksUpdated: (callback) => ipcRenderer.on('links-updated', (event, links) => callback(links))

});