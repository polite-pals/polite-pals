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
    hair: "#C4C4C4",
    shirt: "#C29BDD",
    accessory: "bun"
  },
  {
    id: "grandpa",
    name: "Grandpa",
    honorific: "sir",
    gender: "male",
    skin: "#E8B88A",
    hair: "#CFCFCF",
    shirt: "#6E9BD1",
    accessory: "glasses",
    bald: true
  },
  {
    id: "teacher",
    name: "Ms. Rivera",
    honorific: "ma'am",
    gender: "female",
    skin: "#C98A5B",
    hair: "#3B2B22",
    shirt: "#3FB6A8",
    accessory: "glasses"
  },
  {
    id: "coach",
    name: "Coach Sam",
    honorific: "sir",
    gender: "male",
    skin: "#F0B98D",
    hair: "#5B3A29",
    shirt: "#E86A5B",
    accessory: "cap"
  },
  {
    id: "mom",
    name: "Mom",
    honorific: "ma'am",
    gender: "female",
    skin: "#E3A272",
    hair: "#7A4B32",
    shirt: "#E8779E"
  },
  {
    id: "dad",
    name: "Dad",
    honorific: "sir",
    gender: "male",
    skin: "#D9A066",
    hair: "#DEB25E",
    shirt: "#4C8C6B",
    accessory: "afro"
  }
];

/* Quiz questions: simple yes/no questions a toddler can reason about.
   "spoken" is what gets read aloud (asker fills in the honorific at
   speak time), "expected" is "yes" or "no".

   Every question is checkable against something the child has actually
   seen or done — no idioms ("can a pig fly?") that need cultural
   context. The "no" questions are familiar things made wrong (shoes on
   hands), so the joke lands even for a 2-year-old, and several pairs
   mirror a "yes" question to reinforce the reasoning. */
const DEFAULT_QUESTIONS = [
  { spoken: "Do dogs say woof?", expected: "yes", askerId: "grandma", altAskerId: "grandpa" },
  { spoken: "Do cats say meow?", expected: "yes", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "Do fish swim in water?", expected: "yes", askerId: "teacher", altAskerId: "coach" },
  { spoken: "Do birds have wings?", expected: "yes", askerId: "coach", altAskerId: "teacher" },
  { spoken: "Can you clap your hands?", expected: "yes", askerId: "mom", altAskerId: "dad" },
  { spoken: "Do you sleep in a bed at night?", expected: "yes", askerId: "dad", altAskerId: "mom" },
  { spoken: "Do you wear shoes on your feet?", expected: "yes", askerId: "grandma", altAskerId: "grandpa" },
  { spoken: "Is ice cream cold?", expected: "yes", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "Does rain fall from the sky?", expected: "yes", askerId: "teacher", altAskerId: "coach" },
  { spoken: "Do cars have wheels?", expected: "yes", askerId: "coach", altAskerId: "teacher" },
  { spoken: "Do dogs say meow?", expected: "no", askerId: "mom", altAskerId: "dad" },
  { spoken: "Do you wear shoes on your hands?", expected: "no", askerId: "dad", altAskerId: "mom" },
  { spoken: "Do you sleep in the bathtub?", expected: "no", askerId: "grandma", altAskerId: "grandpa" },
  { spoken: "Is ice cream hot?", expected: "no", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "Do you brush your teeth with a spoon?", expected: "no", askerId: "teacher", altAskerId: "coach" },
  { spoken: "Do cows drive cars?", expected: "no", askerId: "coach", altAskerId: "teacher" },
  { spoken: "Do you eat cereal with your toes?", expected: "no", askerId: "mom", altAskerId: "dad" },
  { spoken: "Does a fish ride a bicycle?", expected: "no", askerId: "dad", altAskerId: "mom" },
  { spoken: "Do you put your pajamas on the dog?", expected: "no", askerId: "grandma", altAskerId: "grandpa" },
  { spoken: "Is snow warm?", expected: "no", askerId: "grandpa", altAskerId: "grandma" }
];

/* Magic Words: "please", "thank you", "may I please", and "you're
   welcome" — taught as their own games (see MAGIC_GAMES) rather than
   folded into the yes/no quiz, since the skill here is producing the
   right phrase, not answering yes/no. */
