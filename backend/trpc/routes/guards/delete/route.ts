import { protectedProcedure } from "../../../create-context";
import { guardsCollection, inspectionsCollection, exercisesCollection } from "@/backend/firestore-admin";
import { z } from "zod";

const deleteGuardInput = z.object({
  guardId: z.string(),
});

export default protectedProcedure.input(deleteGuardInput).mutation(async ({ input }) => {
  // Delete the guard
  await guardsCollection.doc(input.guardId).delete();

  // Delete all inspections for this guard
  const inspectionsSnapshot = await inspectionsCollection.where('guardId', '==', input.guardId).get();
  const inspectionDeletes = inspectionsSnapshot.docs.map(doc => doc.ref.delete());

  // Delete all exercises for this guard
  const exercisesSnapshot = await exercisesCollection.where('guardId', '==', input.guardId).get();
  const exerciseDeletes = exercisesSnapshot.docs.map(doc => doc.ref.delete());

  await Promise.all([...inspectionDeletes, ...exerciseDeletes]);

  return { success: true };
});
