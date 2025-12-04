import { protectedProcedure } from "../../../create-context";
import { db, guards, inspections, exercises } from "@/backend/database";
import { z } from "zod";
import { eq } from "drizzle-orm";

const deleteGuardInput = z.object({
  guardId: z.string(),
});

export default protectedProcedure.input(deleteGuardInput).mutation(({ input }) => {
  db.delete(guards).where(eq(guards.id, input.guardId)).run();
  db.delete(inspections).where(eq(inspections.guardId, input.guardId)).run();
  db.delete(exercises).where(eq(exercises.guardId, input.guardId)).run();
  return { success: true };
});