const MAGIC_WORDS = {
  please: { id: "please", label: "Please", spoken: "Please" },
  thankyou: { id: "thankyou", label: "Thank you", spoken: "Thank you" },
  mayi: { id: "mayi", label: "May I please?", spoken: "May I please?" },
  welcome: { id: "welcome", label: "You're welcome", spoken: "You're welcome" }
};

const PLEASE_THANKYOU_QUESTIONS = [
  { spoken: "You want a cookie. What do you say to ask for one?", expected: "please", askerId: "teacher", altAskerId: "coach" },
  { spoken: "Grandma gives you a new toy. What do you say?", expected: "thankyou", askerId: "coach", altAskerId: "teacher" },
  { spoken: "You want to color. What do you say to ask for crayons?", expected: "please", askerId: "mom", altAskerId: "dad" },
  { spoken: "Grandpa helps you tie your shoe. What do you say?", expected: "thankyou", askerId: "dad", altAskerId: "mom" },
  { spoken: "Ms. Rivera says, \"Thank you for helping!\" What do you say back?", expected: "welcome", askerId: "grandma", altAskerId: "grandpa" },
  { spoken: "You want more milk. What do you say?", expected: "please", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "Coach Sam gives you a team water bottle. What do you say?", expected: "thankyou", askerId: "teacher", altAskerId: "coach" },
  { spoken: "Your friend says \"thank you\" for sharing. What do you say back?", expected: "welcome", askerId: "coach", altAskerId: "teacher" },
  { spoken: "You want a turn on the swing. What do you say to ask?", expected: "please", askerId: "mom", altAskerId: "dad" },
  { spoken: "Grandma brings you a glass of water before bed. What do you say?", expected: "thankyou", askerId: "dad", altAskerId: "mom" },
  { spoken: "You want a snack. What do you say to ask?", expected: "please", askerId: "grandma", altAskerId: "grandpa" },
  { spoken: "Someone holds the door open for you. What do you say?", expected: "thankyou", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "Grandpa says, \"Thank you for cleaning up!\" What do you say back?", expected: "welcome", askerId: "teacher", altAskerId: "coach" },
  { spoken: "You want help with your shoes. What do you say to ask?", expected: "please", askerId: "coach", altAskerId: "teacher" },
  { spoken: "You want to wear your favorite shirt. What do you say to ask?", expected: "please", askerId: "mom", altAskerId: "dad" },
  { spoken: "Someone gives you a piggyback ride. What do you say?", expected: "thankyou", askerId: "dad", altAskerId: "mom" },
  { spoken: "You want to pick the bedtime story. What do you say to ask?", expected: "please", askerId: "grandma", altAskerId: "grandpa" },
  { spoken: "Grandpa says, \"Thank you for the big hug!\" What do you say back?", expected: "welcome", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "You want to line up first. What do you say to ask?", expected: "please", askerId: "teacher", altAskerId: "coach" },
  { spoken: "Coach Sam gives you a sticker for trying hard. What do you say?", expected: "thankyou", askerId: "coach", altAskerId: "teacher" }
];

