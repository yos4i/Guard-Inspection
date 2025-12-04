import { protectedProcedure } from "../../../create-context";
import { db, exercises } from "@/backend/database";

export default protectedProcedure.query(() => {
  return db.select().from(exercises).all();
});
