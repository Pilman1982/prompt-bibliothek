/*
 * Prompt-Bibliothek: Datenzugriff.
 *
 * GitHub-Modus: Die Prompts liegen als JSON-Datei im GitHub-Repo.
 *   Lesen: Datei von GitHub Pages, bei jedem Laden frisch (kein Zwischenspeicher).
 *   Schreiben: über die GitHub-API mit einem Zugangsschlüssel (Fine-grained Token).
 *   Master-Passwort: entschlüsselt den Schlüssel, der verschlüsselt im Repo liegt.
 * Demo-Modus: Daten nur in diesem Browser (bei Doppelklick auf index.html oder mit ?demo=1).
 *
 * Gemeinsame Schnittstelle:
 *   subscribe(onData, onError), refresh(), onAuth(cb), resume(), login(eingabe, merken), logout(),
 *   setMasterPassword(pw), save(prompt), remove(id), importPrompts(liste, ersetzen)
 */
(function (root) {
  'use strict';

  const E = root.PBEngine;
  const TOKEN_KEY = 'pb-gh-token';

  const makeError = (code, message, status) => {
    const err = new Error(message);
    err.code = code;
    if (status) err.status = status;
    return err;
  };

  // ---------- GitHub ----------

  function createGithubStore(cfg) {
    const gh = cfg.github;
    const API = 'https://api.github.com/repos/' + gh.owner + '/' + gh.repo;
    const encodePath = p => p.split('/').map(encodeURIComponent).join('/');
    const dataListeners = [];
    const errorListeners = [];
    const authListeners = [];
    let token = readToken();
    let sha = null;

    function readToken() {
      try { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
    }
    function storeToken(t, remember) {
      try {
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        if (t) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, t);
      } catch (e) { /* Speicher blockiert: Edit-Modus gilt nur bis zum Neuladen */ }
    }
    const setAuth = on => authListeners.forEach(cb => cb(on));
    const publish = list => dataListeners.forEach(cb => cb(list.slice()));

    async function api(path, opts, asText) {
      opts = opts || {};
      const headers = Object.assign({ Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + (opts.token || token) }, opts.headers || {});
      let res;
      try {
        res = await fetch(API + path, { method: opts.method || 'GET', headers, body: opts.body, cache: 'no-store' });
      } catch (e) {
        throw makeError('gh/network', 'Keine Verbindung zu GitHub.');
      }
      if (!res.ok) {
        let msg = '';
        try { msg = (await res.json()).message || ''; } catch (e) { /* keine Details */ }
        throw makeError('gh/' + res.status, msg || res.statusText, res.status);
      }
      return asText ? res.text() : res.json();
    }

    /** Öffentlich lesen (GitHub Pages), immer frisch. */
    async function loadPublic() {
      let res;
      try {
        res = await fetch(gh.dataPath + '?t=' + Date.now(), { cache: 'no-store' });
      } catch (e) {
        throw makeError('gh/network', 'Keine Verbindung. Die Prompts konnten nicht geladen werden.');
      }
      if (res.status === 404) return [];
      if (!res.ok) throw makeError('gh/' + res.status, 'Die Prompts konnten nicht geladen werden (' + res.status + ').', res.status);
      return E.parseBackup(await res.text()).prompts;
    }

    /** Über die API lesen: aktuellster Stand (ohne Verzögerung durch GitHub Pages) samt Versionskennung. */
    async function loadViaApi() {
      const path = '/contents/' + encodePath(gh.dataPath) + '?ref=' + encodeURIComponent(gh.branch);
      let meta;
      try {
        meta = await api(path);
      } catch (e) {
        if (e.status === 404) { sha = null; return []; }
        throw e;
      }
      sha = meta.sha;
      const text = meta.encoding === 'base64' && meta.content
        ? E.b64ToUtf8(meta.content)
        : await api(path, { headers: { Accept: 'application/vnd.github.raw+json' } }, true); // Dateien über 1 MB
      return E.parseBackup(text).prompts;
    }

    async function writeFile(path, text, prevSha, message) {
      const body = { message, content: E.utf8ToB64(text), branch: gh.branch };
      if (prevSha) body.sha = prevSha;
      const res = await api('/contents/' + encodePath(path), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return res.content.sha;
    }

    /** Liest den neusten Stand, wendet die Änderung an und schreibt zurück. Bei gleichzeitiger Änderung: neu versuchen. */
    async function mutate(change, message) {
      if (!token) throw makeError('permission-denied', 'Nicht im Edit-Modus.');
      for (let attempt = 0; attempt < 3; attempt++) {
        const next = change(await loadViaApi());
        const text = JSON.stringify(E.buildBackup(next), null, 2) + '\n';
        try {
          sha = await writeFile(gh.dataPath, text, sha, typeof message === 'function' ? message() : message);
          publish(next);
          return;
        } catch (e) {
          const conflict = e.status === 409 || (e.status === 422 && /sha/i.test(e.message));
          if (!conflict) throw e;
        }
      }
      throw makeError('gh/conflict', 'Jemand hat gleichzeitig gespeichert. Bitte nochmals versuchen.');
    }

    async function verifyToken(t) {
      try {
        await api('', { token: t });
      } catch (e) {
        if (e.status === 401) throw makeError('gh/401', 'Der GitHub-Schlüssel ist ungültig oder abgelaufen.', 401);
        if (e.status === 404 || e.status === 403) throw makeError('gh/no-repo', 'Der GitHub-Schlüssel hat keinen Zugriff auf das Repo ' + gh.owner + '/' + gh.repo + '.', e.status);
        throw e;
      }
    }

    async function loadAccessFile() {
      let res;
      try {
        res = await fetch(gh.accessPath + '?t=' + Date.now(), { cache: 'no-store' });
      } catch (e) {
        throw makeError('gh/network', 'Keine Verbindung zu GitHub.');
      }
      if (res.status === 404) return null;
      if (!res.ok) throw makeError('gh/' + res.status, 'Die Zugangsdatei konnte nicht geladen werden.', res.status);
      return res.json();
    }

    async function load() {
      return token ? loadViaApi() : loadPublic();
    }

    const store = {
      mode: 'github',
      saveNote: ' Für alle sichtbar in etwa einer Minute.',
      historyUrl: 'https://github.com/' + gh.owner + '/' + gh.repo + '/commits/' + gh.branch + '/' + gh.dataPath,

      subscribe(onData, onError) {
        dataListeners.push(onData);
        if (onError) errorListeners.push(onError);
        store.refresh();
      },

      async refresh() {
        try {
          publish(await load());
        } catch (e) {
          if (token && (e.status === 401 || e.status === 403)) {
            // Schlüssel ungültig geworden: öffentlich weiterlesen
            token = '';
            storeToken('');
            setAuth(false);
            return store.refresh();
          }
          errorListeners.forEach(cb => cb(e));
        }
      },

      onAuth(cb) {
        authListeners.push(cb);
        cb(!!token);
      },

      /** Prüft einen gespeicherten Schlüssel beim Start. Liefert 'expired', wenn er nicht mehr gilt. */
      async resume() {
        if (!token) return null;
        try {
          await verifyToken(token);
          return 'ok';
        } catch (e) {
          if (e.code === 'gh/network') return null;
          token = '';
          storeToken('');
          setAuth(false);
          return 'expired';
        }
      },

      async login(input, remember) {
        let t = String(input || '').trim();
        if (!t) throw makeError('auth/missing-password', 'Bitte Passwort eingeben.');
        if (!E.looksLikeToken(t)) {
          const blob = await loadAccessFile();
          if (!blob) throw makeError('auth/no-master', 'Es ist noch kein Master-Passwort eingerichtet. Melde dich einmal mit dem GitHub-Schlüssel an (siehe Anleitung).');
          try {
            t = await E.openSecret(blob, t);
          } catch (e) {
            throw makeError('auth/wrong-password', 'Falsches Passwort.');
          }
        }
        await verifyToken(t);
        token = t;
        storeToken(t, remember);
        setAuth(true);
        store.refresh(); // ab jetzt über die API lesen: zeigt eigene Änderungen sofort
      },

      async logout() {
        token = '';
        storeToken('');
        setAuth(false);
      },

      async setMasterPassword(pw) {
        if (!token) throw makeError('permission-denied', 'Nicht im Edit-Modus.');
        const blob = await E.sealSecret(token, pw);
        let prevSha = null;
        try {
          prevSha = (await api('/contents/' + encodePath(gh.accessPath) + '?ref=' + encodeURIComponent(gh.branch))).sha;
        } catch (e) {
          if (e.status !== 404) throw e;
        }
        await writeFile(gh.accessPath, JSON.stringify(blob, null, 2) + '\n', prevSha, 'Master-Passwort geändert');
      },

      save(p) {
        return mutate(list => list.filter(x => x.id !== p.id).concat([p]), 'Prompt «' + p.title + '» gespeichert');
      },

      remove(id) {
        let title = id;
        return mutate(list => {
          const hit = list.find(x => x.id === id);
          if (hit) title = hit.title;
          return list.filter(x => x.id !== id);
        }, () => 'Prompt «' + title + '» gelöscht');
      },

      importPrompts(list, replace) {
        const n = list.length + (list.length === 1 ? ' Prompt' : ' Prompts');
        return mutate(current => {
          if (replace) return list.slice();
          const ids = new Set(list.map(p => p.id));
          return current.filter(p => !ids.has(p.id)).concat(list);
        }, replace ? 'Backup eingespielt (alles ersetzt, ' + n + ')' : n + ' importiert');
      }
    };
    return store;
  }

  // ---------- Demo (nur dieser Browser) ----------

  function createDemoStore() {
    const DATA_KEY = 'pb-demo-prompts';
    const EDIT_KEY = 'pb-demo-edit';
    const DEMO_PASSWORD = 'demo';
    const dataListeners = [];
    const authListeners = [];

    const read = (storage, key) => { try { return storage.getItem(key); } catch (e) { return null; } };
    const write = (storage, key, val) => { try { storage.setItem(key, val); } catch (e) { /* Speicher blockiert */ } };

    let data = null;
    try { data = JSON.parse(read(localStorage, DATA_KEY)); } catch (e) { data = null; }
    if (!Array.isArray(data)) {
      const now = new Date().toISOString();
      data = (root.PB_SAMPLES || []).map(p => E.cleanPrompt(p, now)).filter(Boolean);
    }
    let edit = read(sessionStorage, EDIT_KEY) === '1';

    const copy = () => JSON.parse(JSON.stringify(data));
    const publish = () => {
      write(localStorage, DATA_KEY, JSON.stringify(data));
      dataListeners.forEach(cb => cb(copy()));
    };
    const setEdit = on => {
      edit = on;
      write(sessionStorage, EDIT_KEY, on ? '1' : '0');
      authListeners.forEach(cb => cb(on));
    };
    const requireEdit = () => {
      if (!edit) throw makeError('permission-denied', 'Keine Berechtigung.');
    };
    const upsert = p => {
      const i = data.findIndex(x => x.id === p.id);
      if (i >= 0) data[i] = p; else data.push(p);
    };

    const store = {
      mode: 'demo',
      saveNote: '',
      historyUrl: '',
      subscribe(onData) {
        dataListeners.push(onData);
        setTimeout(() => onData(copy()), 0);
      },
      async refresh() {
        dataListeners.forEach(cb => cb(copy()));
      },
      onAuth(cb) {
        authListeners.push(cb);
        cb(edit);
      },
      async resume() { return null; },
      async login(pw) {
        if (String(pw).trim() !== DEMO_PASSWORD) throw makeError('auth/wrong-password', 'Falsches Passwort.');
        setEdit(true);
      },
      async logout() { setEdit(false); },
      async setMasterPassword() {
        throw makeError('demo', 'Im Demo-Modus ist das Passwort fest auf «demo» gesetzt.');
      },
      async save(p) { requireEdit(); upsert(p); publish(); },
      async remove(id) { requireEdit(); data = data.filter(x => x.id !== id); publish(); },
      async importPrompts(list, replace) {
        requireEdit();
        if (replace) data = [];
        list.forEach(upsert);
        publish();
      }
    };
    return store;
  }

  root.PBStore = {
    create(cfg) {
      const gh = cfg && cfg.github;
      const demo = location.protocol === 'file:' || /[?&]demo=1\b/.test(location.search) || !(gh && gh.owner && gh.repo);
      return demo ? createDemoStore() : createGithubStore(cfg);
    }
  };
})(window);