const MAY_I_QUESTIONS = [
  { spoken: "You want to get down from the table. What do you say?", expected: "mayi", askerId: "dad", altAskerId: "mom" },
  { spoken: "You want to go outside and play. What do you say?", expected: "mayi", askerId: "grandma", altAskerId: "dad" },
  { spoken: "You want a turn with your friend's toy. What do you say?", expected: "mayi", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "You want a snack before dinner. What do you say?", expected: "mayi", askerId: "teacher", altAskerId: "grandpa" },
  { spoken: "You want to sit in Grandpa's chair. What do you say?", expected: "mayi", askerId: "coach", altAskerId: "teacher" },
  { spoken: "You want to watch a show. What do you say?", expected: "mayi", askerId: "mom", altAskerId: "coach" },
  { spoken: "You want to open the door. What do you say?", expected: "mayi", askerId: "dad", altAskerId: "mom" },
  { spoken: "You want to help set the table. What do you say?", expected: "mayi", askerId: "grandma", altAskerId: "dad" },
  { spoken: "You want to use Grandma's crayons. What do you say?", expected: "mayi", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "You want to feed the dog. What do you say?", expected: "mayi", askerId: "teacher", altAskerId: "grandpa" },
  { spoken: "You want to try on the team jersey. What do you say?", expected: "mayi", askerId: "coach", altAskerId: "teacher" },
  { spoken: "You want to pick out your own clothes. What do you say?", expected: "mayi", askerId: "mom", altAskerId: "coach" },
  { spoken: "You want to help wash the car. What do you say?", expected: "mayi", askerId: "dad", altAskerId: "mom" },
  { spoken: "You want another cookie. What do you say?", expected: "mayi", askerId: "grandma", altAskerId: "dad" },
  { spoken: "You want to read Grandpa's newspaper. What do you say?", expected: "mayi", askerId: "grandpa", altAskerId: "grandma" },
  { spoken: "You want to be the line leader. What do you say?", expected: "mayi", askerId: "teacher", altAskerId: "grandpa" },
  { spoken: "You want to try a different game. What do you say?", expected: "mayi", askerId: "coach", altAskerId: "teacher" },
  { spoken: "You want to stay up a little later. What do you say?", expected: "mayi", askerId: "mom", altAskerId: "coach" },
  { spoken: "You want to hold the flashlight. What do you say?", expected: "mayi", askerId: "dad", altAskerId: "mom" },
  { spoken: "You want to pet the neighbor's dog. What do you say?", expected: "mayi", askerId: "grandma", altAskerId: "dad" }
];

/* Three separate games over the same phrase set: two focused ones
   (Please & Thank You, May I Please) plus a Mixed round that draws
   from both — this is the "keep them separate or random" split. */
const MAGIC_GAMES = [
  {
    id: "please-thankyou",
    title: "Please & Thank You",
    subtitle: "Ask nicely and say thanks",
    wordIds: ["please", "thankyou", "welcome"],
    questions: PLEASE_THANKYOU_QUESTIONS
  },
  {
    id: "may-i",
    title: "May I Please?",
    subtitle: "Ask before you do it",
    wordIds: ["mayi"],
    questions: MAY_I_QUESTIONS
  },
  {
    id: "mixed-manners",
    title: "Mixed Magic Words",
    subtitle: "A little bit of everything",
    wordIds: ["please", "thankyou", "mayi", "welcome"],
    questions: [...PLEASE_THANKYOU_QUESTIONS, ...MAY_I_QUESTIONS]
  }
];

/* "What Do You Say?" scenarios: realistic school / playground / friend /
   out-and-about situations, each with MULTIPLE acceptable answers —
   because real manners rarely have exactly one right response. The
   child can speak any accepted answer (or tap it in fallback mode).

   - "answers" is the accepted list. "label" is what the tap button
     shows; "hear" is the list of trigger phrases matched against the
     speech transcript. Hear-phrases are written lowercase with
     apostrophes removed ("im sorry", not "I'm sorry") because the
     parser normalizes transcripts the same way before matching.
   - "distractor" is one clearly-unkind tap option so the tap fallback
     still involves a real choice. It is never spoken aloud as a hint.
   - "feedback" is what the asker says after a correct answer — it
     names WHY the answer was kind, which is the actual lesson. */
