/* app.js — screens, routing, and game logic for the Yes Sir / Yes Ma'am
   practice app. No framework, no build step: a small state object plus
   functions that re-render #app as innerHTML. Kept this way on purpose
   so the whole app is just "open index.html" — no server required,
   which matters since it needs to run happily from an iPad. */

const state = {
  screen: "home", // home | quiz | quiz-summary | roleplay-list | roleplay | roleplay-summary | magic-list | magic | magic-summary | dashboard | stickers
  settings: Storage.loadSettings(),
  quiz: null,
  roleplay: null,
  magic: null,
  dashDraft: { text: "", expected: "yes" }
};

const ROUND_LENGTH = 6;

const root = document.getElementById("app");

function render() {
  root.innerHTML = "";
  const view = {
    home: renderHome,
    quiz: renderQuiz,
    "quiz-summary": renderQuizSummary,
    "roleplay-list": renderRoleplayList,
    roleplay: renderRoleplay,
    "roleplay-summary": renderRoleplaySummary,
    "magic-list": renderMagicList,
    magic: renderMagic,
    "magic-summary": renderMagicSummary,
    dashboard: renderDashboard,
    stickers: renderStickers
  }[state.screen];
  root.appendChild(view());
}

function go(screen) {
  // Only the quiz/roleplay/magic screens want the mic session alive;
  // landing anywhere else (home, dashboard, a summary screen) means
  // the round is over, so close it out. Entering quiz/roleplay/magic
  // itself is handled by startQuiz()/startRoleplay()/startMagicGame(),
  // which open the session from the tap that triggered them — a real
  // user gesture.
  if (screen !== "quiz" && screen !== "roleplay" && screen !== "magic") {
    Audio_.endSession();
  }
  state.screen = screen;
  render();
}

/* Shown when the continuous mic session hits a real problem (denied
   permission, unsupported browser, or a start failure). Works from
   whichever screen happens to be open since it's only ever triggered
   while quiz/roleplay is active. */
function handleMicSessionError(reason) {
  const hint = document.getElementById("listening-hint");
  const micBtn = document.getElementById("mic-button");
  const fallbackGrid = document.querySelector(".answer-grid-small");
  if (reason === "not-allowed" || reason === "service-not-allowed") {
    if (hint) hint.textContent = "Please allow microphone access, or tap your answer below.";
  } else if (reason === "unsupported") {
    if (hint) hint.textContent = "Voice isn't available here — tap your answer below.";
  } else {
    if (hint) hint.textContent = "Tap the mic to try again, or tap your answer below.";
  }
  if (fallbackGrid) fallbackGrid.classList.remove("hidden");
  if (micBtn) micBtn.classList.remove("listening");
}

/* ---------- small DOM helpers ---------- */
function el(tag, className, html) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function topbar(title, backTo) {
  const bar = el("div", "topbar");
  const back = el("button", "back-button", "←");
  back.setAttribute("aria-label", "Back");
  back.onclick = () => go(backTo);
  bar.appendChild(back);
  bar.appendChild(el("div", "app-title", title));
  bar.appendChild(el("div", "spacer-52"));
  return bar;
}

