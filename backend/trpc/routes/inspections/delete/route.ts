import { protectedProcedure } from "../../../create-context";
import { database } from "@/backend/database";
import { z } from "zod";

const deleteInspectionInput = z.object({
  inspectionId: z.string(),
});

export default protectedProcedure.input(deleteInspectionInput).mutation(({ input }) => {
  database.inspections = database.inspections.filter(i => i.id !== input.inspectionId);
  return { success: true };
});
