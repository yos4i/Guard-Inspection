import { protectedProcedure } from "../../../create-context";
import { database } from "@/backend/database";
import { z } from "zod";

const deleteGuardInput = z.object({
  guardId: z.string(),
});

export default protectedProcedure.input(deleteGuardInput).mutation(({ input }) => {
  database.guards = database.guards.filter(g => g.id !== input.guardId);
  database.inspections = database.inspections.filter(i => i.guardId !== input.guardId);
  database.exercises = database.exercises.filter(e => e.guardId !== input.guardId);
  return { success: true };
});