const SAY_QUESTIONS = [
  /* --- At school --- */
  {
    spoken: "Your teacher hands you a paper. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Take it and say nothing",
    feedback: "Saying thank you shows you noticed the kindness!",
    askerId: "coach",
    altAskerId: "teacher"
  },
  {
    spoken: "You know the answer and want to tell the teacher. What should you do?",
    answers: [
      { label: "Raise my hand quietly", hear: ["raise", "hand"] },
      { label: "Wait to be called on", hear: ["wait", "called on"] }
    ],
    distractor: "Shout the answer",
    feedback: "Raising your hand gives everyone a turn to talk!",
    askerId: "mom",
    altAskerId: "coach"
  },
  {
    spoken: "Oops! You bump into a friend's desk. What do you say?",
    answers: [
      { label: "Excuse me!", hear: ["excuse"] },
      { label: "I'm sorry!", hear: ["sorry"] }
    ],
    distractor: "Keep walking",
    feedback: "Saying sorry or excuse me shows you care about others!",
    askerId: "dad",
    altAskerId: "mom"
  },
  {
    spoken: "You can't zip your backpack. What do you say?",
    answers: [
      { label: "Can you help me, please?", hear: ["can you help", "help"] },
      { label: "May I have some help, please?", hear: ["may i"] }
    ],
    distractor: "Give up and say nothing",
    feedback: "Asking nicely for help is a big-kid skill!",
    askerId: "grandma",
    altAskerId: "dad"
  },
  /* --- On the playground --- */
  {
    spoken: "Some kids are playing a fun game. You want to play too. What do you say?",
    answers: [
      { label: "Can I play too?", hear: ["can i play", "play too", "play with you"] },
      { label: "May I please play with you?", hear: ["may i"] }
    ],
    distractor: "Take the ball",
    feedback: "Asking to join is how you make new friends!",
    askerId: "grandpa",
    altAskerId: "grandma"
  },
  {
    spoken: "Your friend falls down on the playground. What do you say?",
    answers: [
      { label: "Are you okay?", hear: ["ok", "alright", "all right", "hurt"] },
      { label: "Can I help you?", hear: ["help"] }
    ],
    distractor: "Keep playing",
    feedback: "Checking on a friend is so kind!",
    askerId: "teacher",
    altAskerId: "grandpa"
  },
  {
    spoken: "Someone is on the swing you want. What do you say?",
    answers: [
      { label: "May I have a turn, please?", hear: ["turn"] },
      { label: "I'll wait for my turn", hear: ["wait"] }
    ],
    distractor: "Grab the swing",
    feedback: "Waiting and asking for turns keeps playtime fun for everyone!",
    askerId: "coach",
    altAskerId: "teacher"
  },
  {
    spoken: "You win the race! What do you say to your friend?",
    answers: [
      { label: "Good game!", hear: ["good game", "good race", "good job"] },
      { label: "You did great too!", hear: ["great", "you did"] }
    ],
    distractor: "Say \"I'm the best!\"",
    feedback: "Being a kind winner makes everyone want to play again!",
    askerId: "mom",
    altAskerId: "coach"
  },
  /* --- With friends --- */
  {
    spoken: "Your friend shares their snack with you. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Just eat it",
    feedback: "Thank you makes sharing feel good!",
    askerId: "dad",
    altAskerId: "mom"
  },
  {
    spoken: "You and your friend both want the same toy. What do you say?",
    answers: [
      { label: "You can go first", hear: ["first"] },
      { label: "Can we take turns?", hear: ["turns", "share"] }
    ],
    distractor: "Grab it",
    feedback: "Taking turns means you both get to play!",
    askerId: "grandma",
    altAskerId: "dad"
  },
  {
    spoken: "Your friend looks sad today. What do you say?",
    answers: [
      { label: "What's wrong?", hear: ["wrong", "sad"] },
      { label: "Do you want to play with me?", hear: ["play"] }
    ],
    distractor: "Walk away",
    feedback: "Noticing a sad friend is what good friends do!",
    askerId: "grandpa",
    altAskerId: "grandma"
  },
  {
    spoken: "A friend says you can't play with them. What do you say?",
    answers: [
      { label: "That hurts my feelings", hear: ["feelings", "hurt"] },
      { label: "Okay, I'll play something else", hear: ["something else"] }
    ],
    distractor: "Yell at them",
    feedback: "Using your words — and telling a grown-up if it keeps happening — is just right.",
    askerId: "teacher",
    altAskerId: "grandpa"
  },
  /* --- Out and about --- */
  {
    spoken: "The waiter brings your food at a restaurant. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Start eating",
    feedback: "Thanking helpers makes their day brighter!",
    askerId: "coach",
    altAskerId: "teacher"
  },
  {
    spoken: "You walk in front of someone at the store. What do you say?",
    answers: [
      { label: "Excuse me!", hear: ["excuse"] },
      { label: "I'm sorry!", hear: ["sorry"] }
    ],
    distractor: "Keep walking",
    feedback: "Excuse me is the polite way to pass by!",
    askerId: "mom",
    altAskerId: "coach"
  },
  {
    spoken: "Someone holds the door open for you. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Walk through quietly",
    feedback: "A thank you for holding the door — perfect manners!",
    askerId: "dad",
    altAskerId: "mom"
  },
  {
    spoken: "You finished your food but you're still hungry. What do you say?",
    answers: [
      { label: "May I have more, please?", hear: ["may i"] },
      { label: "Can I have more, please?", hear: ["more"] }
    ],
    distractor: "Bang the table",
    feedback: "Asking so nicely — of course you may!",
    askerId: "grandma",
    altAskerId: "dad"
  },
  {
    spoken: "Grandpa gives you his old watch. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Grab it and run off",
    feedback: "A gift deserves a thank you!",
    askerId: "grandpa",
    altAskerId: "grandma"
  },
  {
    spoken: "You need to borrow a pencil from a classmate. What do you say?",
    answers: [
      { label: "Can I borrow a pencil, please?", hear: ["borrow", "pencil"] },
      { label: "May I please borrow a pencil?", hear: ["may i"] }
    ],
    distractor: "Take it without asking",
    feedback: "Asking before you borrow shows respect for their things!",
    askerId: "teacher",
    altAskerId: "coach"
  },
  {
    spoken: "You bump shoulders with a teammate during a game. What do you say?",
    answers: [
      { label: "Sorry about that!", hear: ["sorry"] },
      { label: "My bad, you okay?", hear: ["my bad", "okay"] }
    ],
    distractor: "Keep playing like nothing happened",
    feedback: "Checking in after a bump shows good sportsmanship!",
    askerId: "coach",
    altAskerId: "teacher"
  },
  {
    spoken: "Mom asks if you're ready to leave and you need one more minute. What do you say?",
    answers: [
      { label: "One more minute, please?", hear: ["minute", "please"] },
      { label: "Almost ready, please wait", hear: ["almost", "wait"] }
    ],
    distractor: "Ignore her and keep playing",
    feedback: "Asking nicely for more time is much better than ignoring!",
    askerId: "mom",
    altAskerId: "dad"
  }
];

