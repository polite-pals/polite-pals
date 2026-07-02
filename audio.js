/* audio.js — speech synthesis (asking questions out loud), optional
   speech recognition (listening for a spoken answer), a synthesized
   success chime (Web Audio, no audio files needed), and a confetti
   burst (pure CSS/DOM, no video files needed). Every effect here is
   generated in code so the app never depends on finding/hosting media
   files — that was the biggest weak point in v1. */

const Audio_ = (() => {
  const synth = window.speechSynthesis || null;
  const RecognitionCtor =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  let voices = [];

  function refreshVoices() {
    if (!synth) return;
    voices = synth.getVoices();
  }
  if (synth) {
    refreshVoices();
    synth.onvoiceschanged = refreshVoices;
  }

  function pickVoice(gender) {
    if (!voices.length) return null;
    const en = voices.filter(v => v.lang && v.lang.startsWith("en"));
    const pool = en.length ? en : voices;
    const wantFemale = gender === "female";
    const byName = pool.find(v => {
      const n = v.name.toLowerCase();
      return wantFemale
        ? n.includes("female") || n.includes("samantha") || n.includes("zira") || n.includes("victoria")
        : n.includes("male") || n.includes("david") || n.includes("fred") || n.includes("daniel");
    });
    return byName || pool[0] || null;
  }

  function speak(text, gender, onDone) {
    if (!synth || !window.SpeechSynthesisUtterance) {
      if (onDone) onDone();
      return;
    }
    synth.cancel(); // clear any queued speech so lines never overlap
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.95; // slightly slower — easier for a toddler to follow
    utter.pitch = gender === "female" ? 1.15 : 0.9;
    const voice = pickVoice(gender);
    if (voice) utter.voice = voice;

    // Speech synthesis is occasionally flaky (Safari especially can drop
    // the "end" event, e.g. if the tab loses focus mid-utterance). If
    // that happens with nothing else to trigger it, the game would sit
    // frozen forever. So: fire onDone once, whichever happens first —
    // the real event, or a generous fallback timer sized to the text.
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      if (onDone) onDone();
    };
    const wordCount = text.trim().split(/\s+/).length;
    const fallbackMs = Math.min(8000, Math.max(1800, wordCount * 400));
    const fallbackTimer = setTimeout(settle, fallbackMs);

    utter.onend = () => {
      clearTimeout(fallbackTimer);
      settle();
    };
    utter.onerror = () => {
      clearTimeout(fallbackTimer);
      settle();
    };

    synth.speak(utter);
  }

  function isRecognitionSupported() {
    return !!RecognitionCtor;
  }

  /* --------------------------------------------------------------------
     Microphone session
     --------------------------------------------------------------------
     Chrome (and Safari) treat every SpeechRecognition.start() call as a
     fresh permission check unless it's launched directly from a user
     gesture. Our first version created a brand-new recognition object
     for every single question, which is exactly why the browser was
     re-verifying mic access on every prompt.

     The fix: open ONE continuous recognition session for the whole
     round, started synchronously from the tap that begins the round
     (a real user gesture — e.g. tapping "Practice Quiz"), and just
     leave it running. Between questions we don't stop/restart it; we
     just flip `accepting` on and off and repoint which handler gets
     the next transcript. That means only one permission check per
     round instead of one per question. */
  let session = null; // the live SpeechRecognition instance, or null
  let sessionWantedActive = false; // true while a round wants the mic open
  let accepting = false; // true only while we actually want to process speech
  let transcriptHandler = null; // (transcript) => void, set per-question
  let sessionErrorHandler = null; // (reason) => void, set per-round

  function startSession(onError) {
    if (!RecognitionCtor) {
      onError && onError("unsupported");
      return;
    }
    sessionWantedActive = true;
    sessionErrorHandler = onError || null;
    openRecognitionInstance();
  }

  function openRecognitionInstance() {
    try {
      session = new RecognitionCtor();
      session.lang = "en-US";
      session.continuous = true; // stay open across multiple answers
      session.interimResults = false;
      session.maxAlternatives = 1;

      session.onresult = (event) => {
        if (!accepting) return; // ignore speech while TTS is talking, etc.
        const last = event.results[event.results.length - 1];
        const transcript = last[0].transcript.toLowerCase();
        if (transcriptHandler) transcriptHandler(transcript);
      };

      session.onerror = (event) => {
        const reason = event.error || "error";
        if (reason === "not-allowed" || reason === "service-not-allowed") {
          sessionWantedActive = false;
          if (sessionErrorHandler) sessionErrorHandler(reason);
          return;
        }
        // "no-speech" and similar are routine — the browser stops the
        // session after a stretch of silence even in continuous mode.
        // If we still want the mic open, quietly reopen it.
        if (sessionWantedActive) {
          setTimeout(() => {
            if (sessionWantedActive) openRecognitionInstance();
          }, 250);
        }
      };

      session.onend = () => {
        // Some browsers end the session on their own even in continuous
        // mode (silence timeouts, tab visibility changes). Reopen it
        // quietly as long as the round still wants the mic on — this
        // keeps the mic "open" from the user's perspective without a
        // fresh permission prompt, since it's the same page/tab that
        // already has permission for this round.
        if (sessionWantedActive) {
          setTimeout(() => {
            if (sessionWantedActive) openRecognitionInstance();
          }, 250);
        }
      };

      session.start();
    } catch (e) {
      if (sessionErrorHandler) sessionErrorHandler("start-failed");
    }
  }

  function endSession() {
    sessionWantedActive = false;
    accepting = false;
    transcriptHandler = null;
    sessionErrorHandler = null;
    if (session) {
      try {
        session.stop();
      } catch (e) {
        /* no-op — already stopped */
      }
    }
    session = null;
  }

  function setAccepting(isAccepting) {
    accepting = isAccepting;
  }

  function setTranscriptHandler(fn) {
    transcriptHandler = fn;
  }

  function isSessionActive() {
    return sessionWantedActive;
  }

  /* Manual retry path for the mic button: if the continuous session
     somehow isn't running (permission was denied, or it hasn't been
     started yet), a tap is a genuine user gesture, so use it to
     (re)start the session cleanly. */
  function retryFromGesture(onError) {
    if (sessionWantedActive && session) return; // already running, nothing to do
    startSession(onError);
  }

  /* A short, cheerful three-note major arpeggio, synthesized live so
     there's no dependency on finding/hosting a sound file. */
  function playSuccessChime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
      // Close the context after the notes finish so we don't leak them.
      setTimeout(() => ctx.close(), 900);
    } catch (e) {
      /* no-op — audio isn't essential to the reward */
    }
  }

  /* A gentle two-tone "try again" sound — not harsh, just a nudge. */
  function playTryAgainTone() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(392, ctx.currentTime); // G4
      osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.25); // E4
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => ctx.close(), 500);
    } catch (e) {
      /* no-op */
    }
  }

  /* Confetti made of plain divs with a CSS fall+spin animation,
     appended to `container` and removed after they finish. */
  function burstConfetti(container) {
    if (!container) return;
    const colors = ["#FF6B5B", "#FFC94A", "#4FB6C4", "#6FCF97", "#8E6FCF"];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.3}s`;
      piece.style.animationDuration = `${1.1 + Math.random() * 0.6}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 2200);
    }
  }

  return {
    speak,
    isRecognitionSupported,
    startSession,
    endSession,
    setAccepting,
    setTranscriptHandler,
    isSessionActive,
    retryFromGesture,
    playSuccessChime,
    playTryAgainTone,
    burstConfetti
  };
})();
