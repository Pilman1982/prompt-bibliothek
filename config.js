/*
 * Einstellungen der Prompt-Bibliothek.
 *
 * Die Prompts liegen in diesem GitHub-Repo in data/prompts.json.
 * Per Doppelklick auf index.html (oder mit ?demo=1 in der Adresse) läuft die App im DEMO-MODUS:
 * Daten bleiben nur in diesem Browser, Passwort für den Edit-Modus ist «demo».
 */
window.PB_CONFIG = {
  appTitle: 'Prompt-Bibliothek',

  github: {
    owner: 'pilman1982',               // GitHub-Benutzername
    repo: 'prompt-bibliothek',         // Name des Repos
    branch: 'main',
    dataPath: 'data/prompts.json',     // die Prompts
    accessPath: 'data/zugang.json'     // verschlüsselter GitHub-Schlüssel (Master-Passwort)
  },

  // Vorschläge im Editor. Diese Kategorien erhalten feste, gut unterscheidbare Farben.
  // Weitere Kategorien kann man jederzeit frei eintippen.
  categories: ['Didaktik', 'Administration', 'Analyse', 'Kommunikation']
};
