export interface QuizOption {
  letter: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
  correct: string;
  funFact: string;
  funFactEmoji: string;
  correctExplanation?: string;
  type: "multiple" | "truefalse";
}

export interface Quiz {
  id: string;
  title: string;
  emoji: string;
  badge: string;
  description: string;
  keywords: string[];
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    id: "egyptian-gods",
    title: "Egyptian Gods",
    emoji: "🐪",
    badge: "5 MIN QUIZZ",
    description: "Test your knowledge and discover powerful myths in just a few minutes.",
    keywords: ["egypt", "egyptian", "history", "mythology", "myth", "ancient", "gods", "pharaoh", "hieroglyph", "pyramids"],
    questions: [
      {
        id: 1, type: "multiple",
        text: "WHO IS THE GOD OF THE AFTERLIFE?",
        options: [{ letter: "A", text: "Anubis" }, { letter: "B", text: "Ra" }, { letter: "C", text: "Horus" }, { letter: "D", text: "Osiris" }],
        correct: "A", funFactEmoji: "⚖️",
        funFact: "Ancient Egyptians believed Anubis weighed your heart to judge your soul.",
      },
      {
        id: 2, type: "multiple",
        text: "WHICH GOD HAS THE HEAD OF A FALCON?",
        options: [{ letter: "A", text: "Seth" }, { letter: "B", text: "Horus" }, { letter: "C", text: "Thoth" }, { letter: "D", text: "Osiris" }],
        correct: "B", funFactEmoji: "🦅",
        funFact: 'The "Eye of Horus" was used as a symbol of protection and healing.',
      },
      {
        id: 3, type: "multiple",
        text: "WHO IS THE EGYPTIAN GOD OF THE SUN?",
        options: [{ letter: "A", text: "Osiris" }, { letter: "B", text: "Seth" }, { letter: "C", text: "Ra" }, { letter: "D", text: "Thoth" }],
        correct: "C", funFactEmoji: "☀️",
        funFact: "Ra was believed to travel through the underworld each night to rise again at dawn.",
      },
      {
        id: 4, type: "multiple",
        text: "WHICH GODDESS REPRESENTS LOVE AND BEAUTY?",
        options: [{ letter: "A", text: "Isis" }, { letter: "B", text: "Hathor" }, { letter: "C", text: "Nut" }, { letter: "D", text: "Sekhmet" }],
        correct: "B", funFactEmoji: "🐄",
        funFact: "Hathor was often shown as a cow or woman with cow horns holding a sun disk.",
      },
      {
        id: 5, type: "multiple",
        text: "WHO IS THE GOD OF WISDOM AND WRITING?",
        options: [{ letter: "A", text: "Thoth" }, { letter: "B", text: "Seth" }, { letter: "C", text: "Geb" }, { letter: "D", text: "Shu" }],
        correct: "A", funFactEmoji: "📜",
        funFact: "Thoth was believed to have invented hieroglyphics and recorded the judgment of souls.",
      },
      {
        id: 6, type: "multiple",
        text: "WHICH GODDESS IS THE MOTHER OF HORUS?",
        options: [{ letter: "A", text: "Hathor" }, { letter: "B", text: "Nut" }, { letter: "C", text: "Sekhmet" }, { letter: "D", text: "Isis" }],
        correct: "D", funFactEmoji: "✨",
        funFact: "Isis was one of the most powerful goddesses and a master of magic.",
      },
      {
        id: 7, type: "multiple",
        text: "WHICH GOD REPRESENTS CHAOS AND STORMS?",
        options: [{ letter: "A", text: "Seth" }, { letter: "B", text: "Geb" }, { letter: "C", text: "Shu" }, { letter: "D", text: "Nut" }],
        correct: "A", funFactEmoji: "⚡",
        funFact: "Despite chaos, Seth protected Ra's solar boat from the serpent Apep every night.",
      },
      {
        id: 8, type: "multiple",
        text: "WHAT DID ANCIENT EGYPTIANS CALL THEIR SACRED SCRIPT?",
        options: [{ letter: "A", text: "Sanskrit" }, { letter: "B", text: "Runes" }, { letter: "C", text: "Hieroglyphics" }, { letter: "D", text: "Cuneiform" }],
        correct: "C", funFactEmoji: "🏛️",
        funFact: "Egyptians carved hieroglyphics on temple walls, monuments, and papyrus scrolls.",
      },
      {
        id: 9, type: "multiple",
        text: "WHICH ANIMAL WAS SACRED TO THE GODDESS BASTET?",
        options: [{ letter: "A", text: "Dog" }, { letter: "B", text: "Cat" }, { letter: "C", text: "Crocodile" }, { letter: "D", text: "Snake" }],
        correct: "B", funFactEmoji: "🐈",
        funFact: "Millions of cats were mummified as offerings to Bastet, goddess of home and fertility.",
      },
      {
        id: 10, type: "truefalse",
        text: "RA TRAVELED ACROSS THE SKY IN A BOAT?",
        options: [{ letter: "A", text: "True" }, { letter: "B", text: "False" }],
        correct: "A", funFactEmoji: "🌙",
        funFact: "At night, Egyptians believed Ra traveled through the underworld to rise again.",
        correctExplanation: "It's true. Ra sailed across the sky in a solar boat.",
      },
    ],
  },
  {
    id: "space-exploration",
    title: "Space Exploration",
    emoji: "🚀",
    badge: "5 MIN QUIZZ",
    description: "Blast off through the cosmos and test your knowledge of the universe!",
    keywords: ["space", "astronomy", "planet", "star", "galaxy", "universe", "nasa", "rocket", "moon", "cosmos", "astro", "physics", "science"],
    questions: [
      { id: 1, type: "multiple", text: "WHO WAS THE FIRST HUMAN TO WALK ON THE MOON?", options: [{ letter: "A", text: "Neil Armstrong" }, { letter: "B", text: "Buzz Aldrin" }, { letter: "C", text: "Yuri Gagarin" }, { letter: "D", text: "John Glenn" }], correct: "A", funFactEmoji: "👣", funFact: "Neil Armstrong said: 'One small step for man, one giant leap for mankind' on July 20, 1969." },
      { id: 2, type: "multiple", text: "WHAT IS THE LARGEST PLANET IN OUR SOLAR SYSTEM?", options: [{ letter: "A", text: "Saturn" }, { letter: "B", text: "Neptune" }, { letter: "C", text: "Jupiter" }, { letter: "D", text: "Uranus" }], correct: "C", funFactEmoji: "🌀", funFact: "Jupiter is so large that all other planets in the solar system could fit inside it!" },
      { id: 3, type: "multiple", text: "HOW LONG DOES SUNLIGHT TAKE TO REACH EARTH?", options: [{ letter: "A", text: "1 second" }, { letter: "B", text: "8 minutes" }, { letter: "C", text: "1 hour" }, { letter: "D", text: "1 day" }], correct: "B", funFactEmoji: "☀️", funFact: "Light travels at 300,000 km/s, but the Sun is 150 million km away from Earth." },
      { id: 4, type: "multiple", text: "WHICH PLANET IS KNOWN AS THE RED PLANET?", options: [{ letter: "A", text: "Jupiter" }, { letter: "B", text: "Venus" }, { letter: "C", text: "Mars" }, { letter: "D", text: "Mercury" }], correct: "C", funFactEmoji: "🔴", funFact: "Mars gets its red color from iron oxide (rust) covering its surface." },
      { id: 5, type: "multiple", text: "WHAT IS THE HOTTEST PLANET IN OUR SOLAR SYSTEM?", options: [{ letter: "A", text: "Mercury" }, { letter: "B", text: "Venus" }, { letter: "C", text: "Mars" }, { letter: "D", text: "Jupiter" }], correct: "B", funFactEmoji: "🔥", funFact: "Venus reaches 465°C due to its thick CO₂ atmosphere — even hotter than Mercury!" },
      { id: 6, type: "multiple", text: "WHAT YEAR WAS THE FIRST HUMAN SENT INTO SPACE?", options: [{ letter: "A", text: "1955" }, { letter: "B", text: "1957" }, { letter: "C", text: "1961" }, { letter: "D", text: "1969" }], correct: "C", funFactEmoji: "🛸", funFact: "Yuri Gagarin orbited Earth once in 108 minutes aboard Vostok 1 on April 12, 1961." },
      { id: 7, type: "multiple", text: "WHAT IS THE NAME OF THE FIRST ARTIFICIAL SATELLITE?", options: [{ letter: "A", text: "Explorer 1" }, { letter: "B", text: "Vostok 1" }, { letter: "C", text: "Sputnik 1" }, { letter: "D", text: "Apollo 11" }], correct: "C", funFactEmoji: "📡", funFact: "Sputnik 1 was launched by the Soviet Union on October 4, 1957, starting the Space Age." },
      { id: 8, type: "multiple", text: "HOW MANY MOONS DOES MARS HAVE?", options: [{ letter: "A", text: "0" }, { letter: "B", text: "1" }, { letter: "C", text: "2" }, { letter: "D", text: "4" }], correct: "C", funFactEmoji: "🌑", funFact: "Mars has two small moons: Phobos and Deimos, named after the Greek gods of fear and dread." },
      { id: 9, type: "multiple", text: "WHAT IS A LIGHT-YEAR?", options: [{ letter: "A", text: "A unit of time" }, { letter: "B", text: "A unit of distance" }, { letter: "C", text: "A unit of brightness" }, { letter: "D", text: "A type of star" }], correct: "B", funFactEmoji: "💫", funFact: "A light-year is about 9.46 trillion kilometers — the distance light travels in one year." },
      { id: 10, type: "truefalse", text: "PLUTO IS STILL CLASSIFIED AS A PLANET?", options: [{ letter: "A", text: "True" }, { letter: "B", text: "False" }], correct: "B", funFactEmoji: "🔭", funFact: "Pluto was reclassified as a 'dwarf planet' by the IAU in 2006.", correctExplanation: "Pluto was reclassified as a dwarf planet in 2006." },
    ],
  },
  {
    id: "animals-wild",
    title: "Animals of the Wild",
    emoji: "🦁",
    badge: "5 MIN QUIZZ",
    description: "From the deep oceans to the jungle — how well do you know Earth's creatures?",
    keywords: ["animal", "wildlife", "nature", "biology", "zoology", "pet", "lion", "tiger", "bird", "sea", "ocean", "forest", "creatures", "insects", "reptile", "pokemon"],
    questions: [
      { id: 1, type: "multiple", text: "HOW MANY HEARTS DOES AN OCTOPUS HAVE?", options: [{ letter: "A", text: "1" }, { letter: "B", text: "2" }, { letter: "C", text: "3" }, { letter: "D", text: "4" }], correct: "C", funFactEmoji: "🐙", funFact: "An octopus has three hearts: two pump blood to the gills, one to the rest of the body." },
      { id: 2, type: "multiple", text: "WHICH IS THE FASTEST LAND ANIMAL?", options: [{ letter: "A", text: "Lion" }, { letter: "B", text: "Cheetah" }, { letter: "C", text: "Leopard" }, { letter: "D", text: "Greyhound" }], correct: "B", funFactEmoji: "💨", funFact: "A cheetah can accelerate from 0 to 100 km/h in just 3 seconds — faster than most sports cars!" },
      { id: 3, type: "multiple", text: "WHAT DO YOU CALL A GROUP OF LIONS?", options: [{ letter: "A", text: "Pack" }, { letter: "B", text: "Herd" }, { letter: "C", text: "Pride" }, { letter: "D", text: "Flock" }], correct: "C", funFactEmoji: "🦁", funFact: "A pride can have 3–30 lions. Females do most of the hunting while males protect the territory." },
      { id: 4, type: "multiple", text: "WHICH MAMMAL IS CAPABLE OF TRUE FLIGHT?", options: [{ letter: "A", text: "Flying squirrel" }, { letter: "B", text: "Bat" }, { letter: "C", text: "Flying fish" }, { letter: "D", text: "Sugar glider" }], correct: "B", funFactEmoji: "🦇", funFact: "Bats are the only mammals capable of sustained true flight — and they use echolocation to navigate!" },
      { id: 5, type: "multiple", text: "HOW LONG CAN A SNAIL SLEEP?", options: [{ letter: "A", text: "1 day" }, { letter: "B", text: "1 week" }, { letter: "C", text: "3 years" }, { letter: "D", text: "1 month" }], correct: "C", funFactEmoji: "🐌", funFact: "Snails can hibernate for up to 3 years, sealing themselves with mucus to survive drought." },
      { id: 6, type: "multiple", text: "WHICH ANIMAL HAS THE LONGEST RECORDED LIFESPAN?", options: [{ letter: "A", text: "Tortoise" }, { letter: "B", text: "Bowhead Whale" }, { letter: "C", text: "Greenland Shark" }, { letter: "D", text: "Elephant" }], correct: "C", funFactEmoji: "🦈", funFact: "Greenland sharks can live over 400 years — some alive today were born before the Industrial Revolution!" },
      { id: 7, type: "multiple", text: "HOW DO PENGUINS USE THEIR WINGS?", options: [{ letter: "A", text: "To fly short distances" }, { letter: "B", text: "To glide on air" }, { letter: "C", text: "To swim underwater" }, { letter: "D", text: "To attract mates" }], correct: "C", funFactEmoji: "🐧", funFact: "Penguins' wings evolved into flippers — they 'fly' through water at up to 25 km/h!" },
      { id: 8, type: "multiple", text: "WHAT IS THE LARGEST ANIMAL EVER TO HAVE LIVED?", options: [{ letter: "A", text: "African Elephant" }, { letter: "B", text: "T-Rex" }, { letter: "C", text: "Blue Whale" }, { letter: "D", text: "Giant Squid" }], correct: "C", funFactEmoji: "🐋", funFact: "A blue whale's heart is the size of a small car, and its call can be heard 800 km away." },
      { id: 9, type: "multiple", text: "WHICH ANIMAL SLEEPS STANDING UP?", options: [{ letter: "A", text: "Cat" }, { letter: "B", text: "Horse" }, { letter: "C", text: "Bear" }, { letter: "D", text: "Crocodile" }], correct: "B", funFactEmoji: "🐴", funFact: "Horses can lock their legs to rest standing, though they still need to lie down for deep sleep." },
      { id: 10, type: "truefalse", text: "BATS ARE COMPLETELY BLIND?", options: [{ letter: "A", text: "True" }, { letter: "B", text: "False" }], correct: "B", funFactEmoji: "👁️", funFact: "Bats have small but functional eyes. They use echolocation as a superpower — not because they're blind!", correctExplanation: "False! Bats can see — they also use echolocation to hunt in the dark." },
    ],
  },
  {
    id: "science-wonders",
    title: "Science Wonders",
    emoji: "🔬",
    badge: "5 MIN QUIZZ",
    description: "From atoms to discoveries — explore the wonders of the scientific world!",
    keywords: ["science", "chemistry", "physics", "biology", "math", "engineering", "experiment", "lab", "molecule", "atom", "energy", "gravity", "electricity"],
    questions: [
      { id: 1, type: "multiple", text: "WHAT IS THE CHEMICAL SYMBOL FOR GOLD?", options: [{ letter: "A", text: "Go" }, { letter: "B", text: "Gd" }, { letter: "C", text: "Au" }, { letter: "D", text: "Ag" }], correct: "C", funFactEmoji: "⚗️", funFact: "Au comes from 'Aurum', the Latin word for gold. Gold has been used as currency for 6,000 years." },
      { id: 2, type: "multiple", text: "WHAT IS THE HARDEST NATURAL SUBSTANCE?", options: [{ letter: "A", text: "Quartz" }, { letter: "B", text: "Diamond" }, { letter: "C", text: "Sapphire" }, { letter: "D", text: "Ruby" }], correct: "B", funFactEmoji: "💎", funFact: "Diamond scores 10 on the Mohs scale. It's so hard, only another diamond can scratch it." },
      { id: 3, type: "multiple", text: "HOW MANY BONES DOES AN ADULT HUMAN HAVE?", options: [{ letter: "A", text: "186" }, { letter: "B", text: "206" }, { letter: "C", text: "226" }, { letter: "D", text: "246" }], correct: "B", funFactEmoji: "🦴", funFact: "Babies are born with about 270 bones, which fuse together as they grow into 206 adult bones." },
      { id: 4, type: "multiple", text: "WHAT IS THE MOST ABUNDANT GAS IN EARTH'S ATMOSPHERE?", options: [{ letter: "A", text: "Oxygen" }, { letter: "B", text: "Carbon dioxide" }, { letter: "C", text: "Nitrogen" }, { letter: "D", text: "Hydrogen" }], correct: "C", funFactEmoji: "💨", funFact: "Nitrogen makes up 78% of air. Oxygen is only 21% — enough for life, not too much to catch fire." },
      { id: 5, type: "multiple", text: "WHO INVENTED THE TELEPHONE?", options: [{ letter: "A", text: "Thomas Edison" }, { letter: "B", text: "Nikola Tesla" }, { letter: "C", text: "Alexander Graham Bell" }, { letter: "D", text: "Guglielmo Marconi" }], correct: "C", funFactEmoji: "📞", funFact: "Bell's first telephone call in 1876 said: 'Mr Watson, come here — I want to see you.'" },
      { id: 6, type: "multiple", text: "HOW MANY COLORS ARE IN A RAINBOW?", options: [{ letter: "A", text: "5" }, { letter: "B", text: "6" }, { letter: "C", text: "7" }, { letter: "D", text: "8" }], correct: "C", funFactEmoji: "🌈", funFact: "ROYGBIV: Red, Orange, Yellow, Green, Blue, Indigo, Violet. Isaac Newton identified these 7 colors." },
      { id: 7, type: "multiple", text: "WHAT DOES DNA STAND FOR?", options: [{ letter: "A", text: "Digital Nucleic Acid" }, { letter: "B", text: "Deoxyribonucleic Acid" }, { letter: "C", text: "Dynamic Neural Array" }, { letter: "D", text: "Dual Nitrogen Acid" }], correct: "B", funFactEmoji: "🧬", funFact: "Every human cell contains about 2 meters of DNA — your body holds enough to reach the Sun and back 300 times!" },
      { id: 8, type: "multiple", text: "WHICH PLANET IS SMALLEST IN OUR SOLAR SYSTEM?", options: [{ letter: "A", text: "Mars" }, { letter: "B", text: "Mercury" }, { letter: "C", text: "Venus" }, { letter: "D", text: "Pluto" }], correct: "B", funFactEmoji: "🔭", funFact: "Mercury is only slightly larger than Earth's Moon and has no atmosphere to protect it from craters." },
      { id: 9, type: "multiple", text: "WHAT IS THE SPEED OF SOUND IN AIR?", options: [{ letter: "A", text: "343 m/s" }, { letter: "B", text: "143 m/s" }, { letter: "C", text: "743 m/s" }, { letter: "D", text: "1,000 m/s" }], correct: "A", funFactEmoji: "🔊", funFact: "Sound travels faster through water (1,480 m/s) and even faster through steel (5,120 m/s)." },
      { id: 10, type: "truefalse", text: "LIGHTNING NEVER STRIKES THE SAME PLACE TWICE?", options: [{ letter: "A", text: "True" }, { letter: "B", text: "False" }], correct: "B", funFactEmoji: "⚡", funFact: "The Empire State Building is struck by lightning about 23 times per year — definitely a myth!", correctExplanation: "False! Lightning regularly strikes the same place twice — or even dozens of times." },
    ],
  },
  {
    id: "music-history",
    title: "Music History",
    emoji: "🎵",
    badge: "5 MIN QUIZZ",
    description: "From Beethoven to rock legends — how well do you know the world of music?",
    keywords: ["music", "song", "band", "guitar", "piano", "instrument", "melody", "beat", "rhythm", "concert", "pop", "rock", "jazz", "classical", "lyrics", "singer", "artist"],
    questions: [
      { id: 1, type: "multiple", text: "WHICH BAND WROTE 'BOHEMIAN RHAPSODY'?", options: [{ letter: "A", text: "The Beatles" }, { letter: "B", text: "Led Zeppelin" }, { letter: "C", text: "Queen" }, { letter: "D", text: "Pink Floyd" }], correct: "C", funFactEmoji: "🎤", funFact: "Freddie Mercury wrote Bohemian Rhapsody in 1975. It has no chorus and lasts almost 6 minutes — record execs hated it!" },
      { id: 2, type: "multiple", text: "HOW MANY STRINGS DOES A STANDARD GUITAR HAVE?", options: [{ letter: "A", text: "4" }, { letter: "B", text: "5" }, { letter: "C", text: "6" }, { letter: "D", text: "7" }], correct: "C", funFactEmoji: "🎸", funFact: "The 6 standard tunings are E-A-D-G-B-E. Bass guitars have 4 strings, and some guitars have 7 or 12!" },
      { id: 3, type: "multiple", text: "WHICH INSTRUMENT HAS 88 KEYS?", options: [{ letter: "A", text: "Organ" }, { letter: "B", text: "Piano" }, { letter: "C", text: "Accordion" }, { letter: "D", text: "Harpsichord" }], correct: "B", funFactEmoji: "🎹", funFact: "A standard piano has 88 keys: 52 white and 36 black. Steinway built the first 88-key piano in 1880." },
      { id: 4, type: "multiple", text: "WHO IS KNOWN AS THE 'KING OF POP'?", options: [{ letter: "A", text: "Elvis Presley" }, { letter: "B", text: "Michael Jackson" }, { letter: "C", text: "Prince" }, { letter: "D", text: "David Bowie" }], correct: "B", funFactEmoji: "🕺", funFact: "Michael Jackson invented the moonwalk in 1983. His 'Thriller' album sold over 66 million copies worldwide." },
      { id: 5, type: "multiple", text: "IN WHICH DECADE WAS ROCK AND ROLL BORN?", options: [{ letter: "A", text: "1940s" }, { letter: "B", text: "1950s" }, { letter: "C", text: "1960s" }, { letter: "D", text: "1970s" }], correct: "B", funFactEmoji: "🎼", funFact: "Rock and roll emerged from a blend of blues, gospel, and country music in the early 1950s in the USA." },
      { id: 6, type: "multiple", text: "WHAT DOES BPM STAND FOR IN MUSIC?", options: [{ letter: "A", text: "Beats Per Minute" }, { letter: "B", text: "Bass Per Measure" }, { letter: "C", text: "Bars Per Movement" }, { letter: "D", text: "Basic Pattern Mode" }], correct: "A", funFactEmoji: "🥁", funFact: "Most pop songs sit between 100–130 BPM. 'Happy Birthday' is about 90 BPM — and you've sung it thousands of times!" },
      { id: 7, type: "multiple", text: "WHICH COUNTRY WAS BEETHOVEN FROM?", options: [{ letter: "A", text: "Austria" }, { letter: "B", text: "France" }, { letter: "C", text: "Germany" }, { letter: "D", text: "England" }], correct: "C", funFactEmoji: "🎻", funFact: "Beethoven was born in Bonn, Germany in 1770. He composed his 9th Symphony while almost completely deaf." },
      { id: 8, type: "multiple", text: "HOW MANY MUSICIANS PLAY IN A QUARTET?", options: [{ letter: "A", text: "3" }, { letter: "B", text: "4" }, { letter: "C", text: "5" }, { letter: "D", text: "6" }], correct: "B", funFactEmoji: "🎶", funFact: "A string quartet typically has two violins, a viola, and a cello. Beethoven wrote 16 famous string quartets." },
      { id: 9, type: "multiple", text: "WHICH INSTRUMENT DID JIMI HENDRIX PLAY?", options: [{ letter: "A", text: "Drums" }, { letter: "B", text: "Bass Guitar" }, { letter: "C", text: "Electric Guitar" }, { letter: "D", text: "Keyboard" }], correct: "C", funFactEmoji: "🔥", funFact: "Jimi Hendrix was left-handed but played a right-handed guitar flipped upside down — and still revolutionized music!" },
      { id: 10, type: "truefalse", text: "MOZART WROTE HIS FIRST SYMPHONY AT AGE 8?", options: [{ letter: "A", text: "True" }, { letter: "B", text: "False" }], correct: "A", funFactEmoji: "👶", funFact: "Mozart started composing at age 5 and performed for European royalty as a child.", correctExplanation: "True! Mozart was a child prodigy who wrote his first symphony at just 8 years old." },
    ],
  },
];

