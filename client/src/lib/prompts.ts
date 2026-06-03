export interface Prompt {
  word: string;
  category: string;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: "animals", label: "Animals", emoji: "🐘" },
  { id: "fantasy", label: "Fantasy", emoji: "🐉" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "places", label: "Places", emoji: "🏡" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "transport", label: "Transport", emoji: "🚲" },
  { id: "technology", label: "Technology", emoji: "🤖" },
  { id: "adventure", label: "Adventure", emoji: "⚔️" },
];

export const PROMPTS: Prompt[] = [
  { word: "Elephant", category: "animals" },
  { word: "Penguin", category: "animals" },
  { word: "Giraffe", category: "animals" },
  { word: "Octopus", category: "animals" },
  { word: "Flamingo", category: "animals" },
  { word: "Dragon", category: "fantasy" },
  { word: "Wizard", category: "fantasy" },
  { word: "Spaceship", category: "space" },
  { word: "Astronaut", category: "space" },
  { word: "Black hole", category: "space" },
  { word: "Lighthouse", category: "places" },
  { word: "Treehouse", category: "places" },
  { word: "Volcano", category: "nature" },
  { word: "Rainbow", category: "nature" },
  { word: "Tornado", category: "nature" },
  { word: "Pizza", category: "food" },
  { word: "Sushi", category: "food" },
  { word: "Cupcake", category: "food" },
  { word: "Bicycle", category: "transport" },
  { word: "Hot air balloon", category: "transport" },
  { word: "Submarine", category: "transport" },
  { word: "Robot", category: "technology" },
  { word: "Cactus", category: "nature" },
  { word: "Treasure chest", category: "adventure" },
  { word: "Mushroom", category: "nature" },
  { word: "Sunflower", category: "nature" },
  { word: "Ghost", category: "fantasy" },
  { word: "Campfire", category: "adventure" },
];

const STORAGE_KEY = "sketchPrompt";
const PREFERRED_CATEGORIES_KEY = "preferredDrawingCategories";

export function savePreferredCategories(categoryIds: string[]): void {
  localStorage.setItem(PREFERRED_CATEGORIES_KEY, JSON.stringify(categoryIds));
}

export function getPreferredCategories(): string[] {
  const raw = localStorage.getItem(PREFERRED_CATEGORIES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pickAndStorePrompt(): Prompt {
  const preferred = getPreferredCategories();
  const pool =
    preferred.length > 0
      ? PROMPTS.filter((p) => preferred.includes(p.category))
      : PROMPTS;

  const source = pool.length > 0 ? pool : PROMPTS;
  const idx = Math.floor(Math.random() * source.length);
  const prompt = source[idx];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompt));
  return prompt;
}

export function getStoredPrompt(): Prompt | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Prompt;
  } catch {
    return null;
  }
}
