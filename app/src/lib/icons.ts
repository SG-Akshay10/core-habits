/**
 * Icon picker library (5.1). Uses a curated set of emoji so the app never
 * needs to bundle an icon font or fetch icons from a third-party API on
 * every render — they render instantly from the system font and work in
 * both light and dark mode with no extra contrast tuning needed.
 */
export const HABIT_ICONS = [
  { name: "flame", emoji: "🔥", keywords: ["fire", "streak", "hot"] },
  { name: "book", emoji: "📚", keywords: ["read", "study", "learn"] },
  { name: "water", emoji: "💧", keywords: ["drink", "hydrate", "water"] },
  { name: "run", emoji: "🏃", keywords: ["run", "cardio", "exercise"] },
  { name: "weight", emoji: "🏋️", keywords: ["gym", "lift", "strength"] },
  { name: "meditate", emoji: "🧘", keywords: ["yoga", "calm", "mindful"] },
  { name: "sleep", emoji: "😴", keywords: ["sleep", "rest", "bed"] },
  { name: "apple", emoji: "🍎", keywords: ["food", "diet", "eat", "healthy"] },
  { name: "salad", emoji: "🥗", keywords: ["food", "diet", "healthy"] },
  { name: "no-junk", emoji: "🍔", keywords: ["quit", "junk", "food"] },
  { name: "cigarette", emoji: "🚬", keywords: ["quit", "smoking"] },
  { name: "beer", emoji: "🍺", keywords: ["quit", "alcohol", "drink"] },
  { name: "money", emoji: "💰", keywords: ["save", "budget", "finance"] },
  { name: "pen", emoji: "✍️", keywords: ["write", "journal", "notes"] },
  { name: "guitar", emoji: "🎸", keywords: ["music", "practice", "instrument"] },
  { name: "paint", emoji: "🎨", keywords: ["art", "creative", "draw"] },
  { name: "code", emoji: "💻", keywords: ["code", "work", "programming"] },
  { name: "phone-off", emoji: "📵", keywords: ["quit", "phone", "screen"] },
  { name: "sun", emoji: "☀️", keywords: ["morning", "wake", "sun"] },
  { name: "moon", emoji: "🌙", keywords: ["night", "evening"] },
  { name: "heart", emoji: "❤️", keywords: ["health", "love", "self-care"] },
  { name: "brain", emoji: "🧠", keywords: ["learn", "mind", "study"] },
  { name: "tooth", emoji: "🦷", keywords: ["dental", "floss", "brush"] },
  { name: "plant", emoji: "🌱", keywords: ["grow", "garden", "habit"] },
  { name: "target", emoji: "🎯", keywords: ["goal", "focus", "aim"] },
  { name: "star", emoji: "⭐", keywords: ["favorite", "goal", "achieve"] },
  { name: "clock", emoji: "⏰", keywords: ["time", "schedule", "wake"] },
  { name: "bike", emoji: "🚴", keywords: ["cycle", "exercise", "cardio"] },
  { name: "swim", emoji: "🏊", keywords: ["swim", "exercise", "cardio"] },
  { name: "dog", emoji: "🐕", keywords: ["pet", "walk", "dog"] },
  { name: "broom", emoji: "🧹", keywords: ["clean", "chore", "tidy"] },
  { name: "call", emoji: "📞", keywords: ["call", "family", "connect"] },
] as const;

export type HabitIconName = (typeof HABIT_ICONS)[number]["name"];

const ICON_MAP = new Map<string, string>(
  HABIT_ICONS.map((i) => [i.name, i.emoji]),
);

export function isValidHabitIcon(value: string): value is HabitIconName {
  return ICON_MAP.has(value);
}

export function habitIconEmoji(name: string | null | undefined): string {
  if (!name) return "";
  return ICON_MAP.get(name) ?? "";
}
