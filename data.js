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
    accessory: "glasses"
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
  { spoken: "Do dogs say woof?", expected: "yes" },
  { spoken: "Do cats say meow?", expected: "yes" },
  { spoken: "Do fish swim in water?", expected: "yes" },
  { spoken: "Do birds have wings?", expected: "yes" },
  { spoken: "Can you clap your hands?", expected: "yes" },
  { spoken: "Do you sleep in a bed at night?", expected: "yes" },
  { spoken: "Do you wear shoes on your feet?", expected: "yes" },
  { spoken: "Is ice cream cold?", expected: "yes" },
  { spoken: "Does rain fall from the sky?", expected: "yes" },
  { spoken: "Do cars have wheels?", expected: "yes" },
  { spoken: "Do dogs say meow?", expected: "no" },
  { spoken: "Do you wear shoes on your hands?", expected: "no" },
  { spoken: "Do you sleep in the bathtub?", expected: "no" },
  { spoken: "Is ice cream hot?", expected: "no" },
  { spoken: "Do you brush your teeth with a spoon?", expected: "no" },
  { spoken: "Do cows drive cars?", expected: "no" },
  { spoken: "Do you eat cereal with your toes?", expected: "no" },
  { spoken: "Does a fish ride a bicycle?", expected: "no" },
  { spoken: "Do you put your pajamas on the dog?", expected: "no" },
  { spoken: "Is snow warm?", expected: "no" }
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
  { spoken: "You want a cookie. What do you say to ask for one?", expected: "please" },
  { spoken: "Grandma gives you a new toy. What do you say?", expected: "thankyou" },
  { spoken: "You want to color. What do you say to ask for crayons?", expected: "please" },
  { spoken: "Grandpa helps you tie your shoe. What do you say?", expected: "thankyou" },
  { spoken: "Ms. Rivera says, \"Thank you for helping!\" What do you say back?", expected: "welcome" },
  { spoken: "You want more milk. What do you say?", expected: "please" },
  { spoken: "Coach Sam gives you a high five. What do you say?", expected: "thankyou" },
  { spoken: "Your friend says \"thank you\" for sharing. What do you say back?", expected: "welcome" },
  { spoken: "You want a turn on the swing. What do you say to ask?", expected: "please" },
  { spoken: "Grandma tucks you in and kisses you goodnight. What do you say?", expected: "thankyou" },
  { spoken: "You want a snack. What do you say to ask?", expected: "please" },
  { spoken: "Someone holds the door open for you. What do you say?", expected: "thankyou" },
  { spoken: "Grandpa says, \"Thank you for cleaning up!\" What do you say back?", expected: "welcome" },
  { spoken: "You want help with your shoes. What do you say to ask?", expected: "please" }
];

