import { publicProcedure } from "../../../create-context";
import { usersCollection, initializeDefaultUser } from "@/backend/firestore-admin";
import { z } from "zod";

const loginInput = z.object({
  username: z.string(),
  password: z.string(),
});

// Initialize on first load
let initialized = false;

export default publicProcedure.input(loginInput).mutation(async ({ input }) => {
  console.log('[Login] Attempting login for:', input.username);

  // Ensure default user exists
  if (!initialized) {
    initialized = true;
    await initializeDefaultUser();
  }

  try {
    const userDocRef = usersCollection.doc(input.username);
    const userDoc = await userDocRef.get();

    console.log('[Login] User found:', userDoc.exists);

    if (userDoc.exists) {
      const user = userDoc.data();

      if (user && user.password === input.password) {
        console.log('[Login] Login successful for:', input.username);
        return { success: true, token: user.token };
      }
    }

    console.log('[Login] Login failed - wrong credentials');
    throw new Error('שם משתמש או סיסמה שגויים');
  } catch (error: any) {
    console.error('[Login] Error during login:', error);
    if (error.message === 'שם משתמש או סיסמה שגויים') {
      throw error;
    }
    throw new Error('שגיאה בהתחברות למערכת');
  }
});