/* ---------- avatars, drawn in code so no image assets are needed ---------- */
function askerAvatarSVG(asker) {
  const hairShape =
    asker.accessory === "bun"
      ? `<circle cx="50" cy="18" r="10" fill="${asker.hair}"/><path d="M18 40 C18 16 82 16 82 40 L82 46 C60 30 40 30 18 46 Z" fill="${asker.hair}"/>`
      : asker.accessory === "cap"
      ? `<path d="M14 42 C14 16 86 16 86 42 L86 46 L14 46 Z" fill="${asker.hair}"/><rect x="8" y="40" width="30" height="8" rx="4" fill="${asker.hair}"/>`
      : `<path d="M16 42 C16 12 84 12 84 42 L84 30 C60 40 40 40 16 30 Z" fill="${asker.hair}"/>`;

  const glasses =
    asker.accessory === "glasses"
      ? `<circle cx="38" cy="54" r="9" fill="none" stroke="#3B2F63" stroke-width="3"/>
         <circle cx="62" cy="54" r="9" fill="none" stroke="#3B2F63" stroke-width="3"/>
         <line x1="47" y1="54" x2="53" y2="54" stroke="#3B2F63" stroke-width="3"/>`
      : "";

  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${asker.name}">
      <circle cx="50" cy="56" r="34" fill="${asker.skin}"/>
      ${hairShape}
      <circle cx="38" cy="54" r="3.4" fill="#3B2F63"/>
      <circle cx="62" cy="54" r="3.4" fill="#3B2F63"/>
      <path d="M38 68 Q50 78 62 68" stroke="#3B2F63" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      ${glasses}
    </svg>`;
}

function mascotSVG(mood) {
  const mouth =
    mood === "happy"
      ? `<path d="M36 58 Q50 74 64 58" stroke="#3B2F63" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<path d="M40 60 Q50 66 60 60" stroke="#3B2F63" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const rays = Array.from({ length: 8 })
    .map((_, i) => {
      const angle = (i * 360) / 8;
      return `<rect x="47" y="2" width="6" height="16" rx="3" fill="#FFC94A" transform="rotate(${angle} 50 50)"/>`;
    })
    .join("");
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sunny the helper">
      ${rays}
      <circle cx="50" cy="50" r="30" fill="#FFD873"/>
      <circle cx="40" cy="46" r="4" fill="#3B2F63"/>
      <circle cx="60" cy="46" r="4" fill="#3B2F63"/>
      <circle cx="34" cy="56" r="5" fill="#FFB199" opacity="0.7"/>
      <circle cx="66" cy="56" r="5" fill="#FFB199" opacity="0.7"/>
      ${mouth}
    </svg>`;
}

function activeAskers() {
  const ids = state.settings.activeAskerIds && state.settings.activeAskerIds.length
    ? state.settings.activeAskerIds
    : DEFAULT_ASKERS.map(a => a.id);
  return DEFAULT_ASKERS.filter(a => ids.includes(a.id));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function politeLine(asker, yes) {
  return `${yes ? "Yes" : "No"}, ${asker.honorific}!`;
}

/* Parses a spoken transcript for a yes/no answer and whether the
   correct honorific (sir/ma'am) was said. Deliberately lenient with
   "ma'am" since speech-to-text renders it inconsistently
   (ma'am / maam / madam). Returns nulls when nothing clear was heard,
   rather than guessing — callers treat null as "didn't catch that". */
function parseSpokenAnswer(transcript, honorific) {
  const t = ` ${transcript.toLowerCase()} `;
  const saidYes = /\byes\b/.test(t);
  const saidNo = /\bno\b/.test(t);
  let heardYesNo = null;
  if (saidYes && !saidNo) heardYesNo = true;
  else if (saidNo && !saidYes) heardYesNo = false;

  const saidSir = /\bsir\b/.test(t);
  const saidMaam = /\b(ma'?am|madam)\b/.test(t);
  const honorificMatch = honorific === "sir" ? saidSir && !saidMaam : saidMaam && !saidSir;

  return { heardYesNo, honorificMatch };
}

/* Parses a spoken transcript for one of the four magic-word phrases.
   Checked most-specific-first since "may I please" and "please" share
   a word — a transcript containing "may i" should register as "mayi",
   not "please". Returns null when nothing clear was heard. */
function parseMagicWordAnswer(transcript) {
  const t = ` ${transcript.toLowerCase()} `;
  if (/\bmay i\b/.test(t)) return "mayi";
  if (/\bthank you\b/.test(t)) return "thankyou";
  if (/\b(you'?re welcome|your welcome|welcome)\b/.test(t)) return "welcome";
  if (/\bplease\b/.test(t)) return "please";
  return null;
}

/* ==========================================================================
   HOME
   ========================================================================== */
function renderHome() {
  const screen = el("div", "screen");

  const hero = el("div", "hero");
  hero.innerHTML = `<h1>Let's Practice<br/>Being Polite!</h1><p>Tap a game to start</p>`;
  screen.appendChild(hero);

  const mascot = el("div", "mascot-wrap", mascotSVG("happy"));
  screen.appendChild(mascot);

  const grid = el("div", "tile-grid");

  const quizTile = el("button", "tile tile-quiz");
  quizTile.innerHTML = `
    <div class="tile-icon">${simpleIcon("quiz")}</div>
    <div class="tile-text"><h2>Practice Quiz</h2><p>Answer questions with "yes" and "no"</p></div>`;
  quizTile.onclick = () => startQuiz();
  grid.appendChild(quizTile);

  const roleplayTile = el("button", "tile tile-roleplay");
  roleplayTile.innerHTML = `
    <div class="tile-icon">${simpleIcon("roleplay")}</div>
    <div class="tile-text"><h2>Let's Pretend</h2><p>Practice with Grandma, Grandpa, and friends</p></div>`;
  roleplayTile.onclick = () => go("roleplay-list");
  grid.appendChild(roleplayTile);

  const magicTile = el("button", "tile tile-magic");
  magicTile.innerHTML = `
    <div class="tile-icon">${simpleIcon("magic")}</div>
    <div class="tile-text"><h2>Magic Words</h2><p>Practice please, thank you, and may I</p></div>`;
  magicTile.onclick = () => go("magic-list");
  grid.appendChild(magicTile);

  const stickersTile = el("button", "tile tile-stickers");
  const stickerCount = Storage.loadStickers().length;
  stickersTile.innerHTML = `
    <div class="tile-icon">${simpleIcon("stickers")}</div>
    <div class="tile-text"><h2>My Stickers</h2><p>${
      stickerCount ? `${stickerCount} collected so far` : "Answer questions to start collecting"
    }</p></div>`;
  stickersTile.onclick = () => go("stickers");
  grid.appendChild(stickersTile);

  const dashTile = el("button", "tile tile-dashboard");
  dashTile.innerHTML = `
    <div class="tile-icon">${simpleIcon("dashboard")}</div>
    <div class="tile-text"><h2>Grown-Up Corner</h2><p>Progress, settings, and questions</p></div>`;
  dashTile.onclick = () => go("dashboard");
  grid.appendChild(dashTile);

  screen.appendChild(grid);
  return screen;
}

