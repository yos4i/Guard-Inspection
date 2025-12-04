import { publicProcedure } from "../../../create-context";
import { db, users } from "@/backend/database";
import { z } from "zod";
import { eq } from "drizzle-orm";

const loginInput = z.object({
  username: z.string(),
  password: z.string(),
});

export default publicProcedure.input(loginInput).mutation(({ input }) => {
  const user = db.select().from(users).where(eq(users.username, input.username)).get();
  if (user && user.password === input.password) {
    return { success: true, token: user.token };
  }
  throw new Error('שם משתמש או סיסמה שגויים');
});
