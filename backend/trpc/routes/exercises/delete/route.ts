import { protectedProcedure } from "../../../create-context";
import { database } from "@/backend/database";
import { z } from "zod";

const deleteExerciseInput = z.object({
  exerciseId: z.string(),
});

export default protectedProcedure.input(deleteExerciseInput).mutation(({ input }) => {
  database.exercises = database.exercises.filter(e => e.id !== input.exerciseId);
  return { success: true };
});
