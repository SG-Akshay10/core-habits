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

export const themeSchema = z.enum(["light", "dark"], {
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

export const reminderTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time (expected HH:MM)");

export const reminderDaysOfWeekSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1, "Select at least one day")
  .max(7);

export const createReminderSchema = z.object({
  time: reminderTimeSchema,
  daysOfWeek: reminderDaysOfWeekSchema,
  enabled: z.boolean().optional().default(true),
});

export const updateReminderSchema = z
  .object({
    time: reminderTimeSchema.optional(),
    daysOfWeek: reminderDaysOfWeekSchema.optional(),
    enabled: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.time !== undefined ||
      data.daysOfWeek !== undefined ||
      data.enabled !== undefined,
    { message: "At least one field must be provided" },
  );

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const importLogSchema = z.object({
  date: z.string().refine(isValidDateString, { message: "Invalid date" }),
  value: logValueSchema.optional().default(1),
  note: logNoteSchema.nullable().optional(),
});

export const importHabitSchema = z.object({
  name: habitNameSchema,
  color: z.string().min(1),
  icon: z.string().nullable().optional(),
  type: habitTypeSchema.optional().default("build"),
  description: z.string().nullable().optional(),
  goalType: goalTypeSchema.optional().default("daily"),
  goalCount: goalCountSchema.optional().default(1),
  isNumeric: isNumericSchema.optional().default(false),
  targetCount: targetCountSchema.optional().default(1),
  unitLabel: z.string().nullable().optional(),
  archivedAt: z.string().nullable().optional(),
  logs: z.array(importLogSchema).max(5000).optional().default([]),
});

export const importPayloadSchema = z.object({
  formatVersion: z.number().optional(),
  exportedAt: z.string().optional(),
  habits: z.array(importHabitSchema).min(1).max(200),
});
