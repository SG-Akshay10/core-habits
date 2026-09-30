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

export const createHabitSchema = z.object({
  name: habitNameSchema,
  color: habitColorSchema,
});

export const updateHabitSchema = z
  .object({
    name: habitNameSchema.optional(),
    color: habitColorSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.color !== undefined, {
    message: "At least one field must be provided",
  });

export const dateParamSchema = z
  .string()
  .refine(isValidDateString, { message: "Invalid date" });