export function getQuizById(id: string): Quiz | undefined {
  if (id === "generated") return getGeneratedQuiz() ?? undefined;
  return quizzes.find((q) => q.id === id);
}

const USER_NAME_KEY = "userName";

export function getUserName(): string {
  return localStorage.getItem(USER_NAME_KEY) ?? "";
}

export function saveUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name.trim());
}

const SUBJECTS_KEY = "userSubjects";
const SUBJECT_INDEX_KEY = "userSubjectIndex";
const GENERATED_QUIZ_KEY = "generatedQuiz";
const GENERATED_QUIZ_SUBJECTS_KEY = "generatedQuizSubjectsKey";

export function getCurrentSubject(): string | null {
  const subjects = getUserSubjects();
  if (subjects.length === 0) return null;
  const raw = localStorage.getItem(SUBJECT_INDEX_KEY);
  const idx = raw ? parseInt(raw, 10) || 0 : 0;
  return subjects[idx % subjects.length];
}

export function advanceToNextSubject(): void {
  const subjects = getUserSubjects();
  if (subjects.length === 0) return;
  const raw = localStorage.getItem(SUBJECT_INDEX_KEY);
  const idx = raw ? parseInt(raw, 10) || 0 : 0;
  const next = (idx + 1) % subjects.length;
  localStorage.setItem(SUBJECT_INDEX_KEY, String(next));
  localStorage.removeItem(GENERATED_QUIZ_KEY);
  localStorage.removeItem(GENERATED_QUIZ_SUBJECTS_KEY);
}

