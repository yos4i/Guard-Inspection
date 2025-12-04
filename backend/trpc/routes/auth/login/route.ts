import { publicProcedure } from "../../../create-context";
import { firestore, initializeDefaultUser } from "@/backend/firestore";
import { doc, getDoc } from "firebase/firestore";
import { z } from "zod";

const loginInput = z.object({
  username: z.string(),
  password: z.string(),
});

// Flag to track if we've already tried to initialize
let initAttempted = false;

export default publicProcedure.input(loginInput).mutation(async ({ input }) => {
  // Initialize default user on first login attempt
  if (!initAttempted) {
    initAttempted = true;
    await initializeDefaultUser();
  }

  const userDocRef = doc(firestore, 'users', input.username);
  const userDoc = await getDoc(userDocRef);
  const user = userDoc.data();

  if (user && user.password === input.password) {
    return { success: true, token: user.token };
  }
  throw new Error('שם משתמש או סיסמה שגויים');
});
