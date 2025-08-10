// renderer.js (robust favicon + debugging)
// Put this file in the same place as your index.html

(function () {
  // Inline SVG fallback (no external asset needed)
  const DEFAULT_FAV = 'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
         <rect width="100%" height="100%" fill="#666" rx="6" />
         <text x="50%" y="50%" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="central">🔗</text>
       </svg>`
    );

  function normalizeUrl(raw) {
    if (!raw) return '';
    try {
      // if it's already a full URL this will succeed
      new URL(raw);
      return raw;
    } catch (e) {
      // try adding https://
      try {
        new URL('https://' + raw);
        return 'https://' + raw;
      } catch (e2) {
        // give up, return raw
        return raw;
      }
    }
  }

  function createLinkElement(rawUrl, title) {
    const url = normalizeUrl(rawUrl);
    let domain = rawUrl;
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      console.warn('createLinkElement: invalid URL', rawUrl);
    }

    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

    const img = document.createElement('img');
    img.className = 'icon';
    img.alt = '';
    img.width = 34;
    img.height = 34;
    img.src = faviconUrl;

    img.onerror = () => {
      img.onerror = null;
      img.src = DEFAULT_FAV;
    };

    const a = document.createElement('a');
    a.className = 'button';
    a.href = url;
    a.title = url;

    a.appendChild(img);

    a.addEventListener('click', (e) => {
      e.preventDefault();
      // try the preferred API order you already use
      if (window.dockAPI && typeof window.dockAPI.openExternal === 'function') {
        window.dockAPI.openExternal(url);
      } else if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
        window.electronAPI.openExternal(url);
      } else if (window.require) {
        // last resort (only if nodeIntegration is enabled)
        const { shell } = window.require('electron');
        shell.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    });

    return a;
  }

  function renderLinks(links) {
    console.log('[renderer] renderLinks called, links:', links);
    const container = document.getElementById('linksContainer');
    if (!container) {
      console.error('[renderer] No #linksContainer found in DOM');
      return;
    }
    container.innerHTML = '';

    links.forEach(link => {
      // safe guard: ensure link object has url
      if (!link || !link.url) return;
      const el = createLinkElement(link.url, link.name || link.title || '');
      container.appendChild(el);
    });
  }

  // fallback default links (in case main doesn't send anything)
  const defaultLinks = [
    { name: 'Google Docs', url: 'https://docs.google.com/document/' },
    { name: 'Google Sheets', url: 'https://sheets.google.com/' },
    { name: 'GitHub', url: 'https://github.com/' }
  ];

  // initial render with defaults
  renderLinks(defaultLinks);

  // subscribe to updates from main process
  if (window.electronAPI && typeof window.electronAPI.onUpdateLinks === 'function') {
    window.electronAPI.onUpdateLinks((links) => {
      console.log('[renderer] received update-links from main', links);
      renderLinks(links && links.length ? links : defaultLinks);
    });
  } else {
    console.warn('[renderer] electronAPI.onUpdateLinks not available — ensure preload exposes it');
  }

  // settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      if (window.electronAPI && typeof window.electronAPI.openSettings === 'function') {
        window.electronAPI.openSettings();
      } else {
        console.warn('[renderer] openSettings not available on electronAPI');
      }
    });
  } else {
    console.warn('[renderer] settingsBtn not found');
  }
})();
