
// receive links and render them
function renderLinks(links) {
   
  const container = document.getElementById('linksContainer');
  container.innerHTML = '';
  links.forEach(link => {
    const a = document.createElement('a');
    a.className = 'button';
    a.href = link.url;
    a.innerHTML = `<img class="icon" src="" alt=""> <span>${link.name}</span>`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.dockAPI && typeof window.dockAPI.openExternal === 'function') {
        window.dockAPI.openExternal(link.url);
      } else if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
        window.electronAPI.openExternal(link.url);
      } else if (window.require) {
        // Fallback for Electron renderer process
        const { shell } = window.require('electron');
        shell.openExternal(link.url);
      } else {
        window.open(link.url, '_blank');
      }
    });
    container.appendChild(a);
  });
}

// hook settings button
const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    window.electronAPI.openSettings();
  });
}

// listen for updates from main
window.electronAPI.onUpdateLinks((links) => {
  renderLinks(links || []);
});