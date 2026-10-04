// Ausführen mit: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');

// Fantasie-Schlüssel werden zusammengesetzt, damit kein schlüsselähnlicher Text im Code steht.
const PAT = 'github' + '_pat_';
const CLASSIC = 'gh' + 'p_';

test('render ersetzt Platzhalter und trimmt Antworten', () => {
  assert.equal(E.render('Thema: {{thema}}.', { thema: '  HACCP ' }), 'Thema: HACCP.');
  assert.equal(E.render('A {{ thema }} B', { thema: 'x' }), 'A x B');
});

test('render: leere Antworten ergeben leeren Text', () => {
  assert.equal(E.render('Thema: {{thema}}', {}), 'Thema:');
});

test('render: Inline-Abschnitt erscheint nur mit Antwort', () => {
  const t = 'Start{{#x}} mit {{x}}{{/x}}.';
  assert.equal(E.render(t, { x: 'Wert' }), 'Start mit Wert.');
  assert.equal(E.render(t, { x: '' }), 'Start.');
  assert.equal(E.render(t, { x: '   ' }), 'Start.');
});

test('render: Block-Abschnitte auf eigenen Zeilen hinterlassen keine Leerzeilen', () => {
  const t = 'A\n{{#x}}\nX: {{x}}\n{{/x}}\nC';
  assert.equal(E.render(t, { x: '1' }), 'A\nX: 1\nC');
  assert.equal(E.render(t, {}), 'A\nC');
});

test('render: weggelassener Inline-Abschnitt auf eigener Zeile entfernt die ganze Zeile', () => {
  const t = 'A\n{{#x}}Termin: {{x}}{{/x}}\nC';
  assert.equal(E.render(t, { x: 'Mo' }), 'A\nTermin: Mo\nC');
  assert.equal(E.render(t, {}), 'A\nC');
  assert.equal(E.render('{{#x}}X{{/x}}\nB', {}), 'B');
  assert.equal(E.render('A\n\n{{#x}}X{{/x}}\n\nB', {}), 'A\n\nB');
});

test('render: zwei weggelassene Blöcke hintereinander lassen den Absatz intakt', () => {
  const t = 'Satz.\n{{#a}}\nA: {{a}}\n{{/a}}\n{{#b}}\nB: {{b}}\n{{/b}}\n\nListe:';
  assert.equal(E.render(t, {}), 'Satz.\n\nListe:');
  assert.equal(E.render(t, { a: 1, b: 2 }), 'Satz.\nA: 1\nB: 2\n\nListe:');
});

test('render: verschachtelte Abschnitte mit verschiedenen Namen', () => {
  const t = '{{#a}}A{{#b}}B{{/b}}{{/a}}';
  assert.equal(E.render(t, { a: 1, b: 1 }), 'AB');
  assert.equal(E.render(t, { a: 1 }), 'A');
  assert.equal(E.render(t, { b: 1 }), '');
});

test('render: Antworten mit {{...}} werden nicht weiter verarbeitet', () => {
  assert.equal(E.render('{{a}} {{b}}', { a: '{{b}}', b: 'B' }), '{{b}} B');
});

test('render: verwaiste Abschnitts-Tags verschwinden, mehr als eine Leerzeile wird gekürzt', () => {
  assert.equal(E.render('A {{#x}}B', { x: 1 }), 'A B');
  assert.equal(E.render('A\n\n\n\nB', {}), 'A\n\nB');
});

test('render: Umlaute in Platzhalter-Namen', () => {
  assert.equal(E.render('{{schwierigkeit_grad}} {{größe}}', { schwierigkeit_grad: 'hoch', 'größe': 'XL' }), 'hoch XL');
});

test('extractKeys liefert eindeutige Namen in Reihenfolge', () => {
  assert.deepEqual(E.extractKeys('{{b}} {{#a}}{{a}}{{/a}} {{b}} {{ c-d }}'), ['b', 'a', 'c-d']);
});

