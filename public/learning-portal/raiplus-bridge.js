/* Rai Plus ERP â†” Learning Portal Bridge
   Connects the embedded Classes 6â€“12 Learning Portal directly to Rai Plus's
   authenticated, multi-tenant backend (/api/learning-portal/*). */
(function () {
  function getAuthHeaders() {
    var headers = { 'Content-Type': 'application/json' };
    try {
      var frameToken = window.frameElement && window.frameElement.dataset && window.frameElement.dataset.token;
      var storedToken = window.sessionStorage && window.sessionStorage.getItem('rai_plus_token');
      var tok = frameToken || storedToken || '';
      if (tok) {
        headers['Authorization'] = 'Bearer ' + tok;
      }
    } catch (_err) {
      // Cross-origin or sandboxed frame fallback relies on HttpOnly cookie
    }
    return headers;
  }

  async function apiJson(url, options) {
    var opts = Object.assign(
      {
        credentials: 'same-origin',
        headers: getAuthHeaders(),
      },
      options || {},
    );
    var res = await fetch(url, opts);
    if (!res.ok) {
      var msg = 'HTTP ' + res.status;
      try {
        var body = await res.json();
        if (body && body.error) msg = body.error;
      } catch (_e) {}
      var err = new Error(msg);
      err.code = res.status;
      throw err;
    }
    return res.json();
  }

  function updateSchoolBanner(user) {
    if (!user) return;
    var el = document.querySelector('.school');
    if (el && user.schoolName) {
      var parts = [user.schoolName];
      var boardSession = [user.schoolBoard, user.schoolSession].filter(Boolean).join(' ');
      if (boardSession) parts.push(boardSession);
      el.textContent = parts.join(' Â· ');
    }
    if (user.schoolName) {
      document.title = 'Rai Plus Â· ' + user.schoolName + ' Learning Portal';
    }
  }

  window.RaiPlusBridge = {
    async getUser() {
      var user = await apiJson('/api/learning-portal/me', { method: 'GET' });
      updateSchoolBanner(user);
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: 'RAI_LP_READY',
              user: {
                id: user.id,
                name: user.name,
                role: user.role,
                raiRole: user.raiRole,
                schoolName: user.schoolName,
                restrictions: user.restrictions || null,
              },
              hash: window.location.hash || '#home',
            },
            window.location.origin,
          );
        }
      } catch (_e) {}
      return user;
    },

    async get(path) {
      var res = await apiJson('/api/learning-portal/doc?path=' + encodeURIComponent(path), {
        method: 'GET',
      });
      return res && res.exists ? res.data : null;
    },

    async set(path, data) {
      await apiJson('/api/learning-portal/doc', {
        method: 'PUT',
        body: JSON.stringify({ path: path, data: data }),
      });
    },

    async query(coll) {
      var res = await apiJson('/api/learning-portal/collection?name=' + encodeURIComponent(coll), {
        method: 'GET',
      });
      return (res && Array.isArray(res.docs)) ? res.docs : [];
    },

    async names(ids) {
      if (!Array.isArray(ids) || ids.length === 0) return {};
      var res = await apiJson('/api/learning-portal/names', {
        method: 'POST',
        body: JSON.stringify({ ids: ids }),
      });
      return (res && res.names) || {};
    },
  };

  // Allow parent Rai Plus ERP shell to navigate tabs cleanly without reloading the iframe
  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return;
    var payload = event.data;
    if (!payload || typeof payload !== 'object') return;
    if (payload.type === 'RAI_LP_NAV' && typeof payload.hash === 'string') {
      var target = payload.hash.charAt(0) === '#' ? payload.hash : '#' + payload.hash;
      if (window.location.hash !== target) {
        window.location.hash = target;
      }
    }
  });

  window.addEventListener('hashchange', function () {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: 'RAI_LP_STATE', hash: window.location.hash || '#home' },
          window.location.origin,
        );
      }
    } catch (_e) {}
  });
})();
