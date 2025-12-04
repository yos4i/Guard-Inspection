import { protectedProcedure } from "../../../create-context";
import { firestore, inspectionsCollection, exercisesCollection } from "@/backend/firestore";
import { doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { z } from "zod";

const deleteGuardInput = z.object({
  guardId: z.string(),
});

export default protectedProcedure.input(deleteGuardInput).mutation(async ({ input }) => {
  // Delete the guard
  const guardDocRef = doc(firestore, 'guards', input.guardId);
  await deleteDoc(guardDocRef);

  // Delete all inspections for this guard
  const inspectionsQuery = query(inspectionsCollection, where('guardId', '==', input.guardId));
  const inspectionsSnapshot = await getDocs(inspectionsQuery);
  const inspectionDeletes = inspectionsSnapshot.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));

  // Delete all exercises for this guard
  const exercisesQuery = query(exercisesCollection, where('guardId', '==', input.guardId));
  const exercisesSnapshot = await getDocs(exercisesQuery);
  const exerciseDeletes = exercisesSnapshot.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));

  await Promise.all([...inspectionDeletes, ...exerciseDeletes]);

  return { success: true };
});