function simpleIcon(kind) {
  if (kind === "quiz") {
    return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.25)"/>
      <text x="32" y="42" font-size="30" text-anchor="middle" fill="#fff" font-family="Fredoka, sans-serif">?</text></svg>`;
  }
  if (kind === "roleplay") {
    return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.25)"/>
      <circle cx="24" cy="28" r="8" fill="#fff"/><circle cx="42" cy="34" r="8" fill="#fff" opacity="0.75"/></svg>`;
  }
  if (kind === "stickers") {
    return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.25)"/>
      <text x="32" y="42" font-size="26" text-anchor="middle">⭐</text></svg>`;
  }
  if (kind === "magic") {
    return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.25)"/>
      <text x="32" y="42" font-size="26" text-anchor="middle">✨</text></svg>`;
  }
  return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.25)"/>
    <rect x="18" y="20" width="28" height="20" rx="4" fill="#fff"/><rect x="24" y="44" width="16" height="4" rx="2" fill="#fff"/></svg>`;
}

/* ==========================================================================
   STICKER COLLECTION
   ========================================================================== */
function renderStickers() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("My Stickers", "home"));
  screen.appendChild(el("div", "mascot-wrap", mascotSVG("happy")));

  const earned = Storage.loadStickers();
  const counts = new Map();
  earned.forEach(s => counts.set(s.name, (counts.get(s.name) || 0) + 1));

  const grid = el("div", "sticker-grid");
  STICKER_POOL.forEach(sticker => {
    const count = counts.get(sticker.name) || 0;
    const card = el("div", `sticker-card${count ? "" : " locked"}`);
    card.innerHTML = `
      <div class="sticker-card-emoji">${sticker.emoji}</div>
      <div class="sticker-card-name">${sticker.name}</div>
      ${count > 1 ? `<div class="sticker-card-count">×${count}</div>` : ""}`;
    grid.appendChild(card);
  });
  screen.appendChild(grid);

  if (!earned.length) {
    screen.appendChild(el("div", "empty-note", "Answer questions politely to start earning stickers!"));
  }

  return screen;
}

/* ==========================================================================
   QUIZ MODE
   ========================================================================== */
function buildQuestionPool() {
  const custom = Storage.loadCustomQuestions().map(q => ({
    spoken: q.text,
    expected: q.expected
  }));
  return [...DEFAULT_QUESTIONS, ...custom];
}

function startQuiz() {
  const pool = buildQuestionPool();
  const askers = activeAskers();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const rounds = shuffled.slice(0, Math.min(ROUND_LENGTH, shuffled.length)).map(q => ({
    question: q,
    asker: randomFrom(askers)
  }));
  state.quiz = { rounds, index: 0, correct: 0, awaitingAdvance: false };
  // Open the mic session right here, synchronously, inside the tap
  // that started the round — this is what makes it a real user
  // gesture in the browser's eyes, so it only asks permission once
  // for the whole round instead of once per question.
  if (state.settings.speechRecognitionEnabled) {
    Audio_.startSession(handleMicSessionError);
  }
  go("quiz");
}

function currentQuizRound() {
  return state.quiz.rounds[state.quiz.index];
}

function renderQuiz() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("Practice Quiz", "home"));

  const mascotWrap = el("div", "mascot-wrap");
  mascotWrap.id = "mascot";
  mascotWrap.innerHTML = mascotSVG("idle");
  screen.appendChild(mascotWrap);

  const dots = el("div", "progress-dots");
  state.quiz.rounds.forEach((_, i) => {
    const d = el("div", "dot");
    if (i < state.quiz.index) d.classList.add("done");
    if (i === state.quiz.index) d.classList.add("current");
    dots.appendChild(d);
  });
  screen.appendChild(dots);

  const round = currentQuizRound();
  const asker = round.asker;

  const card = el("div", "asker-card");
  card.innerHTML = `
    <div class="asker-avatar">${askerAvatarSVG(asker)}</div>
    <div class="asker-name">${asker.name} asks:</div>
    <div class="asker-line" id="quiz-line">${round.question.spoken}</div>`;
  const replay = el("button", "replay-button", "🔊 Hear it again");
  replay.onclick = () => speakCurrentQuizQuestion();
  card.appendChild(replay);
  screen.appendChild(card);

  screen.appendChild(buildAnswerCaptureUI(asker, (result) => finalizeQuizAnswer(result)));

  screen.appendChild(el("div", "feedback-banner", ""));

  // Speak the question once the screen is in the DOM.
  requestAnimationFrame(() => speakCurrentQuizQuestion());

  return screen;
}

/* Tracks the "start accepting an answer" function for whichever
   answer-capture UI is currently on screen, so speakCurrentQuizQuestion/
   speakCurrentBeat can call it once the question finishes being read
   aloud — without needing a fresh tap every single time. Null whenever
   voice answers are off/unsupported (fallback-only mode). */
let activeMicTrigger = null;

/* Builds the shared "answer the question" UI: a big mic button that
   auto-activates right after the question is read aloud (that's the
   whole point of the app — verbal practice), plus a de-emphasized tap
   fallback for when voice isn't an option (mic permission denied,
   unsupported browser, or a noisy room).

   Important: this does NOT open a new microphone connection. The mic
   session is opened once per round (see startQuiz/startRoleplay) and
   stays open continuously; this function just toggles whether we're
   currently paying attention to it (`Audio_.setAccepting`) and which
   callback gets the next transcript. That's what keeps the browser
   from re-asking for mic permission on every question. `onResult` is
   called with { heardYesNo, honorificOK } either way, so the calling
   screen doesn't need to know whether the answer was spoken or tapped. */
function buildAnswerCaptureUI(asker, onResult) {
  const wrap = el("div", "answer-capture");

  const micBtn = el("button", "mic-button", micIconSVG());
  micBtn.id = "mic-button";
  micBtn.setAttribute("aria-label", "Tap and answer out loud");
  const hint = el("div", "listening-hint", "Get ready to answer out loud!");
  hint.id = "listening-hint";

  function setListeningVisual(isListening) {
    micBtn.classList.toggle("listening", isListening);
    hint.classList.toggle("active", isListening);
    if (isListening) hint.textContent = "I'm listening...";
  }

  function beginAccepting() {
    if (!Audio_.isRecognitionSupported() || !state.settings.speechRecognitionEnabled) {
      hint.textContent = Audio_.isRecognitionSupported()
        ? "Tap your answer:"
        : "Voice isn't available in this browser — tap your answer:";
      revealFallback();
      return;
    }
    // If the session died (e.g. after a transient error) a tap here is
    // a real user gesture, so it's a safe place to try reopening it.
    if (!Audio_.isSessionActive()) {
      Audio_.startSession(handleMicSessionError);
    }
    Audio_.setTranscriptHandler((transcript) => {
      Audio_.setAccepting(false);
      setListeningVisual(false);
      const parsed = parseSpokenAnswer(transcript, asker.honorific);
      onResult({ heardYesNo: parsed.heardYesNo, honorificOK: parsed.honorificMatch });
    });
    Audio_.setAccepting(true);
    setListeningVisual(true);
  }
  micBtn.onclick = beginAccepting;

  wrap.appendChild(micBtn);
  wrap.appendChild(hint);

  const fallbackToggle = el("button", "fallback-toggle", "Can't use the mic? Tap your answer instead");
  const fallbackGrid = el("div", "answer-grid answer-grid-small hidden");
  const yesBtn = el("button", "answer-button yes", politeLine(asker, true));
  const noBtn = el("button", "answer-button no", politeLine(asker, false));
  yesBtn.onclick = () => {
    Audio_.setAccepting(false);
    onResult({ heardYesNo: true, honorificOK: true });
  };
  noBtn.onclick = () => {
    Audio_.setAccepting(false);
    onResult({ heardYesNo: false, honorificOK: true });
  };
  fallbackGrid.appendChild(yesBtn);
  fallbackGrid.appendChild(noBtn);

  function revealFallback() {
    fallbackGrid.classList.remove("hidden");
  }
  fallbackToggle.onclick = () => fallbackGrid.classList.toggle("hidden");

  wrap.appendChild(fallbackToggle);
  wrap.appendChild(fallbackGrid);

  // If voice isn't enabled in settings or isn't supported at all, lead
  // with the tap fallback instead of a mic button that can't work.
  if (!state.settings.speechRecognitionEnabled || !Audio_.isRecognitionSupported()) {
    micBtn.classList.add("hidden");
    hint.textContent = Audio_.isRecognitionSupported()
      ? "Tap your answer:"
      : "Voice isn't available in this browser — tap your answer:";
    revealFallback();
    activeMicTrigger = null;
  } else {
    activeMicTrigger = beginAccepting;
  }

  return wrap;
}

function micIconSVG() {
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="6" width="12" height="20" rx="6" fill="#fff"/>
    <path d="M10 18 v3 a10 10 0 0 0 20 0 v-3" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <line x1="20" y1="31" x2="20" y2="36" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <line x1="13" y1="36" x2="27" y2="36" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

function speakCurrentQuizQuestion() {
  Audio_.setAccepting(false); // don't process speech while the question itself is being read
  const round = currentQuizRound();
  const asker = round.asker;
  Audio_.speak(`${round.question.spoken}`, asker.gender, () => {
    if (activeMicTrigger) activeMicTrigger();
  });
}

/* Turns a captured answer (voice or tap) into either success or a
   gentle, specific retry — and for voice answers, this is where we
   check BOTH the yes/no and the honorific, since saying the honorific
   out loud is the actual point of the app. */
function finalizeQuizAnswer({ heardYesNo, honorificOK }) {
  if (state.quiz.awaitingAdvance) return;
  const round = currentQuizRound();
  const expected = round.question.expected === "yes";
  const honorific = round.asker.honorific;

  if (heardYesNo === null && !honorificOK) {
    return retryQuiz("I didn't quite catch that. Let's try again!");
  }
  if (heardYesNo === null) {
    return retryQuiz(`Try saying "${expected ? "Yes" : "No"}, ${honorific}!"`);
  }
  if (heardYesNo !== expected) {
    return retryQuiz(`Almost! The answer is "${expected ? "Yes" : "No"}, ${honorific}!"`);
  }
  if (!honorificOK) {
    return retryQuiz(`So close! Don't forget to say "${honorific}."`);
  }
  succeedQuiz();
}

