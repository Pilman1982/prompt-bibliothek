/*
 * Prompt-Bibliothek: Template-Engine und Datenhilfen.
 * Kein DOM-Zugriff, darum auch mit Node testbar (tests/engine.test.js).
 */
(function (root) {
  'use strict';

  const KEY = '[\\p{L}\\p{N}_-]+';
  const KEY_ONLY_RE = new RegExp('^' + KEY + '$', 'u');
  const ANY_TAG_RE = new RegExp('\\{\\{\\s*[#/]?\\s*(' + KEY + ')\\s*\\}\\}', 'gu');
  const SECTION_TAG_RE = new RegExp('\\{\\{\\s*([#/])\\s*(' + KEY + ')\\s*\\}\\}', 'gu');
  const VAR_RE = new RegExp('\\{\\{\\s*(' + KEY + ')\\s*\\}\\}', 'gu');
  // Ein Zeilenumbruch direkt nach dem Start- bzw. vor dem End-Tag gehört zum Tag,
  // damit Blöcke auf eigenen Zeilen keine Leerzeilen hinterlassen.
  const SECTION_RE = new RegExp('\\{\\{#\\s*(' + KEY + ')\\s*\\}\\}\\n?([\\s\\S]*?)\\n?\\{\\{\\/\\s*\\1\\s*\\}\\}', 'u');

  const FIELD_TYPES = ['text', 'textarea', 'select'];
  const BACKUP_VERSION = 1;
  const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const str = v => (typeof v === 'string' ? v : v == null ? '' : String(v)).trim();
  const isFilled = v => v != null && String(v).trim() !== '';
  const isValidKey = k => KEY_ONLY_RE.test(String(k || ''));
  const collator = new Intl.Collator('de-CH', { sensitivity: 'base', numeric: true });

  /** Setzt die Antworten ins Template ein und erzeugt den Mega-Prompt. */
  function render(template, values) {
    values = values || {};
    let out = String(template || '');
    let m;
    let guard = 0;
    while ((m = SECTION_RE.exec(out)) && guard++ < 1000) {
      const keep = isFilled(values[m[1]]);
      let end = m.index + m[0].length;
      // Steht ein weggelassener Abschnitt allein auf seiner Zeile, verschwindet die ganze Zeile.
      if (!keep && (m.index === 0 || out[m.index - 1] === '\n') && out[end] === '\n') end++;
      out = out.slice(0, m.index) + (keep ? m[2] : '') + out.slice(end);
    }
    out = out.replace(SECTION_TAG_RE, ''); // verwaiste Abschnitts-Tags entfernen
    out = out.replace(VAR_RE, (_, k) => (isFilled(values[k]) ? String(values[k]).trim() : ''));
    return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /** Alle Platzhalter-Namen in der Reihenfolge ihres ersten Auftretens. */
  function extractKeys(template) {
    const keys = [];
    for (const m of String(template || '').matchAll(ANY_TAG_RE)) {
      if (!keys.includes(m[1])) keys.push(m[1]);
    }
    return keys;
  }

  /** Benennt einen Platzhalter überall im Template um (auch in Abschnitten). */
  function renameKey(template, from, to) {
    const safe = String(from).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('\\{\\{(\\s*[#/]?\\s*)' + safe + '(\\s*)\\}\\}', 'gu');
    return String(template || '').replace(re, (_, pre, post) => '{{' + pre + to + post + '}}');
  }

  /** Meldet Abschnitte, deren Anfang und Ende nicht paarweise vorkommen. */
  function checkTemplate(template) {
    const open = {};
    const close = {};
    for (const m of String(template || '').matchAll(SECTION_TAG_RE)) {
      const bag = m[1] === '#' ? open : close;
      bag[m[2]] = (bag[m[2]] || 0) + 1;
    }
    const msgs = [];
    new Set([...Object.keys(open), ...Object.keys(close)]).forEach(k => {
      if ((open[k] || 0) !== (close[k] || 0)) {
        msgs.push('Abschnitt {{#' + k + '}} … {{/' + k + '}} ist unvollständig: Anfang und Ende müssen paarweise vorkommen.');
      }
    });
    return msgs;
  }

  function labelFromKey(key) {
    const s = String(key || '').replace(/[_-]+/g, ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /** Für die Suche: klein, ohne Akzente, ß als ss. */
  function normalize(s) {
    return String(s || '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function tokenize(query) {
    return normalize(query).split(/\s+/).filter(Boolean);
  }

  function searchText(p) {
    const fields = (p.fields || []).map(f => [f.label, f.placeholder, (f.options || []).join(' ')].join(' '));
    return normalize([p.title, p.description, p.category, p.author, (p.tags || []).join(' '), p.template, fields.join(' ')].join('\n'));
  }

  /** Jedes Suchwort muss vorkommen (UND-Verknüpfung). */
  function matches(text, tokens) {
    return tokens.every(t => text.includes(t));
  }

  function hue(s) {
    let h = 7;
    for (const c of String(s || '')) h = (h * 31 + c.codePointAt(0)) >>> 0;
    return (h * 137) % 360;
  }

  function newId() {
    const bytes = new Uint8Array(20);
    if (root.crypto && root.crypto.getRandomValues) root.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    let id = '';
    for (const b of bytes) id += ID_ALPHABET[b % ID_ALPHABET.length];
    return id;
  }

  /** Bringt einen Prompt (aus Editor, Datenbank oder Backup) in die saubere Standardform. */
  function cleanPrompt(raw, now) {
    if (!raw || typeof raw !== 'object') return null;
    const title = str(raw.title);
    const template = typeof raw.template === 'string' ? raw.template.replace(/\r\n/g, '\n') : '';
    if (!title || !template.trim()) return null;

    let tags = Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === 'string' ? raw.tags.split(',') : [];
    tags = [...new Set(tags.map(str).filter(Boolean))];

    const fields = [];
    const seen = new Set();
    for (const f of Array.isArray(raw.fields) ? raw.fields : []) {
      if (!f || typeof f !== 'object') continue;
      const key = str(f.key);
      if (!isValidKey(key) || seen.has(key)) continue;
      seen.add(key);
      const type = FIELD_TYPES.includes(f.type) ? f.type : 'text';
      const field = {
        key,
        label: str(f.label) || labelFromKey(key),
        type,
        required: !!f.required,
        placeholder: str(f.placeholder),
        default: str(f.default)
      };
      if (type === 'select') {
        const opts = Array.isArray(f.options) ? f.options : typeof f.options === 'string' ? f.options.split('\n') : [];
        field.options = [...new Set(opts.map(str).filter(Boolean))];
      }
      fields.push(field);
    }

    const id = typeof raw.id === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(raw.id) ? raw.id : newId();
    return {
      id,
      title,
      description: str(raw.description),
      category: str(raw.category) || 'Allgemein',
      author: str(raw.author) || 'Unbekannt',
      tags,
      fields,
      template,
      createdAt: str(raw.createdAt) || now || '',
      updatedAt: str(raw.updatedAt) || now || ''
    };
  }

  /** Prüft einen Entwurf aus dem Editor. Liefert eine Liste von Fehlermeldungen. */
  function validateDraft(p) {
    const errors = [];
    if (!str(p.title)) errors.push('Titel fehlt.');
    if (!str(p.category)) errors.push('Kategorie fehlt.');
    if (!str(p.author)) errors.push('«Erstellt von» fehlt.');
    if (!str(p.template)) errors.push('Das Template ist leer.');
    const seen = new Set();
    (p.fields || []).forEach((f, i) => {
      const n = 'Frage ' + (i + 1);
      const key = str(f.key);
      if (!isValidKey(key)) errors.push(n + ': Platzhalter-Name «' + key + '» ist ungültig (nur Buchstaben, Zahlen, _ und -).');
      else if (seen.has(key)) errors.push(n + ': Der Platzhalter {{' + key + '}} kommt doppelt vor.');
      seen.add(key);
      if (!str(f.label)) errors.push(n + ' ({{' + key + '}}): Der Fragetext fehlt.');
      if (f.type === 'select' && !(f.options || []).some(o => str(o))) errors.push(n + ' ({{' + key + '}}): Eine Auswahl braucht mindestens eine Option.');
    });
    return errors.concat(checkTemplate(p.template));
  }

  function sortByTitle(list) {
    return list.slice().sort((a, b) => collator.compare(a.title, b.title));
  }

  function buildBackup(prompts) {
    const clean = sortByTitle(prompts).map(p => cleanPrompt(p, '')).filter(Boolean);
    return {
      app: 'Prompt-Bibliothek',
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      count: clean.length,
      prompts: clean
    };
  }

  /** Liest eine Backup-Datei. Wirft einen Fehler mit verständlicher Meldung. */
  function parseBackup(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Die Datei ist kein gültiges JSON.');
    }
    const list = Array.isArray(data) ? data : data && Array.isArray(data.prompts) ? data.prompts : null;
    if (!list) throw new Error('In der Datei wurde keine Prompt-Liste gefunden.');
    const now = new Date().toISOString();
    const prompts = [];
    const ids = new Set();
    let skipped = 0;
    for (const raw of list) {
      const p = cleanPrompt(raw, now);
      if (!p) { skipped++; continue; }
      if (ids.has(p.id)) p.id = newId();
      ids.add(p.id);
      prompts.push(p);
    }
    return { prompts, skipped };
  }

  // ---------- Base64 (UTF-8-sicher) ----------

  function bytesToB64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  function b64ToBytes(b64) {
    const bin = atob(String(b64 || '').replace(/\s+/g, ''));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  const utf8ToB64 = s => bytesToB64(new TextEncoder().encode(String(s)));
  const b64ToUtf8 = b => new TextDecoder().decode(b64ToBytes(b));

  // ---------- Master-Passwort: GitHub-Schlüssel verschlüsseln ----------
  // PBKDF2-SHA256 (600'000 Runden) leitet aus dem Passwort einen AES-256-GCM-Schlüssel ab.
  // Falsches Passwort → Entschlüsselung schlägt fehl (GCM prüft die Echtheit).

  const KDF_ITERATIONS = 600000;

  async function deriveKey(password, salt, iterations) {
    const subtle = root.crypto.subtle;
    const base = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  async function sealSecret(secret, password, iterations) {
    const iter = iterations || KDF_ITERATIONS;
    const salt = root.crypto.getRandomValues(new Uint8Array(16));
    const iv = root.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, iter);
    const data = new Uint8Array(await root.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(secret)));
    return { v: 1, kdf: 'PBKDF2-SHA256', iterations: iter, salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(data) };
  }

  /** Liefert den Klartext oder wirft einen Fehler (falsches Passwort oder beschädigte Daten). */
  async function openSecret(blob, password) {
    if (!blob || blob.v !== 1 || !blob.salt || !blob.iv || !blob.data) throw new Error('Unbekanntes Format der Zugangsdatei.');
    const key = await deriveKey(password, b64ToBytes(blob.salt), Number(blob.iterations) || KDF_ITERATIONS);
    const plain = await root.crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(blob.iv) }, key, b64ToBytes(blob.data));
    return new TextDecoder().decode(plain);
  }

  /** Sieht die Eingabe aus wie ein GitHub-Schlüssel (statt wie ein Master-Passwort)? */
  function looksLikeToken(s) {
    return /^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(String(s || '').trim());
  }

  const api = {
    FIELD_TYPES, render, extractKeys, renameKey, checkTemplate, labelFromKey, isValidKey,
    normalize, tokenize, searchText, matches, hue, newId, cleanPrompt, validateDraft,
    sortByTitle, buildBackup, parseBackup, collator,
    utf8ToB64, b64ToUtf8, sealSecret, openSecret, looksLikeToken
  };
  root.PBEngine = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
