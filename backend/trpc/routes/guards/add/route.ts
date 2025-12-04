import { protectedProcedure } from "../../../create-context";
import { firestore, generateId } from "@/backend/firestore";
import { doc, setDoc } from "firebase/firestore";
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
  const guardDocRef = doc(firestore, 'guards', newGuard.id);
  await setDoc(guardDocRef, newGuard);
  return newGuard;
});
