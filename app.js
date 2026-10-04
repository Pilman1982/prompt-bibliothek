/* Prompt-Bibliothek: Benutzeroberfläche */
(function () {
  'use strict';

  const E = window.PBEngine;
  const CFG = window.PB_CONFIG || {};
  const LS_AUTHOR = 'pb-last-author';
  const LS_SORT = 'pb-sort';

  // ---------- Hilfsfunktionen ----------

  const ICONS = {
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 7h7M9 11h5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    settings: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>'
  };
  const icon = name => '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* nicht kritisch */ } };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const deepCopy = o => JSON.parse(JSON.stringify(o));
  const count = (n, one, many) => n + ' ' + (n === 1 ? one : many);

  function catHue(category) {
    const i = (CFG.categories || []).indexOf(category);
    return i >= 0 ? Math.round((222 + i * 137.5) % 360) : E.hue(category);
  }
  const badge = c => '<span class="badge" style="--h:' + catHue(c) + '">' + esc(c) + '</span>';

  function friendlyError(err) {
    const code = (err && err.code) || '';
    const map = {
      'permission-denied': 'Keine Berechtigung. Bitte zuerst in den Edit-Modus wechseln.',
      'gh/401': 'Der GitHub-Schlüssel ist ungültig oder abgelaufen. Bitte neu anmelden (siehe Anleitung, Abschnitt «Schlüssel erneuern»).',
      'gh/403': 'GitHub verweigert das Speichern. Der Schlüssel braucht die Berechtigung «Contents: Read and write» für dieses Repo.',
      'gh/404': 'Repo oder Datei auf GitHub nicht gefunden. Stimmen Benutzer- und Repo-Name in config.js?',
      'gh/422': 'GitHub hat die Änderung abgelehnt: ' + ((err && err.message) || '')
    };
    return map[code] || (err && err.message) || String(err);
  }

  function toast(msg, type) {
    const box = $('#toasts');
    if (box.showPopover) {
      // nach oben in die oberste Ebene holen, damit Meldungen auch über offenen Dialogen sichtbar sind
      try { if (box.matches(':popover-open')) box.hidePopover(); box.showPopover(); } catch (e) { /* ältere Browser */ }
    }
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 250);
    }, type === 'error' ? 6000 : 3200);
  }

  function showError(msg) {
    const b = $('#errorBanner');
    b.textContent = msg;
    b.hidden = !msg;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      ($('dialog[open]') || document.body).appendChild(ta); // in offenen Dialog, sonst ist das Feld inaktiv
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  function download(filename, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function setBusy(btn, on) {
    if (!btn) return;
    btn.disabled = on;
    btn.classList.toggle('is-busy', on);
  }

  function confirmBox(message, okLabel, danger) {
    const d = $('#confirmDialog');
    $('#confirmText').textContent = message;
    const ok = $('#confirmOk');
    ok.textContent = okLabel || 'OK';
    ok.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
    d.returnValue = '';
    d.showModal();
    (danger ? $('#confirmCancel') : ok).focus();
    return new Promise(resolve => d.addEventListener('close', () => resolve(d.returnValue === 'ok'), { once: true }));
  }

  // ---------- Zustand ----------

  const state = {
    store: null,
    prompts: [],
    index: new Map(), // id → Suchtext
    edit: false,
    loaded: false,
    query: '',
    category: '',
    author: '',
    sort: lsGet(LS_SORT) === 'updated' ? 'updated' : 'title'
  };
  const byId = id => state.prompts.find(p => p.id === id);

  function onData(list) {
    state.prompts = list.map(p => E.cleanPrompt(p, '')).filter(Boolean);
    state.index = new Map(state.prompts.map(p => [p.id, E.searchText(p)]));
    const firstLoad = !state.loaded;
    state.loaded = true;
    state.lastLoad = Date.now();
    state.loadError = false;
    showError('');
    renderAll();
    if (firstLoad) openFromHash();
  }

  function setEdit(on) {
    state.edit = on;
    document.body.classList.toggle('is-edit', on);
    $('#editBadge').hidden = !on;
    $('#btnNew').hidden = !on;
    $('#menuWrap').hidden = !on;
    $('#useEdit').hidden = !on;
    const lock = $('#btnLock');
    lock.innerHTML = on ? icon('unlock') + '<span class="btn-label">Edit-Modus beenden</span>' : icon('lock') + '<span class="btn-label">Bearbeiten</span>';
    lock.title = on ? 'Edit-Modus beenden' : 'In den Edit-Modus wechseln';
    renderGrid();
  }

  // ---------- Liste, Filter, Suche ----------

  function filteredPrompts(ignoreCategory) {
    const tokens = E.tokenize(state.query);
    const list = state.prompts.filter(p =>
      (ignoreCategory || !state.category || p.category === state.category) &&
      (!state.author || p.author === state.author) &&
      E.matches(state.index.get(p.id) || '', tokens));
    if (state.sort === 'updated') list.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    else list.sort((a, b) => E.collator.compare(a.title, b.title));
    return list;
  }

  function renderAll() {
    renderChips();
    renderAuthors();
    renderGrid();
  }

  function renderChips() {
    const counts = new Map();
    filteredPrompts(true).forEach(p => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    const cats = [...new Set(state.prompts.map(p => p.category))].sort(E.collator.compare);
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    const chip = (value, label, n, dot) =>
      '<button type="button" class="chip' + (state.category === value ? ' active' : '') + '" data-cat="' + esc(value) + '"' +
      (dot ? ' style="--h:' + catHue(value) + '"' : '') + '>' + (dot ? '<span class="dot"></span>' : '') +
      esc(label) + ' <span class="n">' + n + '</span></button>';
    $('#chips').innerHTML = chip('', 'Alle', total, false) + cats.map(c => chip(c, c, counts.get(c) || 0, true)).join('');
  }

  function renderAuthors() {
    const authors = [...new Set(state.prompts.map(p => p.author))].sort(E.collator.compare);
    if (state.author && !authors.includes(state.author)) state.author = '';
    $('#authorFilter').innerHTML = '<option value="">Alle Personen</option>' +
      authors.map(a => '<option' + (a === state.author ? ' selected' : '') + '>' + esc(a) + '</option>').join('');
  }

  function cardHTML(p) {
    const n = p.fields.length;
    const actions = state.edit
      ? '<div class="card-actions">' +
        '<button type="button" class="icon-btn" data-action="edit" title="Bearbeiten" aria-label="Bearbeiten">' + icon('pencil') + '</button>' +
        '<button type="button" class="icon-btn" data-action="duplicate" title="Duplizieren" aria-label="Duplizieren">' + icon('copy') + '</button>' +
        '<button type="button" class="icon-btn danger" data-action="delete" title="Löschen" aria-label="Löschen">' + icon('trash') + '</button>' +
        '</div>'
      : '';
    return '<article class="card" data-id="' + esc(p.id) + '" tabindex="0">' +
      '<div class="card-top">' + badge(p.category) + actions + '</div>' +
      '<h3 class="card-title">' + esc(p.title) + '</h3>' +
      (p.description ? '<p class="card-desc">' + esc(p.description) + '</p>' : '') +
      '<div class="card-meta"><span>' + icon('user') + esc(p.author) + '</span><span>' + icon('help') + count(n, 'Frage', 'Fragen') + '</span></div>' +
      (p.tags.length ? '<div class="card-tags">' + p.tags.map(t => '<span>#' + esc(t) + '</span>').join('') + '</div>' : '') +
      '</article>';
  }

  function renderGrid() {
    const grid = $('#grid');
    const empty = $('#empty');
    const info = $('#resultInfo');
    if (!state.loaded) {
      grid.innerHTML = '';
      info.textContent = 'Prompts werden geladen …';
      empty.hidden = true;
      return;
    }
    const list = filteredPrompts(false);
    const total = state.prompts.length;
    const filtered = list.length !== total;
    info.textContent = total ? (filtered ? list.length + ' von ' + count(total, 'Prompt', 'Prompts') : count(total, 'Prompt', 'Prompts')) : '';
    grid.innerHTML = list.map(cardHTML).join('');

    if (list.length) { empty.hidden = true; return; }
    empty.hidden = false;
    if (!total && state.loadError) {
      empty.innerHTML = '<h2>Prompts nicht erreichbar</h2><p>Bitte Internetverbindung prüfen.</p>' +
        '<div class="row"><button type="button" class="btn btn-primary" data-empty="retry">Nochmals versuchen</button></div>';
    } else if (!total) {
      empty.innerHTML = '<h2>Noch keine Prompts</h2>' + (state.edit
        ? '<p>Lege den ersten Prompt an oder starte mit Beispielen.</p><div class="row">' +
          '<button type="button" class="btn btn-primary" data-empty="new">' + icon('plus') + 'Neuer Prompt</button>' +
          '<button type="button" class="btn" data-empty="samples">' + icon('sparkles') + 'Beispiel-Prompts laden</button>' +
          '<button type="button" class="btn" data-empty="import">' + icon('upload') + 'Backup importieren</button></div>'
        : '<p>Wechsle oben rechts in den Edit-Modus, um den ersten Prompt anzulegen.</p>');
    } else {
      empty.innerHTML = '<h2>Keine Treffer</h2><p>' + (state.query ? 'Für «' + esc(state.query) + '» wurde nichts gefunden.' : 'Für diese Filter wurde nichts gefunden.') +
        '</p><div class="row"><button type="button" class="btn" data-empty="reset">Filter zurücksetzen</button></div>';
    }
  }

  function resetFilters() {
    state.query = '';
    state.category = '';
    state.author = '';
    $('#search').value = '';
    renderAll();
  }

  // ---------- Prompt nutzen ----------

  let current = null;

  function fieldInputHTML(f, i) {
    const id = 'ans-' + i;
    const req = f.required ? ' required' : '';
    const label = '<label for="' + id + '">' + esc(f.label) +
      (f.required ? ' <span class="req" title="Pflichtfeld">*</span>' : '<span class="opt">optional</span>') + '</label>';
    let input;
    if (f.type === 'textarea') {
      input = '<textarea id="' + id + '" name="' + esc(f.key) + '" rows="3" placeholder="' + esc(f.placeholder) + '"' + req + '>' + esc(f.default) + '</textarea>';
    } else if (f.type === 'select') {
      input = '<select id="' + id + '" name="' + esc(f.key) + '"' + req + '><option value="">' + (f.required ? 'Bitte wählen …' : '(keine Angabe)') + '</option>' +
        (f.options || []).map(o => '<option' + (o === f.default ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
    } else {
      input = '<input id="' + id + '" name="' + esc(f.key) + '" type="text" autocomplete="off" placeholder="' + esc(f.placeholder) + '" value="' + esc(f.default) + '"' + req + '>';
    }
    return '<div class="q">' + label + input + '</div>';
  }

  function openUse(p) {
    current = p;
    $('#useTitle').textContent = p.title;
    $('#useMeta').innerHTML = badge(p.category) + '<span>' + icon('user') + esc(p.author) + '</span>';
    $('#useDesc').textContent = p.description;
    $('#useDesc').hidden = !p.description;
    $('#answerForm').innerHTML = p.fields.length
      ? p.fields.map(fieldInputHTML).join('')
      : '<p class="muted">Dieser Prompt hat keine Fragen. Du kannst ihn direkt erstellen.</p>';
    $('#resultText').value = '';
    $('#resultBox').classList.remove('has-result');
    $('#copyAgain').disabled = true;
    $('#shareResult').disabled = true;
    const d = $('#useDialog');
    if (!d.open) d.showModal();
    pushDialogEntry('#p=' + encodeURIComponent(p.id));
    $('.dlg-body', d).scrollTop = 0;
    $$('#answerForm textarea').forEach(autoGrow);
    // Am Handy nicht sofort die Tastatur aufklappen
    const first = $('#answerForm [name]');
    if (first && !window.matchMedia('(pointer: coarse)').matches) first.focus();
  }

  function autoGrow(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight + 2, Math.round(window.innerHeight * 0.5)) + 'px';
    ta.style.overflowY = ta.scrollHeight + 2 > window.innerHeight * 0.5 ? 'auto' : 'hidden';
  }

  async function generate() {
    const form = $('#answerForm');
    const values = {};
    current.fields.forEach(f => {
      const el = form.elements.namedItem(f.key);
      if (!el) return;
      el.setCustomValidity(f.required && !el.value.trim() ? 'Bitte beantworte diese Frage.' : '');
      values[f.key] = el.value;
    });
    if (!form.reportValidity()) return;
    const text = E.render(current.template, values);
    const box = $('#resultBox');
    $('#resultText').value = text;
    box.classList.remove('has-result');
    void box.offsetWidth; // Animation neu starten
    box.classList.add('has-result');
    $('#copyAgain').disabled = false;
    $('#shareResult').disabled = false;
    if (window.matchMedia('(max-width: 860px)').matches) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const ok = await copyText(text);
    if (ok) toast('Mega-Prompt erstellt und in die Zwischenablage kopiert.', 'ok');
    else {
      toast('Mega-Prompt erstellt. Bitte manuell kopieren (Ctrl+C).', 'warn');
      $('#resultText').focus();
      $('#resultText').select();
    }
  }

  function openFromHash() {
    const m = location.hash.match(/^#p=(.+)$/);
    if (!m) return;
    // Direktlink: Übersicht als Grundlage, damit «Zurück» dorthin führt statt aus der App
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* egal */ }
    const p = byId(decodeURIComponent(m[1]));
    if (p) openUse(p);
    else toast('Der verlinkte Prompt existiert nicht mehr.', 'warn');
  }

  // ---------- Zurück-Taste ----------
  // Offene Vollbild-Ansichten (Prompt nutzen, Editor) erhalten einen eigenen Eintrag im Browser-Verlauf.
  // So schliesst die Zurück-Taste bzw. -Geste die Ansicht, statt die App zu verlassen.

  const PAGE_DIALOGS = ['#useDialog', '#editDialog'];
  let historyEntry = false;

  function pushDialogEntry(hash) {
    const url = location.pathname + location.search + (hash || '');
    try {
      if (historyEntry) history.replaceState({ pb: 1 }, '', url);
      else { history.pushState({ pb: 1 }, '', url); historyEntry = true; }
    } catch (e) { /* file:// in manchen Browsern */ }
  }

  /** Nach dem Schliessen per Knopf oder Esc den eigenen Verlaufseintrag wieder entfernen. */
  function releaseDialogEntry() {
    if (!historyEntry || PAGE_DIALOGS.some(s => $(s).open)) return;
    historyEntry = false;
    history.back();
  }

  function onPopState() {
    if (!historyEntry) return; // Eintrag schon entfernt, normale Navigation
    historyEntry = false;
    if ($('#editDialog').open) closeEditor(true);
    else if ($('#useDialog').open) $('#useDialog').close();
  }

  // ---------- Editor ----------

  let draft = null;
  let dirty = false;
  let templateCaret = null;

  function emptyPrompt() {
    return {
      id: E.newId(), title: '', description: '', category: state.category || '',
      author: lsGet(LS_AUTHOR) || '', tags: [], fields: [], template: '', createdAt: '', updatedAt: ''
    };
  }

  function duplicateOf(p) {
    const c = deepCopy(p);
    c.id = E.newId();
    c.title = p.title + ' (Kopie)';
    c.createdAt = '';
    c.updatedAt = '';
    return c;
  }

  function fillDatalists() {
    const cats = [...new Set([...(CFG.categories || []), ...state.prompts.map(p => p.category)])].sort(E.collator.compare);
    const authors = [...new Set(state.prompts.map(p => p.author))].sort(E.collator.compare);
    $('#dlCategories').innerHTML = cats.map(c => '<option value="' + esc(c) + '">').join('');
    $('#dlAuthors').innerHTML = authors.map(a => '<option value="' + esc(a) + '">').join('');
  }

  function openEditor(p, mode) {
    draft = deepCopy(p);
    dirty = mode === 'duplicate';
    templateCaret = null;
    $('#editHeading').textContent = mode === 'new' ? 'Neuer Prompt' : mode === 'duplicate' ? 'Prompt duplizieren' : 'Prompt bearbeiten';
    $('#edTitle').value = draft.title;
    $('#edCategory').value = draft.category;
    $('#edAuthor').value = draft.author;
    $('#edDesc').value = draft.description;
    $('#edTags').value = draft.tags.join(', ');
    $('#edTemplate').value = draft.template;
    $('#editErrors').textContent = '';
    fillDatalists();
    syncFieldsFromTemplate();
    renderFields();
    updateTemplateInfo();
    const d = $('#editDialog');
    d.showModal();
    pushDialogEntry('');
    $('.dlg-body', d).scrollTop = 0;
    if (!window.matchMedia('(pointer: coarse)').matches) $('#edTitle').focus();
  }

  async function closeEditor(fromBack) {
    if (dirty && !(await confirmBox('Ungespeicherte Änderungen verwerfen?', 'Verwerfen', true))) {
      if (fromBack) pushDialogEntry(''); // Zurück abgebrochen: Eintrag wiederherstellen
      return;
    }
    dirty = false;
    $('#editDialog').close();
  }

  /** Legt für neue Platzhalter automatisch Fragen an und entfernt unbenutzte, noch unveränderte Auto-Fragen. */
  function syncFieldsFromTemplate() {
    const keys = E.extractKeys(draft.template);
    const before = draft.fields.map(f => f.key).join('|');
    draft.fields = draft.fields.filter(f => !f._auto || keys.includes(f.key));
    keys.forEach(k => {
      if (!draft.fields.some(f => f.key === k)) {
        draft.fields.push({ key: k, label: E.labelFromKey(k), type: 'text', required: false, placeholder: '', default: '', _auto: true });
      }
    });
    return draft.fields.map(f => f.key).join('|') !== before;
  }

  function fieldRowHTML(f, i) {
    const last = draft.fields.length - 1;
    const opt = (v, label) => '<option value="' + v + '"' + (f.type === v ? ' selected' : '') + '>' + label + '</option>';
    const second = f.type === 'select'
      ? '<textarea data-prop="options" rows="3" placeholder="Optionen, eine pro Zeile">' + esc((f.options || []).join('\n')) + '</textarea>'
      : '<input data-prop="placeholder" value="' + esc(f.placeholder) + '" placeholder="Hinweis im leeren Feld (optional)">';
    return '<div class="frow" data-i="' + i + '">' +
      '<div class="frow-head">' +
        '<code class="frow-key">{{<input data-prop="key" value="' + esc(f.key) + '" size="' + Math.max(4, f.key.length) + '" spellcheck="false" aria-label="Name des Platzhalters">}}</code>' +
        '<select data-prop="type" aria-label="Feldtyp">' + opt('text', 'Kurztext') + opt('textarea', 'Langtext') + opt('select', 'Auswahl') + '</select>' +
        '<label class="check"><input type="checkbox" data-prop="required" aria-label="Pflichtfrage"' + (f.required ? ' checked' : '') + '>Pflicht</label>' +
        '<span class="spacer"></span>' +
        '<button type="button" class="icon-btn" data-act="up" title="Nach oben" aria-label="Nach oben"' + (i === 0 ? ' disabled' : '') + '>' + icon('up') + '</button>' +
        '<button type="button" class="icon-btn" data-act="down" title="Nach unten" aria-label="Nach unten"' + (i === last ? ' disabled' : '') + '>' + icon('down') + '</button>' +
        '<button type="button" class="icon-btn danger" data-act="del" title="Frage entfernen" aria-label="Frage entfernen">' + icon('trash') + '</button>' +
      '</div>' +
      '<input data-prop="label" value="' + esc(f.label) + '" placeholder="Frage, z. B. Was ist das genaue Thema?" aria-label="Fragetext">' +
      '<div class="frow-grid">' + second +
        '<input data-prop="default" value="' + esc(f.default) + '" placeholder="Vorausgefüllte Antwort (optional)" aria-label="Vorausgefüllte Antwort">' +
      '</div>' +
      '<div class="frow-warn" hidden></div>' +
    '</div>';
  }

  function renderFields() {
    $('#fieldList').innerHTML = draft.fields.length
      ? draft.fields.map(fieldRowHTML).join('')
      : '<p class="muted small">Noch keine Fragen. Schreibe einen Platzhalter wie <code>{{thema}}</code> ins Template oder füge eine Frage hinzu.</p>';
    $('#fieldCount').textContent = draft.fields.length;
    updateTemplateInfo();
  }

  /** Warnungen und Vorschau; ändert die Feldliste nicht (Fokus bleibt erhalten). */
  function updateTemplateInfo() {
    const keys = E.extractKeys(draft.template);
    $$('#fieldList .frow').forEach(row => {
      const f = draft.fields[Number(row.dataset.i)];
      const unused = !keys.includes(f.key);
      row.classList.toggle('is-unused', unused);
      const w = $('.frow-warn', row);
      w.hidden = !unused;
      w.innerHTML = unused ? 'Kommt im Template nicht vor. <button type="button" class="link-btn" data-act="insert">{{' + esc(f.key) + '}} einfügen</button>' : '';
    });
    const problems = E.checkTemplate(draft.template);
    $('#templateWarn').hidden = !problems.length;
    $('#templateWarn').textContent = problems.join(' ');

    // Vorschau: Antworten sind markiert, damit man sieht, wo was eingesetzt wird
    const values = {};
    draft.fields.forEach(f => {
      const sample = f.default || (f.type === 'select' && (f.options || []).find(o => o.trim())) || f.label || f.key;
      values[f.key] = '\u0001' + sample + '\u0002';
    });
    const text = E.render(draft.template, values);
    $('#edPreview').innerHTML = text ? esc(text).replace(/\u0001/g, '<mark>').replace(/\u0002/g, '</mark>') : '<span class="muted">Noch kein Template.</span>';
  }

  const syncDebounced = debounce(() => {
    if (draft && syncFieldsFromTemplate()) renderFields();
  }, 700);

  function insertIntoTemplate(text) {
    const ta = $('#edTemplate');
    const pos = templateCaret == null ? ta.value.length : templateCaret;
    const needsSpace = pos > 0 && !/\s$/.test(ta.value.slice(0, pos));
    ta.setRangeText((needsSpace ? ' ' : '') + text, pos, pos, 'end');
    draft.template = ta.value;
    templateCaret = ta.selectionEnd;
    dirty = true;
    updateTemplateInfo();
  }

  function onFieldInput(e) {
    const el = e.target;
    const prop = el.dataset.prop;
    const row = el.closest('.frow');
    if (!prop || !row) return;
    const f = draft.fields[Number(row.dataset.i)];
    delete f._auto;
    dirty = true;
    if (prop === 'key') { el.size = Math.max(4, el.value.length); return; } // Umbenennen erst bei «change»
    if (prop === 'required') f.required = el.checked;
    else if (prop === 'options') f.options = el.value.split('\n');
    else if (prop === 'type') return; // bei «change»
    else f[prop] = el.value;
    updateTemplateInfo();
  }

  function onFieldChange(e) {
    const el = e.target;
    const row = el.closest('.frow');
    if (!row) return;
    const f = draft.fields[Number(row.dataset.i)];
    if (el.dataset.prop === 'type') {
      f.type = el.value;
      if (f.type === 'select' && !Array.isArray(f.options)) f.options = [];
      renderFields();
    } else if (el.dataset.prop === 'key') {
      const next = el.value.trim();
      if (next === f.key) return;
      if (!E.isValidKey(next)) {
        toast('Ungültiger Name: nur Buchstaben, Zahlen, _ und -, ohne Leerzeichen.', 'warn');
        el.value = f.key;
        return;
      }
      if (draft.fields.some(x => x !== f && x.key === next)) {
        toast('Den Platzhalter {{' + next + '}} gibt es schon.', 'warn');
        el.value = f.key;
        return;
      }
      draft.template = E.renameKey(draft.template, f.key, next);
      $('#edTemplate').value = draft.template;
      f.key = next;
      renderFields();
    }
  }

  function onFieldClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const row = btn.closest('.frow');
    const i = Number(row.dataset.i);
    const act = btn.dataset.act;
    const fields = draft.fields;
    dirty = true;
    if (act === 'up' && i > 0) [fields[i - 1], fields[i]] = [fields[i], fields[i - 1]];
    else if (act === 'down' && i < fields.length - 1) [fields[i + 1], fields[i]] = [fields[i], fields[i + 1]];
    else if (act === 'del') fields.splice(i, 1);
    else if (act === 'insert') { insertIntoTemplate('{{' + fields[i].key + '}}'); return; }
    renderFields();
  }

  function addField() {
    let n = draft.fields.length + 1;
    while (draft.fields.some(f => f.key === 'frage' + n)) n++;
    draft.fields.push({ key: 'frage' + n, label: '', type: 'text', required: false, placeholder: '', default: '' });
    dirty = true;
    renderFields();
    const rows = $$('#fieldList .frow');
    const input = $('[data-prop="label"]', rows[rows.length - 1]);
    input.scrollIntoView({ block: 'nearest' });
    input.focus();
  }

  async function saveDraft(e) {
    if (e) e.preventDefault();
    const now = new Date().toISOString();
    const raw = Object.assign({}, draft, {
      title: $('#edTitle').value,
      category: $('#edCategory').value,
      author: $('#edAuthor').value,
      description: $('#edDesc').value,
      tags: $('#edTags').value.split(','),
      template: $('#edTemplate').value,
      createdAt: draft.createdAt || now,
      updatedAt: now
    });
    const errors = E.validateDraft(raw);
    if (errors.length) {
      $('#editErrors').innerHTML = errors.map(esc).join('<br>');
      return;
    }
    const p = E.cleanPrompt(raw, now);
    const btn = $('#editForm [type=submit]');
    setBusy(btn, true);
    try {
      await state.store.save(p);
      lsSet(LS_AUTHOR, p.author);
      dirty = false;
      $('#editDialog').close();
      toast('«' + p.title + '» gespeichert.' + state.store.saveNote, 'ok');
    } catch (err) {
      $('#editErrors').textContent = friendlyError(err);
    } finally {
      setBusy(btn, false);
    }
  }

  async function deletePrompt(p) {
    if (!(await confirmBox('«' + p.title + '» wirklich löschen? Das lässt sich nur über ein Backup rückgängig machen.', 'Löschen', true))) return;
    try {
      await state.store.remove(p.id);
      toast('«' + p.title + '» gelöscht.', 'ok');
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }

  // ---------- Backup ----------

  let pendingImport = null;

  function exportBackup(suffix) {
    const data = E.buildBackup(state.prompts);
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes());
    download('prompt-bibliothek-backup_' + stamp + (suffix || '') + '.json', JSON.stringify(data, null, 2));
    toast('Backup mit ' + count(data.count, 'Prompt', 'Prompts') + ' heruntergeladen.', 'ok');
  }

  async function onImportFile(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    let result;
    try {
      result = E.parseBackup(await file.text());
    } catch (err) {
      toast(err.message, 'error');
      return;
    }
    if (!result.prompts.length) {
      toast('Die Datei enthält keine gültigen Prompts.', 'error');
      return;
    }
    pendingImport = result;
    const existing = new Set(state.prompts.map(p => p.id));
    const updates = result.prompts.filter(p => existing.has(p.id)).length;
    $('#importSummary').innerHTML = '<strong>' + esc(file.name) + '</strong><br>' +
      count(result.prompts.length, 'gültiger Prompt', 'gültige Prompts') + ': ' + (result.prompts.length - updates) + ' neu, ' + updates + ' mit bestehender ID.' +
      (result.skipped ? '<br>' + count(result.skipped, 'ungültiger Eintrag wird', 'ungültige Einträge werden') + ' übersprungen.' : '');
    $('#importReplaceNote').textContent = state.prompts.length
      ? 'Vorher wird automatisch ein Backup des aktuellen Stands (' + count(state.prompts.length, 'Prompt', 'Prompts') + ') heruntergeladen.'
      : '';
    const d = $('#importDialog');
    d.returnValue = '';
    d.showModal();
  }

  async function runImport(replace) {
    const list = pendingImport.prompts;
    pendingImport = null;
    if (replace && state.prompts.length) exportBackup('_vor-import');
    try {
      await state.store.importPrompts(list, replace);
      toast(count(list.length, 'Prompt', 'Prompts') + ' importiert' + (replace ? ' (Datenbank ersetzt).' : '.') + state.store.saveNote, 'ok');
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }

  async function addSamples() {
    const now = new Date().toISOString();
    const list = (window.PB_SAMPLES || []).map(p => E.cleanPrompt(p, now)).filter(Boolean);
    try {
      await state.store.importPrompts(list, false);
      toast(list.length + ' Beispiel-Prompts hinzugefügt.', 'ok');
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }

  // ---------- Login und Passwort ----------

  function openLogin() {
    $('#loginError').textContent = '';
    $('#loginPw').value = '';
    $('#loginRemember').checked = false;
    $('#loginDialog').showModal();
    $('#loginPw').focus();
  }

  async function onLogin(e) {
    e.preventDefault();
    const btn = $('#loginForm [type=submit]');
    const input = $('#loginPw').value;
    setBusy(btn, true);
    $('#loginError').textContent = '';
    try {
      await state.store.login(input, $('#loginRemember').checked);
      $('#loginDialog').close();
      if (E.looksLikeToken(input)) toast('Mit GitHub-Schlüssel angemeldet. Lege jetzt unter «Verwaltung» das Master-Passwort fest.', 'ok');
      else toast('Edit-Modus aktiv.', 'ok');
    } catch (err) {
      $('#loginError').textContent = friendlyError(err);
      $('#loginPw').select();
    } finally {
      setBusy(btn, false);
    }
  }

  async function onMasterPassword(e) {
    e.preventDefault();
    const err = $('#pwError');
    const pw = $('#pwNew').value;
    err.textContent = '';
    if (pw.length < 12) { err.textContent = 'Das Passwort braucht mindestens 12 Zeichen.'; return; }
    if (pw !== $('#pwNew2').value) { err.textContent = 'Die beiden Eingaben stimmen nicht überein.'; return; }
    if (E.looksLikeToken(pw)) { err.textContent = 'Bitte ein eigenes Passwort wählen, nicht den GitHub-Schlüssel.'; return; }
    const btn = $('#passwordForm [type=submit]');
    setBusy(btn, true);
    try {
      await state.store.setMasterPassword(pw);
      $('#passwordDialog').close();
      toast('Master-Passwort festgelegt. Gilt in etwa einer Minute für alle.', 'ok');
    } catch (ex) {
      err.textContent = friendlyError(ex);
    } finally {
      setBusy(btn, false);
    }
  }

  // ---------- Menü ----------

  function toggleMenu(open) {
    const menu = $('#menu');
    const show = open == null ? menu.hidden : open;
    menu.hidden = !show;
    $('#btnMenu').setAttribute('aria-expanded', String(show));
  }

  function onMenu(action) {
    toggleMenu(false);
    if (action === 'export') exportBackup();
    else if (action === 'import') $('#importFile').click();
    else if (action === 'samples') addSamples();
    else if (action === 'history') window.open(state.store.historyUrl, '_blank', 'noopener');
    else if (action === 'password') {
      ['#pwNew', '#pwNew2'].forEach(s => { $(s).value = ''; });
      $('#pwError').textContent = '';
      $('#passwordDialog').showModal();
      $('#pwNew').focus();
    }
  }

  // ---------- Ereignisse ----------

  function bindUI() {
    $$('i[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); });
    $('#loginUser').value = 'Prompt-Bibliothek'; // damit Passwort-Manager den Eintrag sinnvoll benennen

    // Suche und Filter
    $('#search').addEventListener('input', e => { state.query = e.target.value; renderChips(); renderGrid(); });
    $('#chips').addEventListener('click', e => {
      const chip = e.target.closest('[data-cat]');
      if (!chip) return;
      state.category = state.category === chip.dataset.cat ? '' : chip.dataset.cat;
      renderChips();
      renderGrid();
    });
    $('#authorFilter').addEventListener('change', e => { state.author = e.target.value; renderChips(); renderGrid(); });
    const sortSel = $('#sortSelect');
    sortSel.value = state.sort;
    sortSel.addEventListener('change', e => { state.sort = e.target.value; lsSet(LS_SORT, state.sort); renderGrid(); });

    // Karten
    $('#grid').addEventListener('click', e => {
      const card = e.target.closest('.card');
      const p = card && byId(card.dataset.id);
      if (!p) return;
      const act = e.target.closest('[data-action]');
      if (!act) openUse(p);
      else if (act.dataset.action === 'edit') openEditor(p, 'edit');
      else if (act.dataset.action === 'duplicate') openEditor(duplicateOf(p), 'duplicate');
      else if (act.dataset.action === 'delete') deletePrompt(p);
    });
    $('#grid').addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
        e.preventDefault();
        const p = byId(e.target.dataset.id);
        if (p) openUse(p);
      }
    });
    $('#empty').addEventListener('click', e => {
      const b = e.target.closest('[data-empty]');
      if (!b) return;
      const a = b.dataset.empty;
      if (a === 'new') openEditor(emptyPrompt(), 'new');
      else if (a === 'samples') addSamples();
      else if (a === 'import') $('#importFile').click();
      else if (a === 'reset') resetFilters();
      else if (a === 'retry') state.store.refresh();
    });

    // Kopfzeile
    $('#btnLock').addEventListener('click', async () => {
      if (!state.edit) return openLogin();
      await state.store.logout();
      toast('Edit-Modus beendet.');
    });
    $('#btnNew').addEventListener('click', () => openEditor(emptyPrompt(), 'new'));
    $('#btnMenu').addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
    $('#menu').addEventListener('click', e => { const b = e.target.closest('[data-menu]'); if (b) onMenu(b.dataset.menu); });
    document.addEventListener('click', e => { if (!e.target.closest('#menuWrap')) toggleMenu(false); });

    // Dialoge allgemein
    $$('[data-close]').forEach(b => b.addEventListener('click', () => {
      const d = b.closest('dialog');
      if (d.id === 'editDialog') closeEditor(); else d.close();
    }));
    ['useDialog', 'loginDialog', 'passwordDialog'].forEach(id => {
      const d = $('#' + id);
      d.addEventListener('mousedown', e => { if (e.target === d) d.dataset.downOnBackdrop = '1'; });
      d.addEventListener('click', e => {
        // Klick auf den abgedunkelten Hintergrund schliesst den Dialog
        if (e.target === d && d.dataset.downOnBackdrop) d.close();
        delete d.dataset.downOnBackdrop;
      });
    });

    // Prompt nutzen
    const answerForm = $('#answerForm');
    answerForm.addEventListener('submit', e => { e.preventDefault(); generate(); });
    answerForm.addEventListener('input', e => {
      if (e.target.setCustomValidity) e.target.setCustomValidity('');
      if (e.target.tagName === 'TEXTAREA') autoGrow(e.target); // Feld wächst beim Tippen mit
    });
    answerForm.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); generate(); return; }
      if (e.target.tagName === 'INPUT') {
        // Enter springt zur nächsten Frage, bei der letzten wird erstellt
        e.preventDefault();
        const inputs = $$('[name]', answerForm);
        const next = inputs[inputs.indexOf(e.target) + 1];
        if (next) next.focus(); else generate();
      }
    });
    $('#useDialog').addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !answerForm.contains(e.target)) { e.preventDefault(); generate(); }
    });
    $('#useDialog').addEventListener('close', releaseDialogEntry);
    $('#editDialog').addEventListener('close', releaseDialogEntry);
    window.addEventListener('popstate', onPopState);
    // Teilen (Handy): Prompt direkt an die ChatGPT-, Claude- oder Gemini-App schicken
    const share = $('#shareResult');
    share.hidden = !navigator.share;
    share.addEventListener('click', async () => {
      try {
        await navigator.share({ title: current ? current.title : 'Mega-Prompt', text: $('#resultText').value });
      } catch (e) { /* Teilen abgebrochen */ }
    });
    $('#copyAgain').addEventListener('click', async () => {
      const ok = await copyText($('#resultText').value);
      toast(ok ? 'Kopiert.' : 'Kopieren nicht möglich, bitte Ctrl+C verwenden.', ok ? 'ok' : 'warn');
    });
    $('#useLink').addEventListener('click', async () => {
      const url = location.href.split('#')[0] + '#p=' + encodeURIComponent(current.id);
      const ok = await copyText(url);
      toast(ok ? 'Link zu diesem Prompt kopiert.' : url, ok ? 'ok' : 'warn');
    });
    $('#useEdit').addEventListener('click', () => {
      openEditor(current, 'edit'); // zuerst öffnen, damit der Verlaufseintrag bestehen bleibt
      $('#useDialog').close();
    });

    // Editor
    const editDialog = $('#editDialog');
    editDialog.addEventListener('cancel', e => { e.preventDefault(); closeEditor(); });
    $('#editForm').addEventListener('submit', saveDraft);
    $('#editForm').addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key.toLowerCase() === 's')) { e.preventDefault(); saveDraft(); return; }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.preventDefault(); // Enter speichert nicht versehentlich
    });
    $$('[data-meta]', editDialog).forEach(el => el.addEventListener('input', () => { dirty = true; }));
    const tpl = $('#edTemplate');
    tpl.addEventListener('input', () => {
      draft.template = tpl.value;
      dirty = true;
      updateTemplateInfo();
      syncDebounced();
    });
    ['keyup', 'click', 'select', 'blur'].forEach(ev => tpl.addEventListener(ev, () => { templateCaret = tpl.selectionStart; }));
    tpl.addEventListener('change', () => { if (syncFieldsFromTemplate()) renderFields(); });
    const fieldList = $('#fieldList');
    fieldList.addEventListener('input', onFieldInput);
    fieldList.addEventListener('change', onFieldChange);
    fieldList.addEventListener('click', onFieldClick);
    $('#addField').addEventListener('click', addField);

    // Login, Passwort, Import
    $('#loginForm').addEventListener('submit', onLogin);
    $('#passwordForm').addEventListener('submit', onMasterPassword);
    $('#importFile').addEventListener('change', onImportFile);
    $('#importDialog').addEventListener('close', () => {
      const v = $('#importDialog').returnValue;
      if (pendingImport && (v === 'merge' || v === 'replace')) runImport(v === 'replace');
      else pendingImport = null;
    });

    // Tastatur: «/» springt in die Suche, Esc schliesst das Menü
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') toggleMenu(false);
      if (e.key !== '/' || $('dialog[open]')) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      e.preventDefault();
      $('#search').focus();
    });

    window.addEventListener('beforeunload', e => {
      if (dirty && $('#editDialog').open) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  // ---------- Start ----------

  async function init() {
    const title = CFG.appTitle || 'Prompt-Bibliothek';
    document.title = title;
    $('#appTitle').textContent = title;
    bindUI();
    renderGrid();
    state.store = PBStore.create(CFG);

    const demo = state.store.mode === 'demo';
    $('#demoBanner').hidden = !demo;
    $('[data-menu="history"]').hidden = !state.store.historyUrl;
    const gh = CFG.github || {};
    if (demo && gh.owner && gh.repo) {
      const live = $('#liveLink');
      live.href = 'https://' + gh.owner + '.github.io/' + gh.repo + '/';
      live.hidden = false;
    }

    state.store.onAuth(setEdit);
    state.store.subscribe(onData, err => {
      state.loaded = true;
      state.loadError = true;
      renderGrid();
      showError(friendlyError(err));
    });
    const resumed = await state.store.resume();
    if (resumed === 'expired') toast('Der gespeicherte Zugang gilt nicht mehr. Bitte neu anmelden.', 'warn');

    // Beim Zurückkehren in die App (z. B. Handy) frisch laden, damit alle denselben Stand sehen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Date.now() - (state.lastLoad || 0) > 30000) state.store.refresh();
    });
  }

  init();
})();
