/*
 * Beispiel-Prompts. Werden im Demo-Modus automatisch geladen und lassen sich
 * im Edit-Modus über «Verwaltung → Beispiel-Prompts hinzufügen» in die Datenbank übernehmen.
 * Feste IDs: Mehrfaches Hinzufügen überschreibt die Beispiele, statt sie zu verdoppeln.
 */
window.PB_SAMPLES = [
  {
    id: 'beispiel-lektion-planen',
    title: 'Lektion planen',
    description: 'Plant eine Lektion mit Lernzielen, Einstieg, Ablauf als Tabelle, Lernkontrolle und Differenzierung.',
    category: 'Didaktik',
    author: 'Vorlage',
    tags: ['Planung', 'Lektion'],
    fields: [
      { key: 'thema', label: 'Was ist das genaue Thema der Lektion?', type: 'text', required: true, placeholder: 'z. B. Kritische Kontrollpunkte beim Abkühlen von Speisen', default: '' },
      { key: 'zielgruppe', label: 'Für welche Zielgruppe?', type: 'select', required: true, placeholder: '', default: 'Studierende HF', options: ['Lernende EFZ', 'Studierende HF', 'Erwachsene in der Weiterbildung'] },
      { key: 'dauer', label: 'Wie lange dauert die Lektion?', type: 'select', required: true, placeholder: '', default: '90 Minuten', options: ['45 Minuten', '90 Minuten', 'einen Halbtag (ca. 3,5 Stunden)'] },
      { key: 'vorwissen', label: 'Was weiss die Klasse bereits?', type: 'textarea', required: false, placeholder: 'z. B. Grundlagen HACCP bekannt, noch keine Praxis im Messen', default: '' },
      { key: 'einschraenkungen', label: 'Gibt es Einschränkungen zur Umsetzung?', type: 'textarea', required: false, placeholder: 'z. B. kein Beamer, 24 Personen, Lehrküche verfügbar', default: '' },
      { key: 'rolle', label: 'Welche Rolle soll die KI einnehmen?', type: 'text', required: true, placeholder: '', default: 'eine erfahrene Lehrperson an einer Höheren Fachschule für Hotellerie und Gastronomie' }
    ],
    template: `Du bist {{rolle}}.

Plane eine Lektion von {{dauer}} zum Thema «{{thema}}» für {{zielgruppe}}.
{{#vorwissen}}
Vorwissen der Klasse: {{vorwissen}}
{{/vorwissen}}
{{#einschraenkungen}}
Rahmenbedingungen, die zwingend einzuhalten sind: {{einschraenkungen}}
{{/einschraenkungen}}

Liefere:
1. Zwei bis drei überprüfbare Lernziele mit Angabe der Taxonomiestufe (K1 bis K6).
2. Einen aktivierenden Einstieg mit konkretem Bezug zum Berufsalltag.
3. Den Ablauf als Tabelle mit den Spalten Zeit, Phase, Inhalt, Methode, Sozialform und Material.
4. Eine kurze Lernkontrolle für den Schluss der Lektion.
5. Je eine Variante für schnellere und für langsamere Lernende.

Schreibe in Schweizer Rechtschreibung (kein ß) und so konkret, dass ich die Lektion direkt umsetzen kann.`,
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z'
  },
  {
    id: 'beispiel-pruefungsfragen',
    title: 'Prüfungsfragen mit Musterlösung',
    description: 'Erstellt Prüfungsfragen in wählbarem Typ und Niveau, inklusive Musterlösung, Punkten und Übersichtstabelle.',
    category: 'Didaktik',
    author: 'Vorlage',
    tags: ['Prüfung', 'Bewertung'],
    fields: [
      { key: 'thema', label: 'Zu welchem Thema?', type: 'text', required: true, placeholder: 'z. B. Lagerung von Lebensmitteln', default: '' },
      { key: 'zielgruppe', label: 'Für welche Zielgruppe?', type: 'select', required: true, placeholder: '', default: 'Studierende HF', options: ['Lernende EFZ', 'Studierende HF', 'Erwachsene in der Weiterbildung'] },
      { key: 'anzahl', label: 'Wie viele Fragen?', type: 'select', required: true, placeholder: '', default: '10', options: ['5', '10', '15', '20'] },
      { key: 'fragetyp', label: 'Welcher Fragetyp?', type: 'select', required: true, placeholder: '', default: 'Gemischt', options: ['Multiple Choice (4 Antworten, 1 richtig)', 'Offene Fragen', 'Fallbeispiele aus der Praxis', 'Gemischt'] },
      { key: 'niveau', label: 'Auf welchem Niveau?', type: 'select', required: true, placeholder: '', default: 'Anwendung (K3)', options: ['Wissen und Verstehen (K1, K2)', 'Anwendung (K3)', 'Analyse und Beurteilung (K4 bis K6)'] },
      { key: 'grundlage', label: 'Auf welchen Lernzielen oder Unterlagen sollen die Fragen beruhen?', type: 'textarea', required: false, placeholder: 'Lernziele oder Stichworte aus dem Unterricht einfügen', default: '' }
    ],
    template: `Du bist eine erfahrene Fachperson für Prüfungen in der Berufsbildung.

Erstelle {{anzahl}} Prüfungsfragen zum Thema «{{thema}}» für {{zielgruppe}}.
Fragetyp: {{fragetyp}}
Niveau: {{niveau}}
{{#grundlage}}
Stütze dich ausschliesslich auf folgende Grundlage:
{{grundlage}}
{{/grundlage}}

Anforderungen:
- Jede Frage ist eindeutig formuliert und prüft genau ein Lernziel.
- Gib zu jeder Frage die Musterlösung und die Punktzahl an.
- Bei Multiple Choice: plausible Falschantworten, keine Antworten wie «alle oben genannten».
- Gib am Schluss eine Tabelle mit Frage, Lernziel, Niveau und Punkten aus.

Schreibe in Schweizer Rechtschreibung (kein ß).`,
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z'
  },
  {
    id: 'beispiel-email',
    title: 'E-Mail formulieren',
    description: 'Formuliert eine klare, kurze E-Mail mit Betreffzeile, passend zu Empfänger, Anliegen und Ton.',
    category: 'Administration',
    author: 'Vorlage',
    tags: ['Kommunikation', 'E-Mail'],
    fields: [
      { key: 'empfaenger', label: 'An wen geht die E-Mail?', type: 'text', required: true, placeholder: 'z. B. Klasse HF 2A, Schulleitung, Lieferant', default: '' },
      { key: 'anliegen', label: 'Worum geht es?', type: 'textarea', required: true, placeholder: 'z. B. Die Prüfung wird vom 12. auf den 19. November verschoben', default: '' },
      { key: 'punkte', label: 'Was muss unbedingt drinstehen?', type: 'textarea', required: false, placeholder: 'z. B. neuer Raum, mitzubringendes Material, Frist für Rückmeldungen', default: '' },
      { key: 'ton', label: 'Welcher Ton?', type: 'select', required: true, placeholder: '', default: 'freundlich und sachlich', options: ['freundlich und sachlich', 'formell', 'kurz und knapp', 'herzlich'] },
      { key: 'anrede', label: 'Du oder Sie?', type: 'select', required: true, placeholder: '', default: 'Sie', options: ['Sie', 'Du'] }
    ],
    template: `Formuliere eine E-Mail an {{empfaenger}}.

Anliegen: {{anliegen}}
{{#punkte}}
Diese Punkte müssen zwingend vorkommen:
{{punkte}}
{{/punkte}}

Ton: {{ton}}. Anrede: {{anrede}}.
Halte die E-Mail kurz, klar gegliedert und mit einer eindeutigen Handlungsaufforderung am Schluss. Schlage zusätzlich eine prägnante Betreffzeile vor.
Schreibe in Schweizer Rechtschreibung (kein ß, Grussformel «Freundliche Grüsse»).`,
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z'
  },
  {
    id: 'beispiel-dokument-analysieren',
    title: 'Dokument analysieren',
    description: 'Analysiert ein eingefügtes Dokument mit klarem Fokus: Kernaussagen, Analyse, Lücken und nächste Schritte.',
    category: 'Analyse',
    author: 'Vorlage',
    tags: ['Zusammenfassung', 'Reglement'],
    fields: [
      { key: 'dokumenttyp', label: 'Was für ein Dokument ist es?', type: 'text', required: true, placeholder: 'z. B. Reglement, Studie, Zeitungsartikel, Gesetzestext', default: '' },
      { key: 'ziel', label: 'Worauf soll die Analyse fokussieren?', type: 'textarea', required: true, placeholder: 'z. B. Was ändert sich für unsere Studierenden im Praktikum?', default: '' },
      { key: 'format', label: 'In welchem Format?', type: 'select', required: true, placeholder: '', default: 'Stichpunkte', options: ['Stichpunkte', 'Tabelle', 'Fliesstext'] },
      { key: 'laenge', label: 'Wie ausführlich?', type: 'select', required: true, placeholder: '', default: 'kurz, höchstens eine halbe Seite', options: ['kurz, höchstens eine halbe Seite', 'mittel, etwa eine Seite', 'ausführlich'] },
      { key: 'rolle', label: 'Aus welcher Perspektive soll die KI analysieren?', type: 'text', required: true, placeholder: '', default: 'eine sorgfältige Fachperson für Bildungsfragen' }
    ],
    template: `Du bist {{rolle}}.

Analysiere das unten eingefügte Dokument ({{dokumenttyp}}).
Fokus der Analyse: {{ziel}}

Gliedere die Antwort so:
1. Kernaussagen in drei Sätzen
2. Analyse zum Fokus ({{format}}, {{laenge}})
3. Offene Fragen, Widersprüche oder Lücken im Dokument
4. Konkrete Konsequenzen oder nächste Schritte

Halte dich strikt an den Inhalt des Dokuments und kennzeichne eigene Einschätzungen als solche.
Schreibe in Schweizer Rechtschreibung (kein ß).

--- DOKUMENT ---
[Hier den Text einfügen oder das Dokument anhängen]`,
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z'
  },
  {
    id: 'beispiel-haccp-gefahrenanalyse',
    title: 'HACCP-Gefahrenanalyse',
    description: 'Erstellt eine Gefahrenanalyse mit Fliessdiagramm, CCP-Bestimmung, Grenzwerten und Korrekturmassnahmen.',
    category: 'Analyse',
    author: 'Vorlage',
    tags: ['HACCP', 'Hygiene', 'Selbstkontrolle'],
    fields: [
      { key: 'prozess', label: 'Welches Produkt oder welcher Prozess?', type: 'text', required: true, placeholder: 'z. B. Sous-vide gegarte Schweinsschulter für ein Bankett', default: '' },
      { key: 'betrieb', label: 'In welchem Betrieb?', type: 'select', required: true, placeholder: '', default: '', options: ['À-la-carte-Restaurant', 'Hotelküche mit Bankett', 'Gemeinschaftsgastronomie', 'Catering'] },
      { key: 'zweck', label: 'Wofür wird die Analyse gebraucht?', type: 'select', required: true, placeholder: '', default: 'als Unterrichtsbeispiel', options: ['als Unterrichtsbeispiel', 'für das Selbstkontrollkonzept eines Betriebs', 'als Prüfungsaufgabe mit Lösung'] },
      { key: 'schritte', label: 'Welche Prozessschritte sind schon bekannt?', type: 'textarea', required: false, placeholder: 'z. B. Wareneingang, Lagerung, Vorbereitung, Garen, Abkühlen, Regenerieren, Ausgabe', default: '' }
    ],
    template: `Du bist eine erfahrene Fachperson für Lebensmittelsicherheit und HACCP in der Schweizer Gastronomie.

Erstelle eine HACCP-Gefahrenanalyse für: {{prozess}}
Betrieb: {{betrieb}}
Verwendungszweck: {{zweck}}
{{#schritte}}
Bekannte Prozessschritte: {{schritte}}
{{/schritte}}

Vorgehen:
1. Stelle die Prozessschritte als Fliessdiagramm dar{{#schritte}} und ergänze fehlende Schritte{{/schritte}}.
2. Analysiere pro Schritt die biologischen, chemischen und physikalischen Gefahren.
3. Bestimme die kritischen Kontrollpunkte (CCP) mit dem Entscheidungsbaum und begründe jeden Entscheid.
4. Lege für jeden CCP Grenzwert, Überwachung (wer, wie, wie oft), Korrekturmassnahme und Dokumentation fest.
5. Gib das Ergebnis als Tabelle aus.

Stütze dich auf das Schweizer Lebensmittelrecht (insbesondere die Hygieneverordnung des EDI, HyV) und die Branchenleitlinie GVG (Gute Verfahrenspraxis im Gastgewerbe). Weise darauf hin, wo betriebsspezifische Werte geprüft werden müssen.
Schreibe in Schweizer Rechtschreibung (kein ß).`,
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z'
  },
  {
    id: 'beispiel-feedback',
    title: 'Feedback zu einer Arbeit',
    description: 'Formuliert ein wertschätzendes, klares schriftliches Feedback mit Stärken, Verbesserungen und Ausblick.',
    category: 'Kommunikation',
    author: 'Vorlage',
    tags: ['Feedback', 'Bewertung'],
    fields: [
      { key: 'arbeit', label: 'Zu welcher Arbeit?', type: 'text', required: true, placeholder: 'z. B. Semesterarbeit zur Menüplanung', default: '' },
      { key: 'staerken', label: 'Was ist gut gelungen?', type: 'textarea', required: true, placeholder: 'Stichworte genügen', default: '' },
      { key: 'verbesserung', label: 'Was muss besser werden?', type: 'textarea', required: true, placeholder: 'Stichworte genügen', default: '' },
      { key: 'note', label: 'Gibt es eine Note oder Bewertung?', type: 'text', required: false, placeholder: 'z. B. 4.5', default: '' },
      { key: 'ton', label: 'Welcher Ton?', type: 'select', required: true, placeholder: '', default: 'ermutigend', options: ['ermutigend', 'sachlich', 'direkt und klar'] },
      { key: 'anrede', label: 'Du oder Sie?', type: 'select', required: true, placeholder: '', default: 'Du', options: ['Du', 'Sie'] }
    ],
    template: `Du bist eine wertschätzende und klare Lehrperson.

Formuliere ein schriftliches Feedback zu folgender Arbeit: {{arbeit}}

Stärken: {{staerken}}
Verbesserungspunkte: {{verbesserung}}
{{#note}}
Bewertung: {{note}}. Begründe sie nachvollziehbar.
{{/note}}

Aufbau: zuerst konkrete Stärken, dann höchstens drei Verbesserungspunkte mit je einem umsetzbaren Tipp, am Schluss ein motivierender Ausblick.
Ton: {{ton}}. Anrede: {{anrede}}. Höchstens 200 Wörter.
Schreibe in Schweizer Rechtschreibung (kein ß).`,
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z'
  }
];
