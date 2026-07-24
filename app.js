/* app.js — screens, routing, and game logic for the Yes Sir / Yes Ma'am
   practice app. No framework, no build step: a small state object plus
   functions that re-render #app as innerHTML. Kept this way on purpose
   so the whole app is just "open index.html" — no server required,
   which matters since it needs to run happily from an iPad. */

const state = {
  screen: "home", // home | quiz | quiz-summary | roleplay-list | roleplay | roleplay-summary | magic-list | magic | magic-summary | say | say-summary | dashboard | stickers
  settings: Storage.loadSettings(),
  quiz: null,
  roleplay: null,
  magic: null,
  say: null,
  party: null,
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
    say: renderSay,
    "say-summary": renderSaySummary,
    party: renderParty,
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
  if (screen !== "quiz" && screen !== "roleplay" && screen !== "magic" && screen !== "say") {
    Audio_.endSession();
  }
  // Leaving the mask party means the camera and timers should be
  // released right away — never keep the camera open off-screen.
  if (state.screen === "party" && screen !== "party") {
    stopParty();
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

/* ---------- avatars, drawn in code so no image assets are needed ----------
   Friendly cartoon portraits with shoulders, hair, eyebrows, a soft
   nose, blush, and a warm smile — a bit more like real characters than
   the old plain circles, but still flat and playful, and still 100%
   code (nothing to host, App-Store clean). Each asker's `shirt` color
   and accessory (bun / cap / glasses) keep them recognizable. */
function askerAvatarSVG(asker) {
  const skin = asker.skin;
  const hair = asker.hair;
  const shirt = asker.shirt || "#8AA0C8";
  const acc = asker.accessory;
  const female = asker.gender === "female";

  // Longer hair falling behind the shoulders — women (unless capped).
  const hairBack =
    female && acc !== "cap"
      ? `<path d="M17 46 C13 18 87 18 83 46 L86 78 C80 62 75 60 73 62 L73 40 C60 30 40 30 27 40 L27 62 C25 60 20 62 14 78 Z" fill="${hair}"/>`
      : "";

  // Shoulders + neck.
  const body = `
    <path d="M10 100 C12 82 33 75 50 75 C67 75 88 82 90 100 Z" fill="${shirt}"/>
    <path d="M40 100 L60 100 L58 100 C56 94 56 88 56 84 L44 84 C44 88 44 94 42 100 Z" fill="rgba(0,0,0,0.06)"/>
    <rect x="43" y="66" width="14" height="14" rx="7" fill="${skin}"/>`;

  // Head + ears.
  const head = `
    <circle cx="50" cy="46" r="30" fill="${skin}"/>
    <circle cx="20" cy="48" r="5" fill="${skin}"/>
    <circle cx="80" cy="48" r="5" fill="${skin}"/>`;

  // Top hair / hat.
  let top;
  if (acc === "bun") {
    top = `<circle cx="50" cy="13" r="9" fill="${hair}"/>
           <path d="M20 42 C17 15 83 15 80 42 C66 27 34 27 20 42 Z" fill="${hair}"/>`;
  } else if (acc === "cap") {
    top = `<path d="M21 36 C24 13 76 13 79 36 C62 27 38 27 21 36 Z" fill="${shirt}"/>
           <path d="M12 38 L42 38 L39 45 L14 45 Z" fill="${shirt}"/>
           <rect x="46" y="10" width="8" height="7" rx="3.5" fill="${hair}"/>`;
  } else {
    top = `<path d="M20 44 C15 16 85 16 80 44 C66 29 34 29 20 44 Z" fill="${hair}"/>`;
  }

  // Glasses sit over the eyes for the two askers who wear them.
  const glasses =
    acc === "glasses"
      ? `<g stroke="#3B2F63" stroke-width="2.5" fill="rgba(255,255,255,0.22)">
           <rect x="29" y="42" width="16" height="12" rx="6"/>
           <rect x="55" y="42" width="16" height="12" rx="6"/>
         </g>
         <line x1="45" y1="48" x2="55" y2="48" stroke="#3B2F63" stroke-width="2.5"/>`
      : "";

  // Face features.
  const brows = `
    <path d="M34 40 Q40 37 46 40.5" stroke="#5A4A6A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M54 40.5 Q60 37 66 40" stroke="#5A4A6A" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const lashes = female
    ? `<path d="M35 45 L37 44 M65 44 L63 45" stroke="#3B2F63" stroke-width="1.6" stroke-linecap="round"/>`
    : "";
  const eyes = `
    <circle cx="40" cy="48" r="3.3" fill="#2A2340"/>
    <circle cx="60" cy="48" r="3.3" fill="#2A2340"/>
    <circle cx="41" cy="47" r="1" fill="#fff"/>
    <circle cx="61" cy="47" r="1" fill="#fff"/>
    ${lashes}`;
  const nose = `<path d="M48 52 Q50 56 52 52" stroke="#B98A6A" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const cheeks = `
    <circle cx="34" cy="57" r="4.2" fill="#FF9DAF" opacity="0.45"/>
    <circle cx="66" cy="57" r="4.2" fill="#FF9DAF" opacity="0.45"/>`;
  const smile = `<path d="M40 60 Q50 70 60 60" stroke="#3B2F63" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${asker.name}">
      ${hairBack}
      ${body}
      ${head}
      ${top}
      ${brows}
      ${eyes}
      ${glasses}
      ${nose}
      ${cheeks}
      ${smile}
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
   not "please". Natural variations count too ("thanks", "thank you,
   ma'am") — the honorific bonus is handled separately by heardHonorific.
   Returns null when nothing clear was heard. */
function parseMagicWordAnswer(transcript) {
  const t = ` ${transcript.toLowerCase()} `;
  if (/\bmay i\b/.test(t)) return "mayi";
  if (/\b(thank you|thanks)\b/.test(t)) return "thankyou";
  if (/\b(you'?re welcome|your welcome|welcome)\b/.test(t)) return "welcome";
  if (/\bplease\b/.test(t)) return "please";
  return null;
}

/* Did the transcript include the asker's honorific (sir/ma'am)? Used
   for the "extra polite" bonus in Magic Words and What Do You Say —
   any correct answer counts, but adding the honorific earns a
   guaranteed sticker, since saying sir/ma'am is the app's core skill.
   Same leniency for ma'am as parseSpokenAnswer. */
function heardHonorific(transcript, honorific) {
  const t = ` ${transcript.toLowerCase()} `;
  return honorific === "sir" ? /\bsir\b/.test(t) : /\b(ma'?am|madam)\b/.test(t);
}

/* Parses a spoken transcript against a question's accepted-answer list
   (see SAY_QUESTIONS in data.js). Transcript is normalized the same
   way the hear-phrases are written: lowercase, apostrophes removed.
   Longest phrases are checked first so "may i have a turn" wins over
   a shorter overlapping phrase from another answer. Matching is
   prefix-at-word-boundary, deliberately loose: "thank" matches
   "thanks" and "thank you", "turn" matches "turns" — speech-to-text
   returns fragments for kid voices, so short stems catch far more
   real answers than exact phrases. Stems are scoped per question, so
   looseness can't cause cross-question confusion. Returns the index
   of the matched answer, or null when nothing clear was heard. */
function parseSayAnswer(transcript, answers) {
  const t = ` ${transcript.toLowerCase().replace(/[’']/g, "")} `;
  const candidates = [];
  answers.forEach((answer, index) => {
    answer.hear.forEach(phrase => candidates.push({ index, phrase }));
  });
  candidates.sort((a, b) => b.phrase.length - a.phrase.length);
  for (const c of candidates) {
    const escaped = c.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}`).test(t)) return c.index;
  }
  return null;
}

/* Star bar: session progress as stars earned so far — one star per
   completed question, a pulsing outline for the current one. Replaces
   the old neutral dots so progress itself reads as a reward.
   `results` is optional (used by What Do You Say): results[i] === false
   marks a question that was revealed-and-skipped after three misses,
   shown as a dim star rather than an earned one. */
function starBar(total, index, results) {
  const bar = el("div", "star-bar");
  for (let i = 0; i < total; i++) {
    const s = el("span", "star");
    if (i < index) {
      if (results && results[i] === false) {
        s.classList.add("missed");
        s.textContent = "☆";
      } else {
        s.classList.add("earned");
        s.textContent = "⭐";
        if (i === index - 1) s.classList.add("just-earned");
      }
    } else {
      s.textContent = "☆";
      if (i === index) s.classList.add("current");
    }
    bar.appendChild(s);
  }
  return bar;
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

  const sayTile = el("button", "tile tile-say");
  sayTile.innerHTML = `
    <div class="tile-icon">${simpleIcon("say")}</div>
    <div class="tile-text"><h2>What Do You Say?</h2><p>School, playground, and friend scenarios</p></div>`;
  sayTile.onclick = () => startSayGame();
  grid.appendChild(sayTile);

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
  if (kind === "say") {
    return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.25)"/>
      <text x="32" y="42" font-size="26" text-anchor="middle">💬</text></svg>`;
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

  screen.appendChild(starBar(state.quiz.rounds.length, state.quiz.index));

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
function celebrateSuccess(mascotWrap, opts) {
  const effectHost = el("div", "confetti-container");
  document.body.appendChild(effectHost);
  const { sticker } = Rewards.celebrate({
    mascotWrap,
    effectHost,
    forceSticker: !!(opts && opts.forceSticker)
  });
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
      startParty("quiz-summary");
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

  screen.appendChild(starBar(state.roleplay.scenario.beats.length, state.roleplay.index));

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
        startParty("roleplay-summary");
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

  screen.appendChild(starBar(state.magic.rounds.length, state.magic.index));

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

  screen.appendChild(buildPhraseCaptureUI(state.magic.game.wordIds, asker, (result) => finalizeMagicAnswer(result)));

  screen.appendChild(el("div", "feedback-banner", ""));

  requestAnimationFrame(() => speakCurrentMagicQuestion());
  return screen;
}

/* Same "mic-first, tap as fallback" shape as buildAnswerCaptureUI, but
   generalized to N phrase buttons instead of a fixed yes/no pair, and
   parsed with parseMagicWordAnswer instead of checking an honorific.
   The honorific isn't REQUIRED here, but saying it earns the
   extra-polite bonus (see finalizeMagicAnswer). */
function buildPhraseCaptureUI(wordIds, asker, onResult) {
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
      onResult({
        heardWord: parseMagicWordAnswer(transcript),
        extraPolite: heardHonorific(transcript, asker.honorific)
      });
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

function finalizeMagicAnswer({ heardWord, extraPolite }) {
  if (state.magic.awaitingAdvance) return;
  const round = currentMagicRound();
  const expectedWord = MAGIC_WORDS[round.question.expected];

  if (heardWord === null) {
    return retryMagic("I didn't quite catch that. Let's try again!");
  }
  if (heardWord !== round.question.expected) {
    return retryMagic(`Almost! Try saying "${expectedWord.label}"`);
  }
  succeedMagic(!!extraPolite);
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

function succeedMagic(extraPolite) {
  state.magic.correct++;
  state.magic.awaitingAdvance = true;
  const banner = document.querySelector(".feedback-banner");
  const mascotWrap = document.getElementById("mascot");
  const micBtn = document.getElementById("mic-button");
  document.querySelectorAll(".answer-button").forEach(b => (b.disabled = true));
  if (micBtn) micBtn.disabled = true;

  banner.textContent = extraPolite
    ? "WOW — extra polite! You said the magic word AND the honorific!"
    : randomFrom([
        "Wonderful manners!",
        "That's so polite!",
        "Great job!",
        "You did it!"
      ]);
  banner.className = "feedback-banner positive";
  celebrateSuccess(mascotWrap, { forceSticker: extraPolite });

  setTimeout(() => {
    state.magic.index++;
    if (state.magic.index >= state.magic.rounds.length) {
      Storage.addSession({
        mode: "magic",
        correct: state.magic.correct,
        total: state.magic.rounds.length,
        label: state.magic.game.title
      });
      startParty("magic-summary");
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
   WHAT DO YOU SAY? (realistic scenarios, multiple correct answers)
   ========================================================================== */
function startSayGame() {
  const askers = activeAskers();
  const shuffled = [...SAY_QUESTIONS].sort(() => Math.random() - 0.5);
  const rounds = shuffled.slice(0, Math.min(ROUND_LENGTH, shuffled.length)).map(q => ({
    question: q,
    asker: randomFrom(askers)
  }));
  state.say = { rounds, index: 0, correct: 0, attempts: 0, results: [], awaitingAdvance: false };
  if (state.settings.speechRecognitionEnabled) {
    Audio_.startSession(handleMicSessionError);
  }
  go("say");
}

function currentSayRound() {
  return state.say.rounds[state.say.index];
}

function renderSay() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("What Do You Say?", "home"));

  const mascotWrap = el("div", "mascot-wrap");
  mascotWrap.id = "mascot";
  mascotWrap.innerHTML = mascotSVG("idle");
  screen.appendChild(mascotWrap);

  screen.appendChild(starBar(state.say.rounds.length, state.say.index, state.say.results));

  const round = currentSayRound();
  const asker = round.asker;

  const card = el("div", "asker-card");
  card.innerHTML = `
    <div class="asker-avatar">${askerAvatarSVG(asker)}</div>
    <div class="asker-name">${asker.name} asks:</div>
    <div class="asker-line" id="say-line">${round.question.spoken}</div>`;
  const replay = el("button", "replay-button", "🔊 Hear it again");
  replay.onclick = () => speakCurrentSayQuestion();
  card.appendChild(replay);
  screen.appendChild(card);

  screen.appendChild(buildSayCaptureUI(round, (result) => finalizeSayAnswer(result)));

  screen.appendChild(el("div", "feedback-banner", ""));

  requestAnimationFrame(() => speakCurrentSayQuestion());
  return screen;
}

/* Mic-first capture like the other games, but the tap fallback shows
   every ACCEPTED answer plus one clearly-unkind distractor, shuffled —
   so tapping still involves a real choice even though several buttons
   are right. Spoken answers are matched against the accepted list with
   parseSayAnswer; any match counts, and adding the asker's honorific
   earns the extra-polite bonus, same as Magic Words. */
function buildSayCaptureUI(round, onResult) {
  const wrap = el("div", "answer-capture");
  const asker = round.asker;
  const question = round.question;

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
      onResult({
        answerIndex: parseSayAnswer(transcript, question.answers),
        extraPolite: heardHonorific(transcript, asker.honorific)
      });
    });
    Audio_.setAccepting(true);
    setListeningVisual(true);
  }
  micBtn.onclick = beginAccepting;

  wrap.appendChild(micBtn);
  wrap.appendChild(hint);

  const fallbackToggle = el("button", "fallback-toggle", "Can't use the mic? Tap your answer instead");
  const fallbackGrid = el("div", "answer-grid answer-grid-small say-grid hidden");

  const options = question.answers.map((answer, index) => ({ label: answer.label, answerIndex: index }));
  options.push({ label: question.distractor, answerIndex: null });
  options.sort(() => Math.random() - 0.5);
  options.forEach(opt => {
    const btn = el("button", "answer-button say-option", opt.label);
    btn.onclick = () => {
      Audio_.setAccepting(false);
      onResult({ answerIndex: opt.answerIndex, extraPolite: false, wasTap: true });
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

function speakCurrentSayQuestion() {
  Audio_.setAccepting(false); // don't process speech while the question itself is being read
  const round = currentSayRound();
  Audio_.speak(round.question.spoken, round.asker.gender, () => {
    if (activeMicTrigger) activeMicTrigger();
  });
}

function finalizeSayAnswer({ answerIndex, extraPolite, wasTap }) {
  if (state.say.awaitingAdvance) return;

  if (answerIndex !== null) {
    return succeedSay(answerIndex, !!extraPolite);
  }

  // A miss — from the mic not catching a phrase OR tapping the
  // distractor. Three misses on the same question means it's too hard
  // right now: say the answer out loud and move on (revealAndSkipSay),
  // rather than trapping the child in a retry loop.
  state.say.attempts++;
  if (state.say.attempts >= 3) {
    return revealAndSkipSay();
  }
  const message = wasTap
    ? "Hmm, is that the kind way? Try again!"
    : "I didn't quite catch that. Let's try again!";
  retrySay(message);
}

/* A short retry: mic reopens, tap answers become visible. Deliberately
   does NOT re-read the whole scenario (that made misses feel slow) —
   the "Hear it again" button is there if they need it. The first miss
   is silent (just the tone; the mic quietly reopens) so the child
   isn't interrupted mid-thought; the spoken "Try again!" only comes
   on the second miss. */
function retrySay(message) {
  const banner = document.querySelector(".feedback-banner");
  if (banner) {
    banner.textContent = message;
    banner.className = "feedback-banner negative";
  }
  // After the first miss, show the tap answers — seeing the choices is
  // often the nudge a little one needs to find the words.
  const fallbackGrid = document.querySelector(".answer-grid-small");
  if (fallbackGrid) fallbackGrid.classList.remove("hidden");
  Audio_.playTryAgainTone();
  if (state.say.attempts >= 2) {
    setTimeout(() => {
      Audio_.speak("Try again!", currentSayRound().asker.gender, () => {
        if (activeMicTrigger) activeMicTrigger();
      });
    }, 700);
  } else {
    setTimeout(() => {
      if (activeMicTrigger) activeMicTrigger();
    }, 700);
  }
}

/* Three misses: the asker says the kind answer out loud (that's the
   teaching moment), the star for this question stays dim, and the
   round moves on. No celebration, no scolding — just modeling. */
function revealAndSkipSay() {
  state.say.awaitingAdvance = true;
  const round = currentSayRound();
  const banner = document.querySelector(".feedback-banner");
  const micBtn = document.getElementById("mic-button");
  document.querySelectorAll(".answer-button").forEach(b => (b.disabled = true));
  if (micBtn) micBtn.disabled = true;

  const answerLabel = round.question.answers[0].label;
  if (banner) {
    banner.textContent = `The kind thing to say is: "${answerLabel}"`;
    banner.className = "feedback-banner positive";
  }
  Audio_.speak(`You can say: ${answerLabel}. Let's try the next one!`, round.asker.gender, () => {
    setTimeout(() => advanceSay(false), 400);
  });
}

/* Shared advance for both outcomes: records the result for the star
   bar, resets the per-question attempt counter, and either moves to
   the next question or ends the round. */
function advanceSay(wasCorrect) {
  state.say.results[state.say.index] = wasCorrect;
  state.say.attempts = 0;
  state.say.index++;
  if (state.say.index >= state.say.rounds.length) {
    Storage.addSession({
      mode: "say",
      correct: state.say.correct,
      total: state.say.rounds.length,
      label: "What Do You Say?"
    });
    startParty("say-summary");
  } else {
    state.say.awaitingAdvance = false;
    render();
  }
}

function succeedSay(answerIndex, extraPolite) {
  state.say.correct++;
  state.say.awaitingAdvance = true;
  const round = currentSayRound();
  const banner = document.querySelector(".feedback-banner");
  const mascotWrap = document.getElementById("mascot");
  const micBtn = document.getElementById("mic-button");
  document.querySelectorAll(".answer-button").forEach(b => (b.disabled = true));
  if (micBtn) micBtn.disabled = true;

  banner.textContent = extraPolite
    ? "WOW — extra polite! You even said the honorific!"
    : round.question.feedback;
  banner.className = "feedback-banner positive";
  celebrateSuccess(mascotWrap, { forceSticker: extraPolite });

  // Speak the feedback line — it names WHY the answer was kind, which
  // is the actual lesson — then advance.
  Audio_.speak(round.question.feedback, round.asker.gender, () => {
    setTimeout(() => advanceSay(true), 600);
  });
}

function renderSaySummary() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("What Do You Say?", "home"));
  screen.appendChild(el("div", "mascot-wrap celebrate", mascotSVG("happy")));

  const card = el("div", "summary-card");
  const { correct, rounds } = state.say;
  card.innerHTML = `
    <h2>Great job!</h2>
    <div class="summary-score">${correct} / ${rounds.length}</div>
    <p>kind answers</p>${
      correct < rounds.length
        ? `<p class="summary-note">We'll practice the tricky ones again next time!</p>`
        : ""
    }`;
  const again = el("button", "primary-button", "Play Again");
  again.onclick = () => startSayGame();
  const home = el("button", "secondary-button", "Home");
  home.onclick = () => go("home");
  card.appendChild(again);
  card.appendChild(home);
  screen.appendChild(card);
  return screen;
}

/* ==========================================================================
   SILLY MASK PARTY (big end-of-session reward)
   The front camera plus big draggable emoji masks — the child and the
   grown-up play together on one device. Everything is local: the video
   stream is shown, never recorded or uploaded, which keeps this safe
   for a kids' app (and painless for App Store review later).
   ========================================================================== */
const PARTY_SECONDS = 15; // the reward auto-ends after this many seconds
let partyStream = null;
let partyRAF = null;
let partyLandmarker = null; // cached between visits — the model download isn't tiny
let partyTimer = null;
let partyCountdown = null;

function stopParty() {
  if (partyRAF) {
    cancelAnimationFrame(partyRAF);
    partyRAF = null;
  }
  if (partyTimer) {
    clearTimeout(partyTimer);
    partyTimer = null;
  }
  if (partyCountdown) {
    clearInterval(partyCountdown);
    partyCountdown = null;
  }
  if (partyStream) {
    partyStream.getTracks().forEach(t => t.stop());
    partyStream = null;
  }
}

/* Launch the reward. returnScreen is where to land when the 10 seconds
   are up (the round's summary), so the party feels like a celebration
   that happens on the way to the score, not a detour. */
function startParty(returnScreen) {
  state.party = {
    returnScreen: returnScreen || "home",
    maskIndex: Math.floor(Math.random() * PARTY_MASKS.length)
  };
  go("party");
}

/* Which mask type each face wears: face 0 gets the session's pick,
   face 1 (a grown-up leaning in) is offset so the pair never matches. */
function partyMaskType(slot) {
  return PARTY_MASKS[(state.party.maskIndex + slot * 2) % PARTY_MASKS.length];
}

/* ---- animated mask art, drawn in code (no image assets) ----
   Each mask is an SVG whose movable parts carry classes the tracker
   updates every frame: `.m-eye` groups squash to blink, `.m-mouth`
   stretches open with jaw, `.m-cheek` fades in with a smile. */
function maskSVG(type) {
  const C = {
    pig:    { skin: "#F5A8C0", dark: "#E88AAA", face: "#F7B4C8" },
    bunny:  { skin: "#F4EEF8", dark: "#F6C9DC", face: "#FBF6FC" },
    lion:   { skin: "#F1B24C", dark: "#C9822F", face: "#F6C063" },
    frog:   { skin: "#7CC86C", dark: "#5FAE4F", face: "#8CD07B" },
    monkey: { skin: "#B27D50", dark: "#8A5E38", face: "#C08E60" },
    robot:  { skin: "#BAC5D6", dark: "#8B95A8", face: "#CBD4E1" }
  }[type] || { skin: "#F5A8C0", dark: "#E88AAA", face: "#F7B4C8" };

  // Type-specific "topper" (ears/mane/antenna) behind the face.
  let topper = "";
  if (type === "pig") {
    topper = `<path d="M26 30 L20 12 L40 26 Z" fill="${C.dark}"/><path d="M74 30 L80 12 L60 26 Z" fill="${C.dark}"/>`;
  } else if (type === "bunny") {
    topper = `<ellipse cx="38" cy="16" rx="7" ry="20" fill="${C.skin}"/><ellipse cx="38" cy="16" rx="3" ry="13" fill="${C.dark}"/>
              <ellipse cx="62" cy="16" rx="7" ry="20" fill="${C.skin}"/><ellipse cx="62" cy="16" rx="3" ry="13" fill="${C.dark}"/>`;
  } else if (type === "lion") {
    let mane = "";
    for (let i = 0; i < 12; i++) {
      const a = (i * 360) / 12;
      mane += `<circle cx="50" cy="12" r="11" fill="${C.dark}" transform="rotate(${a} 50 54)"/>`;
    }
    topper = mane;
  } else if (type === "frog") {
    topper = `<circle cx="34" cy="26" r="13" fill="${C.skin}"/><circle cx="66" cy="26" r="13" fill="${C.skin}"/>
              <circle cx="34" cy="24" r="5" fill="#26301F"/><circle cx="66" cy="24" r="5" fill="#26301F"/>`;
  } else if (type === "monkey") {
    topper = `<circle cx="16" cy="52" r="13" fill="${C.skin}"/><circle cx="16" cy="52" r="7" fill="#E7C29A"/>
              <circle cx="84" cy="52" r="13" fill="${C.skin}"/><circle cx="84" cy="52" r="7" fill="#E7C29A"/>`;
  } else if (type === "robot") {
    topper = `<line x1="50" y1="20" x2="50" y2="8" stroke="${C.dark}" stroke-width="3"/><circle cx="50" cy="6" r="4" fill="#FFC94A"/>`;
  }

  // Face shape: robot is a rounded square, everyone else a circle.
  const face =
    type === "robot"
      ? `<rect x="20" y="26" width="60" height="58" rx="14" fill="${C.face}" stroke="${C.dark}" stroke-width="2"/>`
      : `<circle cx="50" cy="56" r="34" fill="${C.face}"/>`;

  // Nose: pig snout is special, others get a small dark nose.
  const nose =
    type === "pig"
      ? `<ellipse cx="50" cy="62" rx="11" ry="8" fill="${C.dark}"/><ellipse cx="45" cy="62" rx="2.2" ry="3.2" fill="#7A3B50"/><ellipse cx="55" cy="62" rx="2.2" ry="3.2" fill="#7A3B50"/>`
      : `<path d="M45 60 Q50 66 55 60" fill="none" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>`;

  return `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${topper}
    ${face}
    <g class="m-cheek"><circle cx="30" cy="62" r="7" fill="#FF7DA0"/><circle cx="70" cy="62" r="7" fill="#FF7DA0"/></g>
    <g class="m-eye m-eye-l">
      <ellipse cx="38" cy="50" rx="7" ry="8" fill="#fff"/>
      <circle cx="38" cy="50" r="3.4" fill="#2A2340"/>
    </g>
    <g class="m-eye m-eye-r">
      <ellipse cx="62" cy="50" rx="7" ry="8" fill="#fff"/>
      <circle cx="62" cy="50" r="3.4" fill="#2A2340"/>
    </g>
    ${nose}
    <g class="m-mouth"><ellipse cx="50" cy="74" rx="9" ry="4" fill="#7A3B50"/></g>
  </svg>`;
}

function renderParty() {
  const screen = el("div", "screen");
  screen.appendChild(topbar("Silly Mask Party!", state.party.returnScreen));

  const stage = el("div", "party-stage");
  const video = document.createElement("video");
  video.id = "party-video";
  video.autoplay = true;
  video.muted = true;
  video.setAttribute("playsinline", ""); // keeps iPad Safari from going fullscreen
  stage.appendChild(video);

  // Fallback face if the camera isn't available: the mascot wears a mask
  // instead, so the reward never turns into an error screen.
  const fallbackFace = el("div", "party-fallback hidden", mascotSVG("happy"));
  stage.appendChild(fallbackFace);

  // Two masks: one for the child, one for whoever leans into frame.
  const maskEls = [0, 1].map(slot => {
    const m = el("div", "party-mask", maskSVG(partyMaskType(slot)));
    if (slot === 1) m.classList.add("hidden");
    stage.appendChild(m);
    return m;
  });

  let trackingActive = false;

  // Drag-to-place fallback, used only when face tracking isn't running.
  maskEls.forEach(mask => {
    let dragging = false;
    mask.onpointerdown = (e) => {
      if (trackingActive) return;
      dragging = true;
      mask.setPointerCapture(e.pointerId);
    };
    mask.onpointermove = (e) => {
      if (!dragging || trackingActive) return;
      const rect = stage.getBoundingClientRect();
      mask.style.left = `${Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))}%`;
      mask.style.top = `${Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))}%`;
    };
    mask.onpointerup = () => (dragging = false);
  });

  screen.appendChild(stage);

  const hint = el("div", "party-hint", "📸 Silly masks! Make funny faces!");
  screen.appendChild(hint);

  // Entrance fanfare — this IS the big reward, so it should feel like one.
  const effectHost = el("div", "confetti-container");
  document.body.appendChild(effectHost);
  Audio_.playBigFanfare();
  Audio_.burstConfetti(effectHost);
  setTimeout(() => effectHost.remove(), 2300);

  // Auto-end: run for PARTY_SECONDS, showing a little countdown, then
  // head to the round summary. No button needed to start or stop.
  let remaining = PARTY_SECONDS;
  partyCountdown = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) hint.textContent = `📸 Silly masks! ${remaining}…`;
  }, 1000);
  partyTimer = setTimeout(() => {
    if (state.screen === "party") go(state.party.returnScreen);
  }, PARTY_SECONDS * 1000);

  // Ask for the front camera. On failure (no permission, no camera,
  // insecure context), swap in the mascot fallback — still a party.
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(stream => {
        partyStream = stream;
        video.srcObject = stream;
        startPartyTracking(video, stage, maskEls, (ok) => (trackingActive = ok));
      })
      .catch(() => {
        video.classList.add("hidden");
        fallbackFace.classList.remove("hidden");
      });
  } else {
    video.classList.add("hidden");
    fallbackFace.classList.remove("hidden");
  }

  return screen;
}

/* Face tracking: MediaPipe FaceLandmarker (loaded from CDN in
   index.html; runs entirely on-device). Masks follow each face AND
   react to expressions via blendshapes — jaw-open stretches the mouth,
   blinks squash the eyes, a smile blooms the cheeks. Up to two faces,
   sorted left-to-right so masks don't swap owners. Any failure — script
   didn't load, model fetch failed, browser can't run it — quietly
   leaves the draggable-mask fallback in place. */
function startPartyTracking(video, stage, maskEls, setActive) {
  const vision = window.__vision;
  if (!vision) return; // module didn't load (offline) — drag fallback stays

  const smooth = [{ x: null, y: null, s: null }, { x: null, y: null, s: null }];
  // Cache references to each mask's animated parts, per slot.
  const parts = maskEls.map(m => ({
    eyes: m.querySelectorAll(".m-eye"),
    mouth: m.querySelector(".m-mouth"),
    cheek: m.querySelector(".m-cheek")
  }));

  function react(slot, bs) {
    const p = parts[slot];
    const jaw = bs.jawOpen || 0;
    const blink = Math.max(bs.eyeBlinkLeft || 0, bs.eyeBlinkRight || 0);
    const smile = ((bs.mouthSmileLeft || 0) + (bs.mouthSmileRight || 0)) / 2;
    if (p.mouth) p.mouth.style.transform = `scaleY(${0.35 + jaw * 2.2})`;
    p.eyes.forEach(e => (e.style.transform = `scaleY(${1 - blink * 0.9})`));
    if (p.cheek) p.cheek.style.opacity = `${Math.min(1, smile * 1.4)}`;
  }

  function place(mask, sm, xPx, yPx, sizePx) {
    const a = 0.4; // smoothing: 0 = frozen, 1 = jittery
    sm.x = sm.x === null ? xPx : sm.x + a * (xPx - sm.x);
    sm.y = sm.y === null ? yPx : sm.y + a * (yPx - sm.y);
    sm.s = sm.s === null ? sizePx : sm.s + a * (sizePx - sm.s);
    mask.style.left = `${sm.x}px`;
    mask.style.top = `${sm.y}px`;
    mask.style.width = `${sm.s}px`;
    mask.style.height = `${sm.s * 1.15}px`;
  }

  function handle(result) {
    if (state.screen !== "party") return;
    const rect = stage.getBoundingClientRect();
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh || !rect.width) return;

    // The video uses object-fit: cover, so map landmark coordinates
    // through the same scale-and-crop the browser applied.
    const scale = Math.max(rect.width / vw, rect.height / vh);
    const dispW = vw * scale;
    const dispH = vh * scale;
    const offX = (dispW - rect.width) / 2;
    const offY = (dispH - rect.height) / 2;

    const lms = result.faceLandmarks || [];
    const order = lms
      .map((pts, i) => {
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        for (const pt of pts) {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }
        return { i, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX };
      })
      .sort((a, b) => a.cx - b.cx)
      .slice(0, 2);

    maskEls.forEach((mask, slot) => {
      const f = order[slot];
      if (!f) {
        if (slot === 1) mask.classList.add("hidden");
        return; // mask 0 keeps its last spot rather than snapping away
      }
      mask.classList.remove("hidden");
      // Mirror x, since the preview is flipped (scaleX(-1)).
      const x = rect.width - (f.cx * dispW - offX);
      const y = f.cy * dispH - offY;
      const size = f.w * dispW * 1.9; // masks a bit bigger than the face
      place(mask, smooth[slot], x, y, size);

      const bsArr = result.faceBlendshapes && result.faceBlendshapes[f.i];
      if (bsArr) {
        const bs = {};
        bsArr.categories.forEach(c => (bs[c.categoryName] = c.score));
        react(slot, bs);
      }
    });
  }

  (async () => {
    try {
      if (!partyLandmarker) {
        const fileset = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm"
        );
        partyLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
          },
          outputFaceBlendshapes: true,
          numFaces: 2,
          runningMode: "VIDEO"
        });
      }
      setActive(true);

      const loop = () => {
        if (state.screen !== "party" || !partyStream) return;
        if (video.readyState >= 2) {
          try {
            handle(partyLandmarker.detectForVideo(video, performance.now()));
          } catch (e) {
            /* transient frame error — just try the next frame */
          }
        }
        partyRAF = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      setActive(false); // leaves the draggable-mask fallback usable
    }
  })();
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
