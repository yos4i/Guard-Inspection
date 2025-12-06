import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authToken = opts.req.headers.get('authorization');
  return {
    req: opts.req,
    userId: authToken || null,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
