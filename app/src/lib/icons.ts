/**
 * Icon picker library (5.1). Uses lucide-react components (no emoji) so
 * icons render crisply at any size, inherit `currentColor`/explicit color
 * props, and look consistent across platforms, fonts and dark mode.
 */
import type { LucideIcon } from "lucide-react";
import {
  Flame,
  BookOpen,
  Droplet,
  Footprints,
  Dumbbell,
  Flower2,
  BedDouble,
  Apple,
  Salad,
  UtensilsCrossed,
  Cigarette,
  Beer,
  DollarSign,
  PenLine,
  Guitar,
  Palette,
  Code2,
  PhoneOff,
  Sun,
  Moon,
  Heart,
  Brain,
  Smile,
  Sprout,
  Target,
  Star,
  Clock,
  Bike,
  Waves,
  Dog,
  Brush,
  Phone,
} from "lucide-react";

export const HABIT_ICONS = [
  { name: "flame", icon: Flame, keywords: ["fire", "streak", "hot"] },
  { name: "book", icon: BookOpen, keywords: ["read", "study", "learn"] },
  { name: "water", icon: Droplet, keywords: ["drink", "hydrate", "water"] },
  { name: "run", icon: Footprints, keywords: ["run", "cardio", "exercise"] },
  { name: "weight", icon: Dumbbell, keywords: ["gym", "lift", "strength"] },
  { name: "meditate", icon: Flower2, keywords: ["yoga", "calm", "mindful"] },
  { name: "sleep", icon: BedDouble, keywords: ["sleep", "rest", "bed"] },
  { name: "apple", icon: Apple, keywords: ["food", "diet", "eat", "healthy"] },
  { name: "salad", icon: Salad, keywords: ["food", "diet", "healthy"] },
  { name: "no-junk", icon: UtensilsCrossed, keywords: ["quit", "junk", "food"] },
  { name: "cigarette", icon: Cigarette, keywords: ["quit", "smoking"] },
  { name: "beer", icon: Beer, keywords: ["quit", "alcohol", "drink"] },
  { name: "money", icon: DollarSign, keywords: ["save", "budget", "finance"] },
  { name: "pen", icon: PenLine, keywords: ["write", "journal", "notes"] },
  { name: "guitar", icon: Guitar, keywords: ["music", "practice", "instrument"] },
  { name: "paint", icon: Palette, keywords: ["art", "creative", "draw"] },
  { name: "code", icon: Code2, keywords: ["code", "work", "programming"] },
  { name: "phone-off", icon: PhoneOff, keywords: ["quit", "phone", "screen"] },
  { name: "sun", icon: Sun, keywords: ["morning", "wake", "sun"] },
  { name: "moon", icon: Moon, keywords: ["night", "evening"] },
  { name: "heart", icon: Heart, keywords: ["health", "love", "self-care"] },
  { name: "brain", icon: Brain, keywords: ["learn", "mind", "study"] },
  { name: "tooth", icon: Smile, keywords: ["dental", "floss", "brush"] },
  { name: "plant", icon: Sprout, keywords: ["grow", "garden", "habit"] },
  { name: "target", icon: Target, keywords: ["goal", "focus", "aim"] },
  { name: "star", icon: Star, keywords: ["favorite", "goal", "achieve"] },
  { name: "clock", icon: Clock, keywords: ["time", "schedule", "wake"] },
  { name: "bike", icon: Bike, keywords: ["cycle", "exercise", "cardio"] },
  { name: "swim", icon: Waves, keywords: ["swim", "exercise", "cardio"] },
  { name: "dog", icon: Dog, keywords: ["pet", "walk", "dog"] },
  { name: "broom", icon: Brush, keywords: ["clean", "chore", "tidy"] },
  { name: "call", icon: Phone, keywords: ["call", "family", "connect"] },
] as const;

export type HabitIconName = (typeof HABIT_ICONS)[number]["name"];

const ICON_MAP = new Map<string, LucideIcon>(
  HABIT_ICONS.map((i) => [i.name, i.icon]),
);

export function isValidHabitIcon(value: string): value is HabitIconName {
  return ICON_MAP.has(value);
}

/** Looks up the lucide icon component for a stored habit icon name. */
export function getHabitIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP.get(name) ?? null;
}
