/* rewards.js — picks how to celebrate a correct answer. Instead of the
   same confetti + chime every single time, each success randomly rolls
   one of a few celebration "sizes," and some of those also award a
   sticker that gets saved to the collection. Weighted so small
   celebrations are common and the big one is a rare, extra-exciting
   surprise — a varying, automatic reward schedule rather than a fixed
   one, which is what actually keeps a toddler engaged round after round. */

const Rewards = (() => {
  const CELEBRATION_VARIANTS = [
    { key: "confetti", weight: 40, stickerChance: 0.15 },
    { key: "sparkle", weight: 30, stickerChance: 0.15 },
    { key: "bounce", weight: 20, stickerChance: 0.05 },
    { key: "fanfare", weight: 10, stickerChance: 1 } // the rare "jackpot" celebration
  ];

  function pickVariant() {
    const total = CELEBRATION_VARIANTS.reduce((sum, v) => sum + v.weight, 0);
    let roll = Math.random() * total;
    for (const variant of CELEBRATION_VARIANTS) {
      if (roll < variant.weight) return variant;
      roll -= variant.weight;
    }
    return CELEBRATION_VARIANTS[0];
  }

  /* mascotWrap: the bobbing mascot element to bounce.
     effectHost: a fixed, full-screen container to drop confetti/sparkles
     into (appended to document.body so it survives the next re-render).
     forceSticker: guarantees a sticker regardless of the variant's
     roll — used for "extra polite" answers (magic word + honorific). */
  function celebrate({ mascotWrap, effectHost, forceSticker }) {
    const variant = pickVariant();
    if (mascotWrap) mascotWrap.classList.add("celebrate");

    if (variant.key === "confetti") {
      Audio_.playSuccessChime();
      Audio_.burstConfetti(effectHost);
    } else if (variant.key === "sparkle") {
      Audio_.playSparkleChime();
      Audio_.burstSparkles(effectHost);
    } else if (variant.key === "bounce") {
      // Cheapest celebration on purpose: just the chime + mascot bounce,
      // so the bigger effects still stand out as special.
      Audio_.playSuccessChime();
    } else if (variant.key === "fanfare") {
      Audio_.playBigFanfare();
      Audio_.burstConfetti(effectHost);
      Audio_.burstSparkles(effectHost);
    }

    let sticker = null;
    if (forceSticker || Math.random() < variant.stickerChance) {
      sticker = randomFrom(STICKER_POOL);
      Storage.addSticker(sticker);
    }

    return { variant: variant.key, sticker };
  }

  return { celebrate };
})();
