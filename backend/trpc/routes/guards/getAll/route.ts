import { protectedProcedure } from "../../../create-context";
import { db, guards } from "@/backend/database";

export default protectedProcedure.query(() => {
  return db.select().from(guards).all();
});
