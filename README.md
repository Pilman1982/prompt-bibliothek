# Prompt-Bibliothek

Gemeinsame Bibliothek für interaktive KI-Prompts: Prompt wählen, Fragen beantworten, fertigen «Mega-Prompt» kopieren.

**App:** <https://pilman1982.github.io/prompt-bibliothek/>

## 1. Nutzen (für alle)

- **Am Computer:** Link öffnen. Kein Konto nötig.
- **Als Handy-App:**
  - iPhone: Link in Safari öffnen → Teilen-Symbol → «Zum Home-Bildschirm».
  - Android: Link in Chrome öffnen → Menü ⋮ → «App installieren» bzw. «Zum Startbildschirm hinzufügen».
- **Prompt nutzen:** Karte antippen, Fragen beantworten, «Mega-Prompt erstellen & kopieren». Der Prompt liegt danach in der Zwischenablage. Auf dem Handy schickt «Teilen» ihn direkt an die ChatGPT-, Claude- oder Gemini-App.
- **Suche:** durchsucht Titel, Beschreibung, Template, Fragen, Autor und Tags. Gross/klein und Umlaute spielen keine Rolle.
- Die Prompts werden bei jedem Öffnen frisch von GitHub geladen. Es wird nichts zwischengespeichert.

## 2. Bearbeiten (mit Master-Passwort)

Schloss oben rechts → Master-Passwort → «Entsperren». Danach: «Neuer Prompt», Bearbeiten, Duplizieren, Löschen und das Menü «Verwaltung».

- Gespeicherte Änderungen sehen alle anderen **nach etwa einer Minute** (so lange braucht GitHub Pages).
- «Auf diesem Gerät angemeldet bleiben» nur auf dem eigenen Handy oder Laptop anhaken. Sonst endet der Edit-Modus, wenn der Tab geschlossen wird.

**Template-Syntax:**

| Schreibweise | Wirkung |
|---|---|
| `{{thema}}` | wird durch die Antwort auf die Frage «thema» ersetzt |
| `{{#thema}} … {{/thema}}` | erscheint nur, wenn die Frage beantwortet wurde; steht der Abschnitt allein auf einer Zeile, verschwindet sonst die ganze Zeile |

Neue Platzhalter im Template werden automatisch als Frage angelegt. Benennt man eine Frage um, passt sich das Template mit an. Feldtypen: Kurztext, Langtext, Auswahl.

## 3. Einrichtung (einmalig, ca. 5 Minuten)

Die App speichert über einen **GitHub-Schlüssel**, der nur dieses eine Repo ändern darf. Das Master-Passwort verschlüsselt diesen Schlüssel. Niemand im Team bekommt den Schlüssel selbst zu sehen.

1. **Schlüssel erstellen:** [Vorausgefülltes Formular öffnen](https://github.com/settings/personal-access-tokens/new?name=Prompt-Bibliothek&description=Speichern+aus+der+Prompt-Bibliothek&target_name=pilman1982&expires_in=none&contents=write)
   - Bei «Repository access» → **«Only select repositories»** → `prompt-bibliothek` wählen. Das ist der einzige Schritt, den GitHub nicht vorausfüllen kann.
   - Kontrolle unter «Permissions»: **Contents: Read and write** (Metadata: Read-only kommt automatisch dazu).
   - «Generate token» → Schlüssel kopieren (beginnt mit `github_pat_`). GitHub zeigt ihn nur einmal.
2. **Anmelden:** App öffnen → Schloss → Schlüssel einfügen → «Entsperren».
3. **Master-Passwort festlegen:** «Verwaltung» → «Master-Passwort festlegen» (mindestens 12 Zeichen) → dem Team mitteilen.

Danach braucht niemand mehr den Schlüssel, auch du nicht. Er kann gelöscht oder im Passwort-Manager abgelegt werden.

## 4. Wartung

| Situation | Vorgehen |
|---|---|
| Passwort ändern | Edit-Modus → «Verwaltung» → «Master-Passwort festlegen». Gilt nach etwa einer Minute. |
| Passwort vergessen | Neuen Schlüssel erstellen (Schritt 1), damit anmelden, Master-Passwort neu festlegen. |
| Notfall: Passwort in falschen Händen | Auf [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens) den Schlüssel «Prompt-Bibliothek» löschen. Danach kann niemand mehr speichern. Dann Schritte 1 bis 3 mit neuem Passwort. |
| Änderung rückgängig machen | «Verwaltung» → «Änderungsverlauf auf GitHub». Jede Änderung ist dort ein Eintrag. Alternativ ein Backup einspielen. |
| Backup | «Verwaltung» → «Backup exportieren» (JSON). Einspielen: «Backup importieren» → «Zusammenführen» oder «Alles ersetzen» (vorher wird automatisch eine Sicherung heruntergeladen). |

## 5. Wie es funktioniert

| Datei | Inhalt |
|---|---|
| `data/prompts.json` | die Datenbank: alle Prompts (gleiches Format wie ein Backup) |
| `data/zugang.json` | der GitHub-Schlüssel, verschlüsselt mit dem Master-Passwort (AES-256-GCM, PBKDF2 mit 600'000 Runden) |
| `index.html`, `style.css`, `app.js` | Oberfläche und Bedienung |
| `engine.js` | Template-Engine, Datenprüfung, Verschlüsselung (getestet) |
| `store.js` | Lesen und Speichern über GitHub; Demo-Modus |
| `config.js` | GitHub-Benutzer, Repo, Kategorien |
| `beispiele.js` | Beispiel-Prompts |
| `manifest.webmanifest`, `icons/` | Handy-App (Homescreen-Icon) |
| `tools/make_icons.py` | erzeugt die Icons neu |
| `tests/engine.test.js` | Tests: `node --test tests/engine.test.js` |

**Gut zu wissen:**
- Das Repo ist öffentlich (Voraussetzung für Gratis-GitHub-Pages). Alle können die Prompts lesen, auch auf GitHub. Darum keine vertraulichen Inhalte, und bei «Erstellt von» genügen Kürzel.
- Schreiben geht nur mit dem Master-Passwort. Der Schlüssel darf ausschliesslich dieses Repo ändern. Selbst im schlimmsten Fall lässt sich jeder Stand über den Änderungsverlauf zurückholen.
- **Demo-Modus:** `index.html` per Doppelklick öffnen (oder `?demo=1` an die Adresse hängen). Daten bleiben dann nur im Browser, Passwort `demo`.
- **App-Code ändern:** Dateien im Repo ersetzen und in `index.html` die Zahl hinter `?v=` erhöhen, damit Browser die neue Version laden.
