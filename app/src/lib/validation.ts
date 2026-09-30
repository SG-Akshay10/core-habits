import { z } from "zod";
import { HABIT_COLORS } from "@/lib/colors";
import { isValidDateString } from "@/lib/date";

export const habitNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(60, "Name must be 60 characters or fewer");

export const habitColorSchema = z.enum(
  HABIT_COLORS as unknown as [string, ...string[]],
  { message: "Invalid color" },
);

export const habitTypeSchema = z.enum(["build", "quit"], {
  message: "Invalid habit type",
});

export const habitDescriptionSchema = z
  .string()
  .trim()
  .max(280, "Description must be 280 characters or fewer");

export const logNoteSchema = z
  .string()
  .trim()
  .max(280, "Note must be 280 characters or fewer");

export const createHabitSchema = z.object({
  name: habitNameSchema,
  color: habitColorSchema,
  type: habitTypeSchema.optional().default("build"),
  description: habitDescriptionSchema.optional(),
});

export const updateHabitSchema = z
  .object({
    name: habitNameSchema.optional(),
    color: habitColorSchema.optional(),
    type: habitTypeSchema.optional(),
    description: habitDescriptionSchema.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.color !== undefined ||
      data.type !== undefined ||
      data.description !== undefined,
    { message: "At least one field must be provided" },
  );

export const dateParamSchema = z
  .string()
  .refine(isValidDateString, { message: "Invalid date" });

export const logBodySchema = z.object({
  note: logNoteSchema.nullable().optional(),
});