const MAY_I_QUESTIONS = [
  { spoken: "You want to get down from the table. What do you say?", expected: "mayi" },
  { spoken: "You want to go outside and play. What do you say?", expected: "mayi" },
  { spoken: "You want a turn with your friend's toy. What do you say?", expected: "mayi" },
  { spoken: "You want a snack before dinner. What do you say?", expected: "mayi" },
  { spoken: "You want to sit in Grandpa's chair. What do you say?", expected: "mayi" },
  { spoken: "You want to watch a show. What do you say?", expected: "mayi" },
  { spoken: "You want to open the door. What do you say?", expected: "mayi" },
  { spoken: "You want to help set the table. What do you say?", expected: "mayi" },
  { spoken: "You want to use Grandma's crayons. What do you say?", expected: "mayi" },
  { spoken: "You want to feed the dog. What do you say?", expected: "mayi" }
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
    feedback: "Saying thank you shows you noticed the kindness!"
  },
  {
    spoken: "You know the answer and want to tell the teacher. What should you do?",
    answers: [
      { label: "Raise my hand quietly", hear: ["raise", "hand"] },
      { label: "Wait to be called on", hear: ["wait", "called on"] }
    ],
    distractor: "Shout the answer",
    feedback: "Raising your hand gives everyone a turn to talk!"
  },
  {
    spoken: "Oops! You bump into a friend's desk. What do you say?",
    answers: [
      { label: "Excuse me!", hear: ["excuse"] },
      { label: "I'm sorry!", hear: ["sorry"] }
    ],
    distractor: "Keep walking",
    feedback: "Saying sorry or excuse me shows you care about others!"
  },
  {
    spoken: "You can't zip your backpack. What do you say?",
    answers: [
      { label: "Can you help me, please?", hear: ["can you help", "help"] },
      { label: "May I have some help, please?", hear: ["may i"] }
    ],
    distractor: "Give up and say nothing",
    feedback: "Asking nicely for help is a big-kid skill!"
  },
  /* --- On the playground --- */
  {
    spoken: "Some kids are playing a fun game. You want to play too. What do you say?",
    answers: [
      { label: "Can I play too?", hear: ["can i play", "play too", "play with you"] },
      { label: "May I please play with you?", hear: ["may i"] }
    ],
    distractor: "Take the ball",
    feedback: "Asking to join is how you make new friends!"
  },
  {
    spoken: "Your friend falls down on the playground. What do you say?",
    answers: [
      { label: "Are you okay?", hear: ["ok", "alright", "all right", "hurt"] },
      { label: "Can I help you?", hear: ["help"] }
    ],
    distractor: "Keep playing",
    feedback: "Checking on a friend is so kind!"
  },
  {
    spoken: "Someone is on the swing you want. What do you say?",
    answers: [
      { label: "May I have a turn, please?", hear: ["turn"] },
      { label: "I'll wait for my turn", hear: ["wait"] }
    ],
    distractor: "Grab the swing",
    feedback: "Waiting and asking for turns keeps playtime fun for everyone!"
  },
  {
    spoken: "You win the race! What do you say to your friend?",
    answers: [
      { label: "Good game!", hear: ["good game", "good race", "good job"] },
      { label: "You did great too!", hear: ["great", "you did"] }
    ],
    distractor: "Say \"I'm the best!\"",
    feedback: "Being a kind winner makes everyone want to play again!"
  },
  /* --- With friends --- */
  {
    spoken: "Your friend shares their snack with you. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Just eat it",
    feedback: "Thank you makes sharing feel good!"
  },
  {
    spoken: "You and your friend both want the same toy. What do you say?",
    answers: [
      { label: "You can go first", hear: ["first"] },
      { label: "Can we take turns?", hear: ["turns", "share"] }
    ],
    distractor: "Grab it",
    feedback: "Taking turns means you both get to play!"
  },
  {
    spoken: "Your friend looks sad today. What do you say?",
    answers: [
      { label: "What's wrong?", hear: ["wrong", "sad"] },
      { label: "Do you want to play with me?", hear: ["play"] }
    ],
    distractor: "Walk away",
    feedback: "Noticing a sad friend is what good friends do!"
  },
  {
    spoken: "A friend says you can't play with them. What do you say?",
    answers: [
      { label: "That hurts my feelings", hear: ["feelings", "hurt"] },
      { label: "Okay, I'll play something else", hear: ["something else"] }
    ],
    distractor: "Yell at them",
    feedback: "Using your words — and telling a grown-up if it keeps happening — is just right."
  },
  /* --- Out and about --- */
  {
    spoken: "The waiter brings your food at a restaurant. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Start eating",
    feedback: "Thanking helpers makes their day brighter!"
  },
  {
    spoken: "You walk in front of someone at the store. What do you say?",
    answers: [
      { label: "Excuse me!", hear: ["excuse"] },
      { label: "I'm sorry!", hear: ["sorry"] }
    ],
    distractor: "Keep walking",
    feedback: "Excuse me is the polite way to pass by!"
  },
  {
    spoken: "Someone holds the door open for you. What do you say?",
    answers: [
      { label: "Thank you!", hear: ["thank"] }
    ],
    distractor: "Walk through quietly",
    feedback: "A thank you for holding the door — perfect manners!"
  },
  {
    spoken: "You finished your food but you're still hungry. What do you say?",
    answers: [
      { label: "May I have more, please?", hear: ["may i"] },
      { label: "Can I have more, please?", hear: ["more"] }
    ],
    distractor: "Bang the table",
    feedback: "Asking so nicely — of course you may!"
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
        line: "All done eating! Can you help clean up our table?",
        replyIfYes: "Thank you! What a great helper you are.",
        replyIfNo: "That's okay — let's do it together, it goes faster!"
      }
    ]
  }
];
