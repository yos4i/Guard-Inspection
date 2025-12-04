import { protectedProcedure } from "../../../create-context";
import { database, generateId } from "@/backend/database";
import { z } from "zod";

const addGuardInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  idNumber: z.string(),
  phone: z.string(),
});

export default protectedProcedure.input(addGuardInput).mutation(({ input }) => {
  const newGuard = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  database.guards.push(newGuard);
  return newGuard;
});