function retryQuiz(message) {
  const banner = document.querySelector(".feedback-banner");
  if (banner) {
    banner.textContent = message;
    banner.className = "feedback-banner negative";
  }
  Audio_.playTryAgainTone();
  setTimeout(() => speakCurrentQuizQuestion(), 900);
}

/* Shared by both quiz and roleplay: rolls a random celebration (see
   rewards.js) and, if it earned a sticker, shows a toast for it. The
   effect host is appended to document.body rather than #app so it
   survives the re-render that happens a moment later when the round
   advances. */
function celebrateSuccess(mascotWrap) {
  const effectHost = el("div", "confetti-container");
  document.body.appendChild(effectHost);
  const { sticker } = Rewards.celebrate({ mascotWrap, effectHost });
  setTimeout(() => effectHost.remove(), 2300);
  if (sticker) showStickerToast(sticker);
}

function showStickerToast(sticker) {
  const toast = el("div", "sticker-toast");
  toast.innerHTML = `
    <div class="sticker-toast-emoji">${sticker.emoji}</div>
    <div class="sticker-toast-text"><strong>New sticker!</strong><span>${sticker.name}</span></div>`;
  document.body.appendChild(toast);
  Audio_.playStickerPop();
  setTimeout(() => toast.classList.add("show"), 20);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function succeedQuiz() {
  state.quiz.correct++;
  state.quiz.awaitingAdvance = true;
  const banner = document.querySelector(".feedback-banner");
  const mascotWrap = document.getElementById("mascot");
  const micBtn = document.getElementById("mic-button");
  document.querySelectorAll(".answer-button").forEach(b => (b.disabled = true));
  if (micBtn) micBtn.disabled = true;

  banner.textContent = randomFrom([
    "Wonderful manners!",
    "That's so polite!",
    "Great job!",
    "You did it!"
  ]);
  banner.className = "feedback-banner positive";
  celebrateSuccess(mascotWrap);

  setTimeout(() => {
    state.quiz.index++;
    if (state.quiz.index >= state.quiz.rounds.length) {
      Storage.addSession({
        mode: "quiz",
        correct: state.quiz.correct,
        total: state.quiz.rounds.length
      });
      go("quiz-summary");
    } else {
      state.quiz.awaitingAdvance = false;
      render();
    }
  }, 1500);
}

function renderQuizSummary() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("Practice Quiz", "home"));
  screen.appendChild(el("div", "mascot-wrap celebrate", mascotSVG("happy")));

  const card = el("div", "summary-card");
  const { correct, rounds } = state.quiz;
  card.innerHTML = `
    <h2>Great job!</h2>
    <div class="summary-score">${correct} / ${rounds.length}</div>
    <p>polite answers</p>`;
  const again = el("button", "primary-button", "Play Again");
  again.onclick = () => startQuiz();
  const home = el("button", "secondary-button", "Home");
  home.onclick = () => go("home");
  card.appendChild(again);
  card.appendChild(home);
  screen.appendChild(card);
  return screen;
}

