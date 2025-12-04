import { protectedProcedure } from "../../../create-context";
import { db, inspections, generateId } from "@/backend/database";
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
    id: generateId(),
    date: new Date().toISOString(),
    guardId: input.guardId,
    inspectorName: input.inspectorName,
    uniformComplete: input.uniformComplete,
    guardBadgeValid: input.guardBadgeValid,
    personalWeapon: input.personalWeapon,
    fullMagazine: input.fullMagazine,
    validCommunication: input.validCommunication,
    entranceGateOperational: input.entranceGateOperational,
    scanLogComplete: input.scanLogComplete,
    proceduresBooklet: input.proceduresBooklet,
    selectedProcedures: JSON.stringify(input.selectedProcedures),
    entranceProcedures: input.entranceProcedures,
    securityOfficerKnowledge: input.securityOfficerKnowledge,
    inspectorNotes: input.inspectorNotes,
    guardSignature: input.guardSignature,
  };
  db.insert(inspections).values(newInspection).run();
  return {
    ...newInspection,
    selectedProcedures: input.selectedProcedures,
  };
});
