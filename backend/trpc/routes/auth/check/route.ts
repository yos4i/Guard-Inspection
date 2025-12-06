import { protectedProcedure } from "../../../create-context";

export default protectedProcedure.query(({ ctx }) => {
  return { isAuthenticated: true, userId: ctx.userId };
});