/* ==========================================================================
   ROLEPLAY MODE
   ========================================================================== */
function renderRoleplayList() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("Let's Pretend", "home"));
  screen.appendChild(el("div", "mascot-wrap", mascotSVG("idle")));

  const availableIds = activeAskers().map(a => a.id);
  const scenarios = DEFAULT_SCENARIOS.filter(s => availableIds.includes(s.askerId));
  const list = scenarios.length ? scenarios : DEFAULT_SCENARIOS;

  const grid = el("div", "tile-grid");
  list.forEach(scenario => {
    const asker = DEFAULT_ASKERS.find(a => a.id === scenario.askerId);
    const tile = el("button", "tile tile-roleplay");
    tile.innerHTML = `
      <div class="tile-icon" style="background:transparent">${askerAvatarSVG(asker)}</div>
      <div class="tile-text"><h2>${scenario.title}</h2><p>with ${asker.name}</p></div>`;
    tile.onclick = () => startRoleplay(scenario);
    grid.appendChild(tile);
  });
  screen.appendChild(grid);
  return screen;
}

function startRoleplay(scenario) {
  state.roleplay = { scenario, index: 0, awaitingAdvance: false };
  if (state.settings.speechRecognitionEnabled) {
    Audio_.startSession(handleMicSessionError);
  }
  go("roleplay");
}

function currentBeat() {
  return state.roleplay.scenario.beats[state.roleplay.index];
}

function renderRoleplay() {
  const screen = el("div", "screen");
  screen.appendChild(topbar(state.roleplay.scenario.title, "roleplay-list"));

  const mascotWrap = el("div", "mascot-wrap");
  mascotWrap.id = "mascot";
  mascotWrap.innerHTML = mascotSVG("idle");
  screen.appendChild(mascotWrap);

  const dots = el("div", "progress-dots");
  state.roleplay.scenario.beats.forEach((_, i) => {
    const d = el("div", "dot");
    if (i < state.roleplay.index) d.classList.add("done");
    if (i === state.roleplay.index) d.classList.add("current");
    dots.appendChild(d);
  });
  screen.appendChild(dots);

  const asker = DEFAULT_ASKERS.find(a => a.id === state.roleplay.scenario.askerId);
  const beat = currentBeat();

  const card = el("div", "asker-card");
  card.innerHTML = `
    <div class="asker-avatar">${askerAvatarSVG(asker)}</div>
    <div class="asker-name">${asker.name} says:</div>
    <div class="asker-line" id="rp-line">${beat.line}</div>`;
  const replay = el("button", "replay-button", "🔊 Hear it again");
  replay.onclick = () => speakCurrentBeat();
  card.appendChild(replay);
  screen.appendChild(card);

  screen.appendChild(buildAnswerCaptureUI(asker, (result) => finalizeRoleplayAnswer(result)));

  screen.appendChild(el("div", "feedback-banner", ""));

  requestAnimationFrame(() => speakCurrentBeat());
  return screen;
}

function speakCurrentBeat() {
  Audio_.setAccepting(false); // don't process speech while the line itself is being read
  const asker = DEFAULT_ASKERS.find(a => a.id === state.roleplay.scenario.askerId);
  const beat = currentBeat();
  Audio_.speak(beat.line, asker.gender, () => {
    if (activeMicTrigger) activeMicTrigger();
  });
}

function finalizeRoleplayAnswer({ heardYesNo, honorificOK }) {
  if (state.roleplay.awaitingAdvance) return;
  const asker = DEFAULT_ASKERS.find(a => a.id === state.roleplay.scenario.askerId);
  const honorific = asker.honorific;

  if (heardYesNo === null && !honorificOK) {
    return retryRoleplay("I didn't quite catch that. Let's try again!");
  }
  if (heardYesNo === null) {
    return retryRoleplay(`Try saying "Yes, ${honorific}!" or "No, ${honorific}!"`);
  }
  if (!honorificOK) {
    return retryRoleplay(`Don't forget to say "${honorific}"!`);
  }
  succeedRoleplay(heardYesNo);
}

function retryRoleplay(message) {
  const banner = document.querySelector(".feedback-banner");
  if (banner) {
    banner.textContent = message;
    banner.className = "feedback-banner negative";
  }
  Audio_.playTryAgainTone();
  setTimeout(() => speakCurrentBeat(), 900);
}

