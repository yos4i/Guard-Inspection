import { protectedProcedure } from "../../../create-context";
import { firestore } from "@/backend/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import { z } from "zod";

const deleteInspectionInput = z.object({
  inspectionId: z.string(),
});

export default protectedProcedure.input(deleteInspectionInput).mutation(async ({ input }) => {
  const inspectionDocRef = doc(firestore, 'inspections', input.inspectionId);
  await deleteDoc(inspectionDocRef);
  return { success: true };
});
