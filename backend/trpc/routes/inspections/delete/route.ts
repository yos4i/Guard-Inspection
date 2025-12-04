import { protectedProcedure } from "../../../create-context";
import { db, inspections } from "@/backend/database";
import { z } from "zod";
import { eq } from "drizzle-orm";

const deleteInspectionInput = z.object({
  inspectionId: z.string(),
});

export default protectedProcedure.input(deleteInspectionInput).mutation(({ input }) => {
  db.delete(inspections).where(eq(inspections.id, input.inspectionId)).run();
  return { success: true };
});