test('renameKey benennt auch Abschnitte um', () => {
  assert.equal(E.renameKey('{{#x}}{{x}}{{/x}} {{xy}}', 'x', 'neu'), '{{#neu}}{{neu}}{{/neu}} {{xy}}');
});

test('checkTemplate findet unvollständige Abschnitte', () => {
  assert.equal(E.checkTemplate('{{#a}}x{{/a}}').length, 0);
  assert.equal(E.checkTemplate('{{#a}}x').length, 1);
});

test('normalize und matches: Gross/klein, Akzente, ß', () => {
  const text = E.normalize('Grundsätze der Straße');
  assert.ok(E.matches(text, E.tokenize('GRUNDSATZE strasse')));
  assert.ok(!E.matches(text, E.tokenize('grundsätze fehlt')));
});

test('cleanPrompt füllt Standardwerte und verwirft Ungültiges', () => {
  assert.equal(E.cleanPrompt({ title: '', template: 'x' }), null);
  assert.equal(E.cleanPrompt({ title: 'T', template: '  ' }), null);
  const p = E.cleanPrompt({
    id: 'bad id/with slash', title: ' T ', template: 'x', tags: 'a, b, a',
    fields: [
      { key: 'k', type: 'select', options: 'Eins\n\nZwei', required: 1 },
      { key: 'k' },
      { key: 'mit leerzeichen' },
      { key: 'z', type: 'unbekannt', _auto: true }
    ]
  }, 'NOW');
  assert.equal(p.title, 'T');
  assert.equal(p.category, 'Allgemein');
  assert.equal(p.author, 'Unbekannt');
  assert.deepEqual(p.tags, ['a', 'b']);
  assert.equal(p.fields.length, 2);
  assert.deepEqual(p.fields[0].options, ['Eins', 'Zwei']);
  assert.equal(p.fields[0].required, true);
  assert.equal(p.fields[1].type, 'text');
  assert.equal('_auto' in p.fields[1], false);
  assert.match(p.id, /^[A-Za-z0-9]{20}$/);
  assert.equal(p.createdAt, 'NOW');
});

test('validateDraft meldet fehlende Angaben und Doppelte', () => {
  const errs = E.validateDraft({
    title: '', category: 'A', author: 'B', template: '{{#a}}',
    fields: [{ key: 'a', label: 'A' }, { key: 'a', label: 'A2' }, { key: 's', label: 'S', type: 'select', options: [' '] }]
  });
  assert.equal(errs.length, 4);
});

test('Backup: Export und Import ergeben dieselben Daten', () => {
  const prompts = [
    { id: 'b1', title: 'Beta', template: 'B', category: 'X', author: 'Y', tags: [], fields: [], createdAt: '1', updatedAt: '1' },
    { id: 'a1', title: 'alpha', template: 'A {{x}}', category: 'X', author: 'Y', tags: ['t'], fields: [{ key: 'x', label: 'X', type: 'text', required: true, placeholder: '', default: '' }], createdAt: '1', updatedAt: '2' }
  ];
  const backup = E.buildBackup(prompts);
  assert.equal(backup.count, 2);
  assert.equal(backup.prompts[0].title, 'alpha');
  const { prompts: back, skipped } = E.parseBackup(JSON.stringify(backup));
  assert.equal(skipped, 0);
  assert.deepEqual(back, backup.prompts);
});

test('parseBackup: akzeptiert reine Liste, zählt Ungültige, doppelte IDs werden neu vergeben', () => {
  const { prompts, skipped } = E.parseBackup(JSON.stringify([
    { id: 'x', title: 'A', template: 'a' },
    { id: 'x', title: 'B', template: 'b' },
    { title: 'ohne Template' }
  ]));
  assert.equal(prompts.length, 2);
  assert.equal(skipped, 1);
  assert.notEqual(prompts[0].id, prompts[1].id);
});

test('parseBackup: verständliche Fehler', () => {
  assert.throws(() => E.parseBackup('kein json'), /kein gültiges JSON/);
  assert.throws(() => E.parseBackup('{"foo":1}'), /keine Prompt-Liste/);
});

