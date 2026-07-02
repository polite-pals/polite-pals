/* data.js — content for the app: who's asking, what they ask, and the
   pretend-play scenarios. Kept as plain global consts (no build step,
   no modules) so this works when opened directly as a file in Safari. */

const DEFAULT_ASKERS = [
  {
    id: "grandma",
    name: "Grandma",
    honorific: "ma'am",
    gender: "female",
    skin: "#F2C9A0",
    hair: "#B0B0B0",
    accessory: "bun"
  },
  {
    id: "grandpa",
    name: "Grandpa",
    honorific: "sir",
    gender: "male",
    skin: "#E8B88A",
    hair: "#CFCFCF",
    accessory: "glasses"
  },
  {
    id: "teacher",
    name: "Ms. Rivera",
    honorific: "ma'am",
    gender: "female",
    skin: "#C98A5B",
    hair: "#3B2B22",
    accessory: "glasses"
  },
  {
    id: "coach",
    name: "Coach Sam",
    honorific: "sir",
    gender: "male",
    skin: "#F0B98D",
    hair: "#5B3A29",
    accessory: "cap"
  }
];

/* Quiz questions: simple factual yes/no questions a toddler can reason
   about. "spoken" is what gets read aloud (asker fills in the honorific
   at speak time), "expected" is "yes" or "no". */
const DEFAULT_QUESTIONS = [
  { spoken: "Is the sky blue?", expected: "yes" },
  { spoken: "Do dogs go woof?", expected: "yes" },
  { spoken: "Can you clap your hands?", expected: "yes" },
  { spoken: "Do birds fly?", expected: "yes" },
  { spoken: "Do fish swim?", expected: "yes" },
  { spoken: "Is it fun to play?", expected: "yes" },
  { spoken: "Do cats say meow?", expected: "yes" },
  { spoken: "Is water wet?", expected: "yes" },
  { spoken: "Can you touch your nose?", expected: "yes" },
  { spoken: "Are bananas yellow?", expected: "yes" },
  { spoken: "Can a pig fly?", expected: "no" },
  { spoken: "Is grass purple?", expected: "no" },
  { spoken: "Do cows say ribbit?", expected: "no" },
  { spoken: "Is fire cold?", expected: "no" },
  { spoken: "Do shoes go on your head?", expected: "no" },
  { spoken: "Can you eat a rock?", expected: "no" },
  { spoken: "Is the moon made of cheese?", expected: "no" },
  { spoken: "Do trees have wheels?", expected: "no" },
  { spoken: "Can a fish sing a song?", expected: "no" },
  { spoken: "Is your bed in the kitchen?", expected: "no" }
];

/* Stickers: the collectible reward a correct answer sometimes earns
   (see rewards.js). Kept as emoji + name so, like everything else here,
   there's nothing to host/download. */
const STICKER_POOL = [
  { emoji: "🌟", name: "Shining Star" },
  { emoji: "🏅", name: "Manners Medal" },
  { emoji: "🎖️", name: "Politeness Ribbon" },
  { emoji: "💎", name: "Sparkle Gem" },
  { emoji: "🌈", name: "Rainbow Badge" },
  { emoji: "🦄", name: "Unicorn Friend" },
  { emoji: "🍭", name: "Sweet Treat" },
  { emoji: "🐝", name: "Busy Bee" },
  { emoji: "🐣", name: "Little Chick" },
  { emoji: "🎈", name: "Party Balloon" },
  { emoji: "🌻", name: "Sunny Flower" },
  { emoji: "🐬", name: "Happy Dolphin" }
];

/* Roleplay scenarios: short 2-3 beat conversations that teach WHEN to
   use "sir"/"ma'am", not just the words. Each beat is something the
   asker says, plus the polite reply the child taps, plus a short
   response from the asker after a correct tap. Kept very short for
   a 2-4 year old's attention span. */
const DEFAULT_SCENARIOS = [
  {
    id: "bedtime",
    title: "Bedtime with Grandma",
    askerId: "grandma",
    beats: [
      {
        line: "It's time for bed. Is that okay?",
        replyIfYes: "Sweet dreams! I love you.",
        replyIfNo: "That's okay, five more minutes. But then bedtime!"
      },
      {
        line: "Did you brush your teeth?",
        replyIfYes: "Wonderful! Sparkly clean teeth.",
        replyIfNo: "Let's go brush them together!"
      }
    ]
  },
  {
    id: "cleanup",
    title: "Clean Up with Grandpa",
    askerId: "grandpa",
    beats: [
      {
        line: "Can you help me clean up the toys?",
        replyIfYes: "Thank you! You're a great helper.",
        replyIfNo: "That's okay, maybe in a minute?"
      },
      {
        line: "Can you put the blocks in the box?",
        replyIfYes: "Perfect! Nice and tidy.",
        replyIfNo: "Let's try together!"
      }
    ]
  },
  {
    id: "circletime",
    title: "Circle Time with Ms. Rivera",
    askerId: "teacher",
    beats: [
      {
        line: "Is it time to sit down for circle time?",
        replyIfYes: "Wonderful! Come sit with your friends.",
        replyIfNo: "Okay, let's walk over together."
      },
      {
        line: "Can you use your listening ears?",
        replyIfYes: "Excellent listening!",
        replyIfNo: "Let's practice our listening ears together."
      }
    ]
  },
  {
    id: "practice",
    title: "Practice with Coach Sam",
    askerId: "coach",
    beats: [
      {
        line: "Are you ready to warm up?",
        replyIfYes: "Awesome! Let's stretch it out.",
        replyIfNo: "No rush, let's take a breath first."
      },
      {
        line: "Can you try your best?",
        replyIfYes: "That's the spirit! Great teamwork.",
        replyIfNo: "That's okay, we'll try again together."
      }
    ]
  }
];