function succeedRoleplay(saidYes) {
  state.roleplay.awaitingAdvance = true;
  const asker = DEFAULT_ASKERS.find(a => a.id === state.roleplay.scenario.askerId);
  const beat = currentBeat();
  const banner = document.querySelector(".feedback-banner");
  const mascotWrap = document.getElementById("mascot");
  const micBtn = document.getElementById("mic-button");
  document.querySelectorAll(".answer-button").forEach(b => (b.disabled = true));
  if (micBtn) micBtn.disabled = true;

  const reply = saidYes ? beat.replyIfYes : beat.replyIfNo;
  banner.textContent = "Nicely said!";
  banner.className = "feedback-banner positive";
  celebrateSuccess(mascotWrap);

  Audio_.speak(reply, asker.gender, () => {
    setTimeout(() => {
      state.roleplay.index++;
      if (state.roleplay.index >= state.roleplay.scenario.beats.length) {
        Storage.addSession({
          mode: "roleplay",
          correct: state.roleplay.scenario.beats.length,
          total: state.roleplay.scenario.beats.length,
          label: state.roleplay.scenario.title
        });
        go("roleplay-summary");
      } else {
        state.roleplay.awaitingAdvance = false;
        render();
      }
    }, 600);
  });
}

function renderRoleplaySummary() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("Let's Pretend", "home"));
  screen.appendChild(el("div", "mascot-wrap celebrate", mascotSVG("happy")));

  const card = el("div", "summary-card");
  card.innerHTML = `
    <h2>All done!</h2>
    <p>You practiced great manners with ${
      DEFAULT_ASKERS.find(a => a.id === state.roleplay.scenario.askerId).name
    }.</p>`;
  const again = el("button", "primary-button", "Try Another");
  again.onclick = () => go("roleplay-list");
  const home = el("button", "secondary-button", "Home");
  home.onclick = () => go("home");
  card.appendChild(again);
  card.appendChild(home);
  screen.appendChild(card);
  return screen;
}

/* ==========================================================================
   MAGIC WORDS (please / thank you / may I please / you're welcome)
   ========================================================================== */
function renderMagicList() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("Magic Words", "home"));
  screen.appendChild(el("div", "mascot-wrap", mascotSVG("idle")));

  const grid = el("div", "tile-grid");
  MAGIC_GAMES.forEach(game => {
    const tile = el("button", "tile tile-magic");
    tile.innerHTML = `
      <div class="tile-icon">${simpleIcon("magic")}</div>
      <div class="tile-text"><h2>${game.title}</h2><p>${game.subtitle}</p></div>`;
    tile.onclick = () => startMagicGame(game);
    grid.appendChild(tile);
  });
  screen.appendChild(grid);
  return screen;
}

function startMagicGame(game) {
  const askers = activeAskers();
  const shuffled = [...game.questions].sort(() => Math.random() - 0.5);
  const rounds = shuffled.slice(0, Math.min(ROUND_LENGTH, shuffled.length)).map(q => ({
    question: q,
    asker: randomFrom(askers)
  }));
  state.magic = { game, rounds, index: 0, correct: 0, awaitingAdvance: false };
  if (state.settings.speechRecognitionEnabled) {
    Audio_.startSession(handleMicSessionError);
  }
  go("magic");
}

function currentMagicRound() {
  return state.magic.rounds[state.magic.index];
}

function renderMagic() {
  const screen = el("div", "screen");
  screen.appendChild(topbar(state.magic.game.title, "magic-list"));

  const mascotWrap = el("div", "mascot-wrap");
  mascotWrap.id = "mascot";
  mascotWrap.innerHTML = mascotSVG("idle");
  screen.appendChild(mascotWrap);

  const dots = el("div", "progress-dots");
  state.magic.rounds.forEach((_, i) => {
    const d = el("div", "dot");
    if (i < state.magic.index) d.classList.add("done");
    if (i === state.magic.index) d.classList.add("current");
    dots.appendChild(d);
  });
  screen.appendChild(dots);

  const round = currentMagicRound();
  const asker = round.asker;

  const card = el("div", "asker-card");
  card.innerHTML = `
    <div class="asker-avatar">${askerAvatarSVG(asker)}</div>
    <div class="asker-name">${asker.name} asks:</div>
    <div class="asker-line" id="magic-line">${round.question.spoken}</div>`;
  const replay = el("button", "replay-button", "🔊 Hear it again");
  replay.onclick = () => speakCurrentMagicQuestion();
  card.appendChild(replay);
  screen.appendChild(card);

  screen.appendChild(buildPhraseCaptureUI(state.magic.game.wordIds, (result) => finalizeMagicAnswer(result)));

  screen.appendChild(el("div", "feedback-banner", ""));

  requestAnimationFrame(() => speakCurrentMagicQuestion());
  return screen;
}

/* Same "mic-first, tap as fallback" shape as buildAnswerCaptureUI, but
   generalized to N phrase buttons instead of a fixed yes/no pair, and
   parsed with parseMagicWordAnswer instead of checking an honorific. */
