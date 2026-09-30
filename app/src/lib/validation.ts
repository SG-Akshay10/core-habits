import { z } from "zod";
import { HABIT_COLORS } from "@/lib/colors";
import { HABIT_ICONS } from "@/lib/icons";
import { isValidDateString } from "@/lib/date";

const HABIT_ICON_NAMES = HABIT_ICONS.map((i) => i.name) as [
  string,
  ...string[],
];

export const habitNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(60, "Name must be 60 characters or fewer");

export const habitColorSchema = z.enum(
  HABIT_COLORS as unknown as [string, ...string[]],
  { message: "Invalid color" },
);

export const habitIconSchema = z.enum(HABIT_ICON_NAMES, {
  message: "Invalid icon",
}).nullable();

export const habitTypeSchema = z.enum(["build", "quit"], {
  message: "Invalid habit type",
});

export const habitDescriptionSchema = z
  .string()
  .trim()
  .max(280, "Description must be 280 characters or fewer");

export const goalTypeSchema = z.enum(["daily", "weekly", "monthly"], {
  message: "Invalid goal type",
});

export const goalCountSchema = z
  .number()
  .int()
  .min(1, "Goal must be at least 1")
  .max(31, "Goal must be 31 or fewer");

export const isNumericSchema = z.boolean();

export const targetCountSchema = z
  .number()
  .int()
  .min(1, "Target must be at least 1")
  .max(1000, "Target must be 1000 or fewer");

export const unitLabelSchema = z
  .string()
  .trim()
  .max(20, "Unit must be 20 characters or fewer");

export const logNoteSchema = z
  .string()
  .trim()
  .max(280, "Note must be 280 characters or fewer");

export const logValueSchema = z
  .number()
  .int()
  .min(0, "Value must be 0 or greater")
  .max(100000, "Value is too large");

export const createHabitSchema = z.object({
  name: habitNameSchema,
  color: habitColorSchema,
  icon: habitIconSchema.optional(),
  type: habitTypeSchema.optional().default("build"),
  description: habitDescriptionSchema.optional(),
  goalType: goalTypeSchema.optional().default("daily"),
  goalCount: goalCountSchema.optional().default(1),
  isNumeric: isNumericSchema.optional().default(false),
  targetCount: targetCountSchema.optional().default(1),
  unitLabel: unitLabelSchema.optional(),
});

export const updateHabitSchema = z
  .object({
    name: habitNameSchema.optional(),
    color: habitColorSchema.optional(),
    icon: habitIconSchema.optional(),
    type: habitTypeSchema.optional(),
    description: habitDescriptionSchema.optional(),
    goalType: goalTypeSchema.optional(),
    goalCount: goalCountSchema.optional(),
    isNumeric: isNumericSchema.optional(),
    targetCount: targetCountSchema.optional(),
    unitLabel: unitLabelSchema.optional(),
    archived: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.color !== undefined ||
      data.icon !== undefined ||
      data.type !== undefined ||
      data.description !== undefined ||
      data.goalType !== undefined ||
      data.goalCount !== undefined ||
      data.isNumeric !== undefined ||
      data.targetCount !== undefined ||
      data.unitLabel !== undefined ||
      data.archived !== undefined,
    { message: "At least one field must be provided" },
  );

export const themeSchema = z.enum(["light", "dark", "system"], {
  message: "Invalid theme",
});

export const defaultViewSchema = z.enum(["cards", "checklist", "compact"], {
  message: "Invalid view",
});

export const reorderHabitsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});

export const weekStartDaySchema = z.number().int().min(0).max(6);

export const dateParamSchema = z
  .string()
  .refine(isValidDateString, { message: "Invalid date" });

export const logBodySchema = z.object({
  note: logNoteSchema.nullable().optional(),
  value: logValueSchema.optional(),
});