export function resetSubjectRotation(): void {
  localStorage.setItem(SUBJECT_INDEX_KEY, "0");
}

if (typeof window !== "undefined") {
  const MIGRATION_FLAG = "generatedQuizMigratedV2";
  if (!localStorage.getItem(MIGRATION_FLAG)) {
    localStorage.removeItem(GENERATED_QUIZ_KEY);
    localStorage.removeItem(GENERATED_QUIZ_SUBJECTS_KEY);
    localStorage.setItem(MIGRATION_FLAG, "1");
  }
}

export function saveUserSubjects(subjects: string[]): void {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects.filter((s) => s.trim())));
}

export function getUserSubjects(): string[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveGeneratedQuiz(quiz: Quiz): void {
  const subjects = getUserSubjects();
  localStorage.setItem(GENERATED_QUIZ_KEY, JSON.stringify(quiz));
  localStorage.setItem(GENERATED_QUIZ_SUBJECTS_KEY, JSON.stringify(subjects));
}

export function getGeneratedQuiz(): Quiz | null {
  try {
    const raw = localStorage.getItem(GENERATED_QUIZ_KEY);
    if (!raw) return null;
    const quiz = JSON.parse(raw) as Quiz;
    const currentSubjects = getUserSubjects();
    const cachedSubjectsRaw = localStorage.getItem(GENERATED_QUIZ_SUBJECTS_KEY);
    const cachedSubjects = cachedSubjectsRaw ? (JSON.parse(cachedSubjectsRaw) as string[]) : [];
    if (JSON.stringify(currentSubjects) !== JSON.stringify(cachedSubjects)) return null;
    return quiz;
  } catch {
    return null;
  }
}

export function clearGeneratedQuiz(): void {
  localStorage.removeItem(GENERATED_QUIZ_KEY);
  localStorage.removeItem(GENERATED_QUIZ_SUBJECTS_KEY);
}

export async function generateQuizFromSubjects(subjects: string[]): Promise<Quiz | null> {
  try {
    const res = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects }),
    });
    if (!res.ok) return null;
    const quiz = (await res.json()) as Quiz;
    if (!quiz.questions || quiz.questions.length < 5) return null;
    saveGeneratedQuiz(quiz);
    return quiz;
  } catch {
    return null;
  }
}

export function getQuizForSubjects(subjects: string[]): Quiz {
  if (subjects.length === 0) return quizzes[0];
  const normalized = subjects.map((s) => s.toLowerCase().trim());
  let bestQuiz = quizzes[0];
  let bestScore = 0;
  for (const quiz of quizzes) {
    let score = 0;
    for (const subject of normalized) {
      for (const keyword of quiz.keywords) {
        if (subject.includes(keyword) || keyword.includes(subject)) score += 2;
        else if (subject.split(" ").some((w) => keyword.includes(w) || w.includes(keyword))) score += 1;
      }
    }
    if (score > bestScore) { bestScore = score; bestQuiz = quiz; }
  }
  return bestQuiz;
}
