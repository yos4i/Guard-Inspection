import { protectedProcedure } from "../../../create-context";
import { guardsCollection, generateId } from "@/backend/firestore-admin";
import { z } from "zod";

const addGuardInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  idNumber: z.string(),
  phone: z.string(),
});

export default protectedProcedure.input(addGuardInput).mutation(async ({ input }) => {
  const newGuard = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  await guardsCollection.doc(newGuard.id).set(newGuard);
  return newGuard;
});
