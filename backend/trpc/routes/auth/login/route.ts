import { publicProcedure } from "../../../create-context";
import { database } from "@/backend/database";
import { z } from "zod";

const loginInput = z.object({
  username: z.string(),
  password: z.string(),
});

export default publicProcedure.input(loginInput).mutation(({ input }) => {
  const user = database.users.find(
    u => u.username === input.username && u.password === input.password
  );
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  return { token: user.token, username: user.username };
});
