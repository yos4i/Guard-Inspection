import { protectedProcedure } from "../../../create-context";
import { db, exercises } from "@/backend/database";
import { z } from "zod";
import { eq } from "drizzle-orm";

const deleteExerciseInput = z.object({
  exerciseId: z.string(),
});

export default protectedProcedure.input(deleteExerciseInput).mutation(({ input }) => {
  db.delete(exercises).where(eq(exercises.id, input.exerciseId)).run();
  return { success: true };
});