/* Silly Mask Party: the big end-of-session reward. Finishing any round
   auto-launches a 10-second camera "photo booth" where the child (and a
   grown-up!) wear big silly masks that follow their faces and react to
   their expressions — open your mouth and the mask opens its mouth,
   blink and it blinks. Masks are drawn in code (SVG), so there's
   nothing to host and nothing is uploaded — the video never leaves the
   device. Each entry in PARTY_MASKS is a type name understood by
   maskSVG() in app.js. */
const PARTY_MASKS = ["pig", "bunny", "lion", "frog", "monkey", "robot"];

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

/* Roleplay scenarios: 4-beat conversations that teach WHEN to use
   "sir"/"ma'am", not just the words. Each beat is something the asker
   says, plus the polite reply the child taps, plus a short response
   from the asker after a correct tap. Every scenario opens with a beat
   that establishes what's happening BEFORE getting into specifics —
   jumping straight to "stir the batter" without first saying "let's
   make cookies" is disorienting for a 2-4 year old with no context. */
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
        line: "Can you put on your pajamas?",
        replyIfYes: "Wonderful! You look so cozy.",
        replyIfNo: "Let's get them on together."
      },
      {
        line: "Did you brush your teeth?",
        replyIfYes: "Wonderful! Sparkly clean teeth.",
        replyIfNo: "Let's go brush them together!"
      },
      {
        line: "Ready for one story before lights out?",
        replyIfYes: "I love story time with you. Let's snuggle in.",
        replyIfNo: "Okay, straight to sleep then. Sweet dreams!"
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
      },
      {
        line: "Can you put your books back on the shelf?",
        replyIfYes: "Nice and neat! Great job.",
        replyIfNo: "Let's do it together, one at a time."
      },
      {
        line: "Does the room look all clean now?",
        replyIfYes: "It sure does! You did a wonderful job.",
        replyIfNo: "Let's take one more look together."
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
        line: "Can you sit crisscross on your carpet square?",
        replyIfYes: "Perfect sitting! Thank you.",
        replyIfNo: "Let's find your spot together."
      },
      {
        line: "Can you use your listening ears?",
        replyIfYes: "Excellent listening!",
        replyIfNo: "Let's practice our listening ears together."
      },
      {
        line: "Would you like to sing our good morning song?",
        replyIfYes: "Yay! Let's sing together.",
        replyIfNo: "That's okay, you can listen along."
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
      },
      {
        line: "Can you listen for my whistle?",
        replyIfYes: "Great listening! You're a natural.",
        replyIfNo: "That's okay, I'll remind you."
      },
      {
        line: "Ready to give your teammates a high five when we're done?",
        replyIfYes: "Awesome! That's real team spirit.",
        replyIfNo: "That's okay, a wave works too!"
      }
    ]
  },
  {
    id: "playground",
    title: "Playground with Coach Sam",
    askerId: "coach",
    beats: [
      {
        line: "Some kids are playing a game over there. Should we ask to join them?",
        replyIfYes: "Great idea! We can say, \"Can we play too?\"",
        replyIfNo: "That's okay — we can play our own game right here."
      },
      {
        line: "Your friend wants a turn on the slide. Can you let them go first?",
        replyIfYes: "That's so kind! Taking turns makes everyone happy.",
        replyIfNo: "Hmm, let's think about it — taking turns is fair, and your turn comes next!"
      },
      {
        line: "Can you hold the ladder steady for your friend?",
        replyIfYes: "Thank you! That's what teammates do.",
        replyIfNo: "That's alright, maybe next time."
      },
      {
        line: "Time to head back inside. Can you walk, not run?",
        replyIfYes: "Great walking! Nice and safe.",
        replyIfNo: "Let's practice our walking feet together."
      }
    ]
  },
  {
    id: "lunchtime",
    title: "Lunch with Ms. Rivera",
    askerId: "teacher",
    beats: [
      {
        line: "It's lunchtime! Did you wash your hands?",
        replyIfYes: "Wonderful! Clean hands, happy tummy.",
        replyIfNo: "Let's go wash them together — nice and bubbly!"
      },
      {
        line: "Can you try a bite of your vegetables?",
        replyIfYes: "Wonderful! Growing bodies need veggies.",
        replyIfNo: "That's okay, maybe just a little taste?"
      },
      {
        line: "Would you like some more milk?",
        replyIfYes: "Here you go! Drink up.",
        replyIfNo: "Okay, let me know if you change your mind."
      },
      {
        line: "All done eating! Can you help clean up our table?",
        replyIfYes: "Thank you! What a great helper you are.",
        replyIfNo: "That's okay — let's do it together, it goes faster!"
      }
    ]
  },
  {
    id: "gettingdressed",
    title: "Getting Dressed with Mom",
    askerId: "mom",
    beats: [
      {
        line: "Can you help me pick out your shirt for today?",
        replyIfYes: "Great choice! You have such good taste.",
        replyIfNo: "That's okay, I'll pick a fun one for you."
      },
      {
        line: "Time to put on your shoes. Can you try it yourself?",
        replyIfYes: "Look at you go! Such a big kid.",
        replyIfNo: "That's okay, I'll help you get started."
      },
      {
        line: "Should we brush your hair before we head out?",
        replyIfYes: "Perfect! Now you look so nice and neat.",
        replyIfNo: "Okay, let's do it quick so we're ready to go."
      },
      {
        line: "Ready to grab your jacket before we go outside?",
        replyIfYes: "Perfect! Now you'll stay nice and warm.",
        replyIfNo: "Let's grab it together, just in case."
      }
    ]
  },
  {
    id: "yardtime",
    title: "Yard Time with Dad",
    askerId: "dad",
    beats: [
      {
        line: "Want to help me water the flowers?",
        replyIfYes: "Great teamwork! They're going to grow so tall.",
        replyIfNo: "That's alright, you can watch me do it."
      },
      {
        line: "Can you help me pull a few weeds?",
        replyIfYes: "Thanks, bud! You're a great gardener.",
        replyIfNo: "That's okay, I'll get those."
      },
      {
        line: "Want to help me rake up the leaves?",
        replyIfYes: "Awesome! Big pile coming up.",
        replyIfNo: "No problem, maybe next time."
      },
      {
        line: "Can you put your bike away when we're done?",
        replyIfYes: "Thank you! A tidy yard makes me happy.",
        replyIfNo: "Let's put it away together before we go inside."
      }
    ]
  },
  {
    id: "baking",
    title: "Baking with Grandma",
    askerId: "grandma",
    beats: [
      {
        line: "Want to help me make cookies today?",
        replyIfYes: "Yay! Let's put on our aprons.",
        replyIfNo: "That's okay, you can watch and keep me company."
      },
      {
        line: "Want to help me stir the cookie batter?",
        replyIfYes: "Wonderful! You're my best baking buddy.",
        replyIfNo: "That's okay, you can watch and smell the yummy batter."
      },
      {
        line: "Can you help me drop the dough onto the tray?",
        replyIfYes: "Perfect scoops! You're a great baker.",
        replyIfNo: "That's okay, I'll do this part."
      },
      {
        line: "Can you wait until the cookies cool down before eating one?",
        replyIfYes: "Good waiting! Warm cookies taste even better with a little patience.",
        replyIfNo: "Careful, they're hot — let's wait just a little bit together."
      }
    ]
  },
  {
    id: "fishing",
    title: "Fishing with Grandpa",
    askerId: "grandpa",
    beats: [
      {
        line: "Ready to go fishing at the pond today?",
        replyIfYes: "Let's grab our poles and head down there.",
        replyIfNo: "That's okay, we can just go for a walk instead."
      },
      {
        line: "Ready to cast your line into the pond?",
        replyIfYes: "Nice cast! Now we wait quietly for a nibble.",
        replyIfNo: "No rush, we can just watch the water for a while."
      },
      {
        line: "Can you stay quiet so we don't scare the fish?",
        replyIfYes: "Perfect! You're a natural fisherman.",
        replyIfNo: "Let's try our best whisper voices."
      },
      {
        line: "Should we pack up and head home now?",
        replyIfYes: "Good idea! We had a great day out here.",
        replyIfNo: "Okay, a little while longer then."
      }
    ]
  },
  {
    id: "grocery",
    title: "Grocery Store with Mom",
    askerId: "mom",
    beats: [
      {
        line: "Ready to help me shop for groceries today?",
        replyIfYes: "Great! Let's grab a cart and get started.",
        replyIfNo: "That's okay, you can just ride along in the cart."
      },
      {
        line: "Can you help me find the apples?",
        replyIfYes: "Great job spotting them! You're such a good helper.",
        replyIfNo: "That's okay, I'll show you where they are."
      },
      {
        line: "Can you help me put items on the checkout belt?",
        replyIfYes: "Thank you! You're such a good helper.",
        replyIfNo: "That's okay, I've got it."
      },
      {
        line: "Ready to put the groceries away when we get home?",
        replyIfYes: "Thank you! Teamwork makes it so quick.",
        replyIfNo: "Okay, we'll do it together in a little bit."
      }
    ]
  },
  {
    id: "blocks",
    title: "Building Blocks with Dad",
    askerId: "dad",
    beats: [
      {
        line: "Want to build a tower together?",
        replyIfYes: "Let's go! This is going to be the tallest one yet.",
        replyIfNo: "That's alright, maybe we build something else."
      },
      {
        line: "Can you hand me the blue blocks?",
        replyIfYes: "Thanks! You're a great building buddy.",
        replyIfNo: "That's okay, I'll grab them."
      },
      {
        line: "Ready to see how tall we can make it?",
        replyIfYes: "Let's go for it! Higher and higher.",
        replyIfNo: "That's okay, this height looks great too."
      },
      {
        line: "Can you help me clean up the blocks when we're done?",
        replyIfYes: "Thank you! You're such a great helper.",
        replyIfNo: "Okay, let's clean up together before bed."
      }
    ]
  }
];