test('Beispiel-Prompts sind gültig und rendern ohne Restklammern', () => {
  global.window = global;
  require('../beispiele.js');
  const samples = global.PB_SAMPLES;
  assert.ok(samples.length >= 5);
  for (const s of samples) {
    const p = E.cleanPrompt(s, 'NOW');
    assert.ok(p, s.title);
    assert.deepEqual(E.validateDraft(p), [], s.title);
    assert.deepEqual(E.extractKeys(p.template).sort(), p.fields.map(f => f.key).sort(), s.title);
    const full = {};
    p.fields.forEach(f => { full[f.key] = f.default || 'WERT'; });
    assert.ok(!/\{\{|\}\}/.test(E.render(p.template, full)), s.title);
    assert.ok(!/\{\{|\}\}/.test(E.render(p.template, {})), s.title);
  }
});

test('Base64: Umlaute und Sonderzeichen bleiben erhalten', () => {
  const s = 'Grüsse «Küche» 😀 ' + 'x'.repeat(70000);
  assert.equal(E.b64ToUtf8(E.utf8ToB64(s)), s);
  assert.equal(E.b64ToUtf8(E.utf8ToB64('ä').replace(/(.{2})/, '$1\n')), 'ä'); // Zeilenumbrüche wie in GitHub-Antworten
});

test('Master-Passwort: richtiges Passwort entschlüsselt, falsches nicht', async () => {
  const token = PAT + 'TESTWERT0123456789_nur_fuer_tests_keine_echte_berechtigung';
  const blob = await E.sealSecret(token, 'Kochzunft-Passugg-2026', 1000);
  assert.equal(blob.v, 1);
  assert.ok(!JSON.stringify(blob).includes(PAT), 'Schlüssel darf nicht im Klartext stehen');
  assert.equal(await E.openSecret(blob, 'Kochzunft-Passugg-2026'), token);
  await assert.rejects(() => E.openSecret(blob, 'falsch'));
  await assert.rejects(() => E.openSecret({ v: 2 }, 'x'));
});

test('Master-Passwort: Standard mit 600 000 Runden', async () => {
  const blob = await E.sealSecret('geheim', 'passwort-lang-genug');
  assert.equal(blob.iterations, 600000);
  assert.equal(await E.openSecret(blob, 'passwort-lang-genug'), 'geheim');
});

test('looksLikeToken unterscheidet Schlüssel von Passwörtern', () => {
  assert.ok(E.looksLikeToken(PAT + 'TESTWERT0123456789_nur_test'));
  assert.ok(E.looksLikeToken('  ' + CLASSIC + 'TESTWERTnurfuertests0123  '));
  assert.ok(!E.looksLikeToken('Mein Passwort 2026'));
  assert.ok(!E.looksLikeToken(PAT + 'kurz'));
});

test('Startdaten data/prompts.json sind gültig', () => {
  const text = require('fs').readFileSync(require('path').join(__dirname, '..', 'data', 'prompts.json'), 'utf8');
  const { prompts, skipped } = E.parseBackup(text);
  assert.equal(skipped, 0);
  assert.ok(prompts.length >= 5);
});

test('render: {{^x}} erscheint nur, wenn die Frage leer blieb', () => {
  const t = 'A\n{{#text}}\nText: {{text}}\n{{/text}}\n{{^text}}\nDer Text folgt im Chat.\n{{/text}}\nB';
  assert.equal(E.render(t, { text: 'Hallo' }), 'A\nText: Hallo\nB');
  assert.equal(E.render(t, {}), 'A\nDer Text folgt im Chat.\nB');
  assert.deepEqual(E.extractKeys(t), ['text']);
  assert.equal(E.checkTemplate(t).length, 0);
  assert.equal(E.checkTemplate('{{^x}}ohne Ende').length, 1);
  assert.equal(E.renameKey('{{^x}}a{{/x}}', 'x', 'y'), '{{^y}}a{{/y}}');
});
