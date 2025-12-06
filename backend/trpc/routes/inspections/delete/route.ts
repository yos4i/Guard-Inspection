import { protectedProcedure } from "../../../create-context";
import { inspectionsCollection } from "@/backend/firestore-admin";
import { z } from "zod";

const deleteInspectionInput = z.object({
  inspectionId: z.string(),
});

export default protectedProcedure.input(deleteInspectionInput).mutation(async ({ input }) => {
  await inspectionsCollection.doc(input.inspectionId).delete();
  return { success: true };
});
