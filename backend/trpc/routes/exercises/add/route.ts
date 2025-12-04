import { protectedProcedure } from "../../../create-context";
import { database, generateId } from "@/backend/database";
import { z } from "zod";

const addExerciseInput = z.object({
  guardId: z.string(),
  instructorName: z.string(),
  exerciseType: z.string(),
  scenarioDescription: z.string(),
  identifiedThreat: z.string(),
  reportedOnRadio: z.string(),
  updatedKabt: z.string(),
  updatedCoordinator: z.string(),
  identifiedThreatScore: z.number(),
  reportedOnRadioScore: z.number(),
  updatedKabtScore: z.number(),
  updatedCoordinatorScore: z.number(),
  responseSpeed: z.string(),
  situationControl: z.string(),
  confidenceUnderPressure: z.string(),
  responseSpeedScore: z.number(),
  situationControlScore: z.number(),
  confidenceUnderPressureScore: z.number(),
  workedByProcedure: z.string(),
  workedByProcedureScore: z.number(),
  kabtEvaluation: z.number(),
  toMaintain: z.string(),
  toImprove: z.string(),
  additionalNotes: z.string(),
  guardSignature: z.string(),
  duration: z.number(),
  notes: z.string(),
});

export default protectedProcedure.input(addExerciseInput).mutation(({ input }) => {
  const newExercise = {
    ...input,
    id: generateId(),
    date: new Date().toISOString(),
  };
  database.exercises.push(newExercise);
  return newExercise;
});
