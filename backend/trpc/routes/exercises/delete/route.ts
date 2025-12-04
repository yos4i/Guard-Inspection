import { protectedProcedure } from "../../../create-context";
import { firestore } from "@/backend/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import { z } from "zod";

const deleteExerciseInput = z.object({
  exerciseId: z.string(),
});

export default protectedProcedure.input(deleteExerciseInput).mutation(async ({ input }) => {
  const exerciseDocRef = doc(firestore, 'exercises', input.exerciseId);
  await deleteDoc(exerciseDocRef);
  return { success: true };
});
