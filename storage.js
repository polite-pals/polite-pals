/* storage.js — thin wrapper around localStorage so the rest of the app
   never touches JSON.parse/stringify or key names directly. Everything
   is namespaced under "yma_" (Yes Ma'am App) so it won't collide with
   anything else if this is ever hosted alongside other pages. */

const STORAGE_KEYS = {
  settings: "yma_settings",
  sessions: "yma_sessions",
  customQuestions: "yma_custom_questions"
};

const DEFAULT_SETTINGS = {
  // Verbal answers are the whole point of this app, so listening is on
  // by default. Tap-to-answer stays available as a fallback (mic
  // permission denied, unsupported browser, noisy room) but is no
  // longer the primary path.
  speechRecognitionEnabled: true,
  activeAskerIds: DEFAULT_ASKERS.map(a => a.id)
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Storage read failed for", key, e);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage write failed for", key, e);
  }
}

const Storage = {
  loadSettings() {
    const stored = readJSON(STORAGE_KEYS.settings, {});
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  saveSettings(partial) {
    const current = Storage.loadSettings();
    const next = { ...current, ...partial };
    writeJSON(STORAGE_KEYS.settings, next);
    return next;
  },

  loadSessions() {
    return readJSON(STORAGE_KEYS.sessions, []);
  },

  addSession(session) {
    const sessions = Storage.loadSessions();
    sessions.unshift({
      id: `s_${Date.now()}`,
      date: new Date().toISOString(),
      ...session
    });
    // Keep the most recent 100 sessions so storage doesn't grow forever.
    const trimmed = sessions.slice(0, 100);
    writeJSON(STORAGE_KEYS.sessions, trimmed);
    return trimmed;
  },

  loadCustomQuestions() {
    return readJSON(STORAGE_KEYS.customQuestions, []);
  },

  addCustomQuestion(question) {
    const questions = Storage.loadCustomQuestions();
    questions.push({ id: `q_${Date.now()}`, ...question });
    writeJSON(STORAGE_KEYS.customQuestions, questions);
    return questions;
  },

  removeCustomQuestion(id) {
    const questions = Storage.loadCustomQuestions().filter(q => q.id !== id);
    writeJSON(STORAGE_KEYS.customQuestions, questions);
    return questions;
  },

  resetProgress() {
    localStorage.removeItem(STORAGE_KEYS.sessions);
  },

  resetEverything() {
    localStorage.removeItem(STORAGE_KEYS.sessions);
    localStorage.removeItem(STORAGE_KEYS.settings);
    localStorage.removeItem(STORAGE_KEYS.customQuestions);
  }
};
