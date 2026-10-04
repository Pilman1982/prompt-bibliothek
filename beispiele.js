/*
 * Vorlagen. Werden im Demo-Modus automatisch geladen und lassen sich
 * im Edit-Modus über «Verwaltung → Beispiel-Prompts hinzufügen» in die Datenbank übernehmen.
 * Feste IDs: Mehrfaches Hinzufügen überschreibt die Vorlagen, statt sie zu verdoppeln.
 * Stil: alles frei eintippen, nichts vorausgefüllt; leere Angaben fallen weg oder die KI fragt nach.
 */
(function () {
  const STAND = '2026-10-04T12:00:00.000Z';
  const frage = (key, label, type, placeholder, required) =>
    ({ key, label, type: type || 'text', required: !!required, placeholder: placeholder || '', default: '' });

  window.PB_SAMPLES = [
    {
      id: 'vorlage-prompt-creator',
      title: 'Prompt Creator',
      description: 'Erstellt mit dir zusammen den bestmöglichen Prompt: klare Struktur, Begründung, Verbesserungsvorschläge, Rückfragen und Qualitäts-Ampel.',
      category: 'Prompting',
      author: 'Vorlage',
      tags: ['Prompt', 'Iterativ'],
      fields: [
        frage('aufgabe', 'Worum soll es in dem Prompt gehen? Beschreibe die Aufgabe so genau wie möglich.', 'textarea', '', true),
        frage('zielgruppe', 'Wer ist die Zielgruppe der Ausgabe?'),
        frage('format', 'Welches Ausgabeformat wünschst du dir?', 'text', 'z. B. Tabelle, E-Mail, Stichpunkte, Präsentation'),
        frage('ton', 'Welchen Ton und Stil soll die Ausgabe haben?'),
        frage('einschraenkungen', 'Gibt es Einschränkungen oder Dinge, die die KI NICHT tun soll?', 'textarea'),
        frage('modell', 'Welches KI-Modell wirst du verwenden? Eines mit Reasoning oder ohne?', 'text', 'z. B. ChatGPT, Claude, Gemini; mit oder ohne Reasoning')
      ],
      template: `Ich möchte, dass Du mein Prompt Creator wirst. Dein Ziel ist es, mir zu helfen, den bestmöglichen Prompt für meine Bedürfnisse zu erstellen. Der Prompt wird von einer KI (z. B. ChatGPT, Claude, Gemini oder einem anderen Sprachmodell) verwendet.

Meine Angaben:
Aufgabe: {{aufgabe}}
{{#zielgruppe}}
Zielgruppe der Ausgabe: {{zielgruppe}}
{{/zielgruppe}}
{{#format}}
Gewünschtes Ausgabeformat: {{format}}
{{/format}}
{{#ton}}
Ton und Stil: {{ton}}
{{/ton}}
{{#einschraenkungen}}
Einschränkungen, Dinge, die die KI NICHT tun soll: {{einschraenkungen}}
{{/einschraenkungen}}
{{#modell}}
Verwendetes KI-Modell: {{modell}}
{{/modell}}

Fehlen Angaben zu Zielgruppe, Ausgabeformat, Ton und Stil, Einschränkungen oder KI-Modell (mit oder ohne Reasoning), frage zuerst gezielt danach.

Verwende dabei folgende Struktur:

<role> – Wer die KI sein soll, mit konkreter Expertise
<context> – Hintergrundinformationen zur Aufgabe
<task> – Die eigentliche Aufgabe, in logische Schritte unterteilt
<constraints> – Einschränkungen und Grenzen
<output_format> – Genaue Beschreibung des gewünschten Formats
<edge_cases> – Umgang mit Sonderfällen

Falls der Nutzer ein Reasoning-Modell verwendet, halte den Prompt kürzer und zielorientierter – ohne explizite Schritt-für-Schritt-Anweisungen, da diese Modelle intern bereits schrittweise denken.

Erkläre kurz, warum Du den Prompt so aufgebaut hast und welche Entscheidungen Du getroffen hast.

Du machst 2–4 konkrete Vorschläge, welche Details noch hinzugefügt werden könnten, um den Prompt weiter zu verbessern. Dazu gehören z. B.:
- Beispiele (Few-Shot), die das gewünschte Ergebnis zeigen
- Zusätzlicher Kontext oder Hintergrundinformationen
- Bewertungskriterien, mit denen die KI ihre eigene Antwort prüfen kann
- Platzhalter/Variablen für wiederkehrende Nutzung

Du stellst 2–4 gezielte Rückfragen, die mir helfen, weitere Informationen zu liefern.

Bewerte den Prompt jeweils mit einer Qualitäts-Ampel:
Rot = Noch nicht einsetzbar – wichtige Informationen fehlen.
Gelb = Funktioniert, kann aber noch deutlich verbessert werden.
Grün = Einsatzbereit – der Prompt ist klar, vollständig und gut strukturiert.

Bei jeder Iteration nimmst Du gezielte Änderungen vor, statt den gesamten Prompt neu zu schreiben, und erklärst kurz, was Du geändert hast und warum.

Sobald die Qualitäts-Ampel auf Grün steht, frage mich: «Soll ich den Prompt einmal für Dich testen, damit Du siehst, wie das Ergebnis aussieht?»

Zum Abschluss lieferst Du den finalen Prompt in einer sauberen, kopierbaren Version – ohne die Abschnitte Begründung, Vorschläge, Fragen und Qualitäts-Ampel.`,
      createdAt: STAND,
      updatedAt: STAND
    },
    {
      id: 'vorlage-entscheidungshelfer',
      title: 'Entscheidungen und Probleme lösen',
      description: 'Führt iterativ zu einer belastbaren Entscheidung: Lage, Optionen, Empfehlung, Umsetzung. Mit Modi wie KRITIK, MATRIX oder PLAN.',
      category: 'Analyse',
      author: 'Vorlage',
      tags: ['Entscheidung', 'Problemlösung', 'Iterativ'],
      fields: [
        frage('problem', 'Was ist das Problem oder die Entscheidung?', 'textarea', 'Leer lassen, wenn du es lieber im Chat beschreibst'),
        frage('ziel', 'Was möchtest du erreichen?'),
        frage('kontext', 'Welcher Hintergrund ist wichtig?', 'textarea'),
        frage('kriterien', 'Woran erkennst du eine gute Lösung?', 'text', 'z. B. Kosten, Aufwand, Wirkung, Risiko'),
        frage('zeit', 'Wie viel Zeit steht zur Verfügung?'),
        frage('budget', 'Welches Budget gibt es?'),
        frage('format', 'In welcher Form möchtest du die Antwort?')
      ],
      template: `Du hilfst mir bei offenen Problemen und Entscheidungen mit mehreren Lösungswegen. Führe mich iterativ zu einer belastbaren Entscheidung oder einem konkreten nächsten Schritt.

Fehlt entscheidender Kontext, stelle maximal 3 gezielte Rückfragen. Reichen die Angaben aus, beginne direkt. Beziehe neue Nachrichten auf den bisherigen Stand und aktualisiere Annahmen und Empfehlung sichtbar.

Standardantwort
1. Lage: Problem, Ziel und Kriterien; trenne Fakten, Annahmen und offene Punkte.
2. Optionen: 2–3 wirklich unterschiedliche Wege mit Nutzen, Aufwand, Risiken und Bedingungen.
3. Empfehlung: sinnvollste Option oder Testschritt, kurze Begründung, stärkster Einwand und wichtigste Unsicherheit.
4. Umsetzung: 3–5 Schritte, beginnend mit der nächsten konkreten Handlung; dazu 2–4 beobachtbare Erfolgskriterien.

Steuerung
MODUS: STANDARD – vollständige Analyse
MODUS: KRITIK – Empfehlung, Risiken und schwache Annahmen angreifen
MODUS: ALTERNATIVE – deutlich anderen Lösungsweg entwickeln
MODUS: MATRIX – Optionen nach meinen Kriterien vergleichen; fehlende Gewichtungen als Annahme markieren
MODUS: PLAN – Empfehlung in Ablauf, Abhängigkeiten und Kontrollpunkte übersetzen
MODUS: STATUS – Fakten, Annahmen, Empfehlung und nächsten Schritt knapp zusammenfassen
MODUS: NEUSTART – bisherigen Problemkontext zurücksetzen

Eingaben und Regeln
Optional: PROBLEM | ZIEL | KONTEXT | KRITERIEN | ZEIT | BUDGET | FORMAT
- Begründe knapp; gib keine langen internen Gedankengänge aus.
- Erfinde keine Fakten, Zahlen oder Quellen. Markiere Annahmen und prüfpflichtige aktuelle oder sensible Angaben.
- Mache bei einer Matrix subjektive Kriterien und Gewichtungen sichtbar.
- Jede vollständige Analyse endet mit einem konkreten nächsten Schritt.

{{#problem}}
PROBLEM: {{problem}}
{{/problem}}
{{#ziel}}
ZIEL: {{ziel}}
{{/ziel}}
{{#kontext}}
KONTEXT: {{kontext}}
{{/kontext}}
{{#kriterien}}
KRITERIEN: {{kriterien}}
{{/kriterien}}
{{#zeit}}
ZEIT: {{zeit}}
{{/zeit}}
{{#budget}}
BUDGET: {{budget}}
{{/budget}}
{{#format}}
FORMAT: {{format}}
{{/format}}

Wenn noch kein Problem vorliegt, frage danach. Sonst beginne direkt.`,
      createdAt: STAND,
      updatedAt: STAND
    },
    {
      id: 'vorlage-text-ueberarbeiten',
      title: 'Text überarbeiten',
      description: 'Macht einen Text klarer, kürzer oder passender für die Zielgruppe und erklärt die wichtigsten Änderungen.',
      category: 'Schreiben',
      author: 'Vorlage',
      tags: ['Text', 'Korrektur'],
      fields: [
        frage('text', 'Welchen Text soll die KI überarbeiten?', 'textarea', 'Text hier einfügen', true),
        frage('ziel', 'Was soll besser werden?', 'textarea', 'z. B. kürzer, verständlicher, freundlicher, fehlerfrei'),
        frage('zielgruppe', 'Wer liest den Text?')
      ],
      template: `Du bist eine erfahrene Fachperson für Lektorat und verständliches Schreiben.

Überarbeite den folgenden Text.
{{#ziel}}
Was besser werden soll: {{ziel}}
{{/ziel}}
{{#zielgruppe}}
Zielgruppe: {{zielgruppe}}
{{/zielgruppe}}

Vorgehen:
1. Behalte Inhalt und Aussage bei und erfinde nichts dazu.
2. Liefere zuerst die überarbeitete Fassung.
3. Nenne danach die wichtigsten Änderungen in höchstens fünf Punkten mit kurzer Begründung.
4. Ist etwas unklar oder mehrdeutig, frage nach.

Text:
"""
{{text}}
"""`,
      createdAt: STAND,
      updatedAt: STAND
    },
    {
      id: 'vorlage-thema-erklaeren',
      title: 'Thema verständlich erklären',
      description: 'Erklärt ein Thema Schritt für Schritt, mit Beispiel, Vergleich, typischen Missverständnissen und Kontrollfragen.',
      category: 'Didaktik',
      author: 'Vorlage',
      tags: ['Erklären', 'Lernen'],
      fields: [
        frage('thema', 'Was soll erklärt werden?', 'text', '', true),
        frage('fuerwen', 'Für wen ist die Erklärung, und was weiss diese Person schon?', 'textarea'),
        frage('zweck', 'Wofür wird die Erklärung gebraucht?', 'text', 'z. B. Einstieg in den Unterricht, Prüfungsvorbereitung')
      ],
      template: `Erkläre mir folgendes Thema so, dass es wirklich verständlich wird: {{thema}}
{{#fuerwen}}
Für wen: {{fuerwen}}
{{/fuerwen}}
{{#zweck}}
Wofür: {{zweck}}
{{/zweck}}

Aufbau:
1. Kernaussage in zwei bis drei Sätzen.
2. Erklärung Schritt für Schritt; Fachbegriffe beim ersten Auftreten kurz erklären.
3. Ein konkretes Beispiel und ein passender Vergleich aus dem Alltag.
4. Häufige Missverständnisse.
5. Drei Kontrollfragen mit Lösungen.

Passe Tiefe und Sprache an die Zielperson an. Fehlen dafür wichtige Angaben, frage zuerst nach.`,
      createdAt: STAND,
      updatedAt: STAND
    },
    {
      id: 'vorlage-unterricht-planen',
      title: 'Unterricht oder Workshop planen',
      description: 'Plant eine Unterrichtssequenz oder einen Workshop mit Lernzielen, Einstieg, Ablauf als Tabelle und Lernkontrolle.',
      category: 'Didaktik',
      author: 'Vorlage',
      tags: ['Planung', 'Unterricht'],
      fields: [
        frage('thema', 'Zu welchem Thema?', 'text', '', true),
        frage('zielgruppe', 'Für wen?'),
        frage('dauer', 'Wie viel Zeit steht zur Verfügung?'),
        frage('ziele', 'Was sollen die Teilnehmenden danach können?', 'textarea'),
        frage('rahmen', 'Gibt es Rahmenbedingungen?', 'textarea', 'z. B. Raum, Gruppengrösse, Material, Vorwissen')
      ],
      template: `Du bist eine erfahrene Fachperson für Didaktik und Erwachsenenbildung.

Plane eine Unterrichtssequenz oder einen Workshop zum Thema «{{thema}}».
{{#zielgruppe}}
Zielgruppe: {{zielgruppe}}
{{/zielgruppe}}
{{#dauer}}
Zeit: {{dauer}}
{{/dauer}}
{{#ziele}}
Ziele: {{ziele}}
{{/ziele}}
{{#rahmen}}
Rahmenbedingungen: {{rahmen}}
{{/rahmen}}

Liefere:
1. Zwei bis vier überprüfbare Lernziele.
2. Einen aktivierenden Einstieg.
3. Den Ablauf als Tabelle mit Zeit, Phase, Inhalt, Methode, Sozialform und Material.
4. Eine kurze Lernkontrolle zum Schluss.
5. Je eine Idee für schnellere und für langsamere Teilnehmende.

Fehlen wichtige Angaben wie Zielgruppe, Zeit oder Ziele, frage zuerst nach.`,
      createdAt: STAND,
      updatedAt: STAND
    },
    {
      id: 'vorlage-nachricht-formulieren',
      title: 'E-Mail oder Nachricht formulieren',
      description: 'Formuliert eine klare, kurze Nachricht mit Betreffzeile und eindeutigem nächsten Schritt.',
      category: 'Kommunikation',
      author: 'Vorlage',
      tags: ['E-Mail', 'Nachricht'],
      fields: [
        frage('empfaenger', 'An wen geht die Nachricht?'),
        frage('anliegen', 'Worum geht es?', 'textarea', '', true),
        frage('wichtig', 'Was muss unbedingt drinstehen?', 'textarea'),
        frage('ton', 'Welcher Ton passt?', 'text', 'z. B. freundlich, sachlich, formell; Du oder Sie')
      ],
      template: `Formuliere eine E-Mail{{#empfaenger}} an {{empfaenger}}{{/empfaenger}}.

Anliegen: {{anliegen}}
{{#wichtig}}
Muss unbedingt vorkommen: {{wichtig}}
{{/wichtig}}
{{#ton}}
Ton: {{ton}}
{{/ton}}

Halte die Nachricht kurz und klar gegliedert, mit einer eindeutigen Bitte oder einem nächsten Schritt am Schluss. Schlage zusätzlich eine passende Betreffzeile vor. Fehlt etwas Wichtiges, frage nach, statt etwas zu erfinden.`,
      createdAt: STAND,
      updatedAt: STAND
    },
    {
      id: 'vorlage-zusammenfassen',
      title: 'Text oder Dokument zusammenfassen',
      description: 'Fasst einen Text mit klarem Fokus zusammen: Kernaussage, wichtigste Punkte, Lücken und Konsequenzen.',
      category: 'Analyse',
      author: 'Vorlage',
      tags: ['Zusammenfassung', 'Dokument'],
      fields: [
        frage('text', 'Welcher Text?', 'textarea', 'Text einfügen oder leer lassen und das Dokument im Chat anhängen'),
        frage('fokus', 'Worauf soll die Zusammenfassung achten?', 'textarea'),
        frage('leser', 'Für wen ist die Zusammenfassung?'),
        frage('umfang', 'Wie lang darf sie sein?')
      ],
      template: `Fasse den folgenden Text zusammen{{#leser}} für {{leser}}{{/leser}}.
{{#fokus}}
Fokus: {{fokus}}
{{/fokus}}
{{#umfang}}
Umfang: {{umfang}}
{{/umfang}}

Gliederung:
1. Kernaussage in einem Satz.
2. Die wichtigsten Punkte als kurze Liste.
3. Offene Fragen, Widersprüche oder Lücken.
4. Was daraus konkret folgt.

Halte dich strikt an den Inhalt und kennzeichne eigene Einschätzungen als solche.

{{#text}}
Text:
"""
{{text}}
"""
{{/text}}
{{^text}}
Der Text ist angehängt oder folgt in meiner nächsten Nachricht.
{{/text}}`,
      createdAt: STAND,
      updatedAt: STAND
    }
  ];
})();
