import { protectedProcedure } from "../../../create-context";
import { database } from "@/backend/database";

export default protectedProcedure.query(() => {
  return database.exercises;
});