function buildPhraseCaptureUI(wordIds, onResult) {
  const wrap = el("div", "answer-capture");

  const micBtn = el("button", "mic-button", micIconSVG());
  micBtn.id = "mic-button";
  micBtn.setAttribute("aria-label", "Tap and answer out loud");
  const hint = el("div", "listening-hint", "Get ready to answer out loud!");
  hint.id = "listening-hint";

  function setListeningVisual(isListening) {
    micBtn.classList.toggle("listening", isListening);
    hint.classList.toggle("active", isListening);
    if (isListening) hint.textContent = "I'm listening...";
  }

  function beginAccepting() {
    if (!Audio_.isRecognitionSupported() || !state.settings.speechRecognitionEnabled) {
      hint.textContent = Audio_.isRecognitionSupported()
        ? "Tap your answer:"
        : "Voice isn't available in this browser — tap your answer:";
      revealFallback();
      return;
    }
    if (!Audio_.isSessionActive()) {
      Audio_.startSession(handleMicSessionError);
    }
    Audio_.setTranscriptHandler((transcript) => {
      Audio_.setAccepting(false);
      setListeningVisual(false);
      onResult({ heardWord: parseMagicWordAnswer(transcript) });
    });
    Audio_.setAccepting(true);
    setListeningVisual(true);
  }
  micBtn.onclick = beginAccepting;

  wrap.appendChild(micBtn);
  wrap.appendChild(hint);

  const fallbackToggle = el("button", "fallback-toggle", "Can't use the mic? Tap your answer instead");
  const fallbackGrid = el(
    "div",
    `answer-grid answer-grid-small${wordIds.length < 2 ? " single" : ""} hidden`
  );
  wordIds.forEach(wordId => {
    const word = MAGIC_WORDS[wordId];
    const btn = el("button", `answer-button phrase-${wordId}`, word.label);
    btn.onclick = () => {
      Audio_.setAccepting(false);
      onResult({ heardWord: wordId });
    };
    fallbackGrid.appendChild(btn);
  });

  function revealFallback() {
    fallbackGrid.classList.remove("hidden");
  }
  fallbackToggle.onclick = () => fallbackGrid.classList.toggle("hidden");

  wrap.appendChild(fallbackToggle);
  wrap.appendChild(fallbackGrid);

  if (!state.settings.speechRecognitionEnabled || !Audio_.isRecognitionSupported()) {
    micBtn.classList.add("hidden");
    hint.textContent = Audio_.isRecognitionSupported()
      ? "Tap your answer:"
      : "Voice isn't available in this browser — tap your answer:";
    revealFallback();
    activeMicTrigger = null;
  } else {
    activeMicTrigger = beginAccepting;
  }

  return wrap;
}

function speakCurrentMagicQuestion() {
  Audio_.setAccepting(false); // don't process speech while the question itself is being read
  const round = currentMagicRound();
  const asker = round.asker;
  Audio_.speak(round.question.spoken, asker.gender, () => {
    if (activeMicTrigger) activeMicTrigger();
  });
}

function finalizeMagicAnswer({ heardWord }) {
  if (state.magic.awaitingAdvance) return;
  const round = currentMagicRound();
  const expectedWord = MAGIC_WORDS[round.question.expected];

  if (heardWord === null) {
    return retryMagic("I didn't quite catch that. Let's try again!");
  }
  if (heardWord !== round.question.expected) {
    return retryMagic(`Almost! Try saying "${expectedWord.label}"`);
  }
  succeedMagic();
}

function retryMagic(message) {
  const banner = document.querySelector(".feedback-banner");
  if (banner) {
    banner.textContent = message;
    banner.className = "feedback-banner negative";
  }
  Audio_.playTryAgainTone();
  setTimeout(() => speakCurrentMagicQuestion(), 900);
}

function succeedMagic() {
  state.magic.correct++;
  state.magic.awaitingAdvance = true;
  const banner = document.querySelector(".feedback-banner");
  const mascotWrap = document.getElementById("mascot");
  const micBtn = document.getElementById("mic-button");
  document.querySelectorAll(".answer-button").forEach(b => (b.disabled = true));
  if (micBtn) micBtn.disabled = true;

  banner.textContent = randomFrom([
    "Wonderful manners!",
    "That's so polite!",
    "Great job!",
    "You did it!"
  ]);
  banner.className = "feedback-banner positive";
  celebrateSuccess(mascotWrap);

  setTimeout(() => {
    state.magic.index++;
    if (state.magic.index >= state.magic.rounds.length) {
      Storage.addSession({
        mode: "magic",
        correct: state.magic.correct,
        total: state.magic.rounds.length,
        label: state.magic.game.title
      });
      go("magic-summary");
    } else {
      state.magic.awaitingAdvance = false;
      render();
    }
  }, 1500);
}

function renderMagicSummary() {
  const screen = el("div", "screen");
  screen.appendChild(topbar(state.magic.game.title, "home"));
  screen.appendChild(el("div", "mascot-wrap celebrate", mascotSVG("happy")));

  const card = el("div", "summary-card");
  const { correct, rounds } = state.magic;
  card.innerHTML = `
    <h2>Great job!</h2>
    <div class="summary-score">${correct} / ${rounds.length}</div>
    <p>polite answers</p>`;
  const again = el("button", "primary-button", "Play Again");
  again.onclick = () => startMagicGame(state.magic.game);
  const more = el("button", "secondary-button", "More Magic Words");
  more.onclick = () => go("magic-list");
  const home = el("button", "secondary-button", "Home");
  home.onclick = () => go("home");
  card.appendChild(again);
  card.appendChild(more);
  card.appendChild(home);
  screen.appendChild(card);
  return screen;
}

/* ==========================================================================
   PARENT DASHBOARD ("Grown-Up Corner")
   ========================================================================== */
