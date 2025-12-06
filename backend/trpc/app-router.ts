import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getAllGuardsRoute from "./routes/guards/getAll/route";
import addGuardRoute from "./routes/guards/add/route";
import deleteGuardRoute from "./routes/guards/delete/route";
import getAllInspectionsRoute from "./routes/inspections/getAll/route";
import addInspectionRoute from "./routes/inspections/add/route";
import deleteInspectionRoute from "./routes/inspections/delete/route";
import getAllExercisesRoute from "./routes/exercises/getAll/route";
import addExerciseRoute from "./routes/exercises/add/route";
import deleteExerciseRoute from "./routes/exercises/delete/route";
import loginRoute from "./routes/auth/login/route";
import checkAuthRoute from "./routes/auth/check/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  guards: createTRPCRouter({
    getAll: getAllGuardsRoute,
    add: addGuardRoute,
    delete: deleteGuardRoute,
  }),
  inspections: createTRPCRouter({
    getAll: getAllInspectionsRoute,
    add: addInspectionRoute,
    delete: deleteInspectionRoute,
  }),
  exercises: createTRPCRouter({
    getAll: getAllExercisesRoute,
    add: addExerciseRoute,
    delete: deleteExerciseRoute,
  }),
  auth: createTRPCRouter({
    login: loginRoute,
    check: checkAuthRoute,
  }),
});

export type AppRouter = typeof appRouter;
