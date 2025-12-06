import { protectedProcedure } from "../../../create-context";
import { exercisesCollection } from "@/backend/firestore-admin";
import { z } from "zod";

const deleteExerciseInput = z.object({
  exerciseId: z.string(),
});

export default protectedProcedure.input(deleteExerciseInput).mutation(async ({ input }) => {
  await exercisesCollection.doc(input.exerciseId).delete();
  return { success: true };
});
