import { protectedProcedure } from "../../../create-context";
import { database, generateId } from "@/backend/database";
import { z } from "zod";

const ratingValueSchema = z.enum(['needs_improvement', 'good', 'excellent']);

const procedureTestSchema = z.object({
  procedure: z.string(),
  rating: ratingValueSchema,
});

const addInspectionInput = z.object({
  guardId: z.string(),
  inspectorName: z.string(),
  uniformComplete: ratingValueSchema,
  guardBadgeValid: ratingValueSchema,
  personalWeapon: ratingValueSchema,
  fullMagazine: ratingValueSchema,
  validCommunication: ratingValueSchema,
  entranceGateOperational: ratingValueSchema,
  scanLogComplete: ratingValueSchema,
  proceduresBooklet: ratingValueSchema,
  selectedProcedures: z.array(procedureTestSchema),
  entranceProcedures: ratingValueSchema,
  securityOfficerKnowledge: ratingValueSchema,
  inspectorNotes: z.string(),
  guardSignature: z.string(),
});

export default protectedProcedure.input(addInspectionInput).mutation(({ input }) => {
  const newInspection = {
    ...input,
    id: generateId(),
    date: new Date().toISOString(),
  };
  database.inspections.push(newInspection);
  return newInspection;
});