function renderDashboard() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("Grown-Up Corner", "home"));

  const sessions = Storage.loadSessions();
  const totalSessions = sessions.length;
  const totalCorrect = sessions.reduce((sum, s) => sum + (s.correct || 0), 0);
  const totalPossible = sessions.reduce((sum, s) => sum + (s.total || 0), 0);
  const accuracy = totalPossible ? Math.round((totalCorrect / totalPossible) * 100) : 0;

  // --- Progress ---
  const progressSection = el("div", "dash-section");
  progressSection.innerHTML = `<h3>Progress</h3>`;
  const stats = el("div", "dash-stats");
  stats.innerHTML = `
    <div class="dash-stat"><span class="num">${totalSessions}</span><span class="label">sessions</span></div>
    <div class="dash-stat"><span class="num">${totalCorrect}</span><span class="label">correct</span></div>
    <div class="dash-stat"><span class="num">${accuracy}%</span><span class="label">accuracy</span></div>`;
  progressSection.appendChild(stats);

  if (sessions.length) {
    const list = el("div", "");
    sessions.slice(0, 8).forEach(s => {
      const row = el("div", "session-row");
      const dateStr = new Date(s.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      });
      const modeLabel = s.mode === "quiz" ? "Quiz" : s.label || "Pretend";
      row.innerHTML = `<span class="session-mode">${modeLabel}</span><span class="session-score">${s.correct}/${s.total} · ${dateStr}</span>`;
      list.appendChild(row);
    });
    progressSection.appendChild(list);
  } else {
    progressSection.appendChild(el("div", "empty-note", "No sessions yet — play a round to see progress here!"));
  }

  if (sessions.length) {
    const resetBtn = el("button", "danger-button", "Reset progress history");
    resetBtn.onclick = () => {
      if (confirm("This clears the session history. Are you sure?")) {
        Storage.resetProgress();
        render();
      }
    };
    progressSection.appendChild(resetBtn);
  }
  screen.appendChild(progressSection);

  // --- Settings ---
  const settingsSection = el("div", "dash-section");
  settingsSection.innerHTML = `<h3>Settings</h3>`;

  const recognitionRow = el("div", "toggle-row");
  const recognitionSupported = Audio_.isRecognitionSupported();
  recognitionRow.innerHTML = `
    <div>
      <div class="toggle-label">Answer out loud</div>
      <div class="toggle-sub">${
        recognitionSupported
          ? "Recommended — tapping is always available as a backup."
          : "Not supported in this browser. Tapping still works."
      }</div>
    </div>`;
  const switchLabel = el("label", "switch");
  switchLabel.innerHTML = `<input type="checkbox" ${
    state.settings.speechRecognitionEnabled ? "checked" : ""
  } ${recognitionSupported ? "" : "disabled"}/><span class="slider"></span>`;
  switchLabel.querySelector("input").onchange = (e) => {
    state.settings = Storage.saveSettings({ speechRecognitionEnabled: e.target.checked });
  };
  recognitionRow.appendChild(switchLabel);
  settingsSection.appendChild(recognitionRow);

  settingsSection.appendChild(el("h3", "", "Who can ask questions?"));
  const askerList = el("div", "asker-toggle-list");
  DEFAULT_ASKERS.forEach(asker => {
    const row = el("div", "asker-toggle-row");
    const isOn = state.settings.activeAskerIds.includes(asker.id);
    row.innerHTML = `<div class="mini-avatar">${askerAvatarSVG(asker)}</div><div class="name">${asker.name}</div>`;
    const label = el("label", "switch");
    label.innerHTML = `<input type="checkbox" ${isOn ? "checked" : ""}/><span class="slider"></span>`;
    label.querySelector("input").onchange = (e) => {
      const current = new Set(state.settings.activeAskerIds);
      if (e.target.checked) current.add(asker.id);
      else current.delete(asker.id);
      // Always keep at least one asker active.
      const next = current.size ? Array.from(current) : [asker.id];
      state.settings = Storage.saveSettings({ activeAskerIds: next });
      render();
    };
    row.appendChild(label);
    askerList.appendChild(row);
  });
  settingsSection.appendChild(askerList);
  screen.appendChild(settingsSection);

  // --- Custom questions ---
  const customSection = el("div", "dash-section");
  customSection.innerHTML = `<h3>Add Your Own Quiz Question</h3>`;
  customSection.appendChild(el("div", "field-label", "Question"));
  const input = el("input", "text-input");
  input.type = "text";
  input.placeholder = 'e.g. "Do we say please?"';
  input.value = state.dashDraft.text;
  input.oninput = (e) => (state.dashDraft.text = e.target.value);
  customSection.appendChild(input);

  const answerGrid = el("div", "answer-grid");
  answerGrid.style.marginTop = "4px";
  const yesChoice = el("button", "answer-button yes", "Answer: Yes");
  const noChoice = el("button", "answer-button no", "Answer: No");
  function refreshChoiceStyles() {
    yesChoice.style.opacity = state.dashDraft.expected === "yes" ? "1" : "0.45";
    noChoice.style.opacity = state.dashDraft.expected === "no" ? "1" : "0.45";
  }
  yesChoice.onclick = () => {
    state.dashDraft.expected = "yes";
    refreshChoiceStyles();
  };
  noChoice.onclick = () => {
    state.dashDraft.expected = "no";
    refreshChoiceStyles();
  };
  refreshChoiceStyles();
  answerGrid.appendChild(yesChoice);
  answerGrid.appendChild(noChoice);
  customSection.appendChild(answerGrid);

  const addBtn = el("button", "primary-button", "Add Question");
  addBtn.style.marginTop = "6px";
  addBtn.onclick = () => {
    const text = state.dashDraft.text.trim();
    if (!text) return;
    Storage.addCustomQuestion({ text, expected: state.dashDraft.expected });
    state.dashDraft = { text: "", expected: "yes" };
    render();
  };
  customSection.appendChild(addBtn);

  const customQs = Storage.loadCustomQuestions();
  if (customQs.length) {
    const list = el("div", "");
    list.style.marginTop = "6px";
    customQs.forEach(q => {
      const row = el("div", "custom-q-row");
      row.innerHTML = `<span>${q.text} <em>(${q.expected})</em></span>`;
      const removeBtn = el("button", "remove-q", "Remove");
      removeBtn.onclick = () => {
        Storage.removeCustomQuestion(q.id);
        render();
      };
      row.appendChild(removeBtn);
      list.appendChild(row);
    });
    customSection.appendChild(list);
  }
  screen.appendChild(customSection);

  return screen;
}

/* ---------- boot ---------- */
render();
