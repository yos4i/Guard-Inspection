import { protectedProcedure } from "../../../create-context";
import { db, inspections } from "@/backend/database";
import { Inspection, RatingValue } from "@/constants/types";

export default protectedProcedure.query(() => {
  const rows = db.select().from(inspections).all();
  return rows.map((row): Inspection => ({
    id: row.id,
    guardId: row.guardId,
    date: row.date,
    inspectorName: row.inspectorName,
    uniformComplete: row.uniformComplete as RatingValue,
    guardBadgeValid: row.guardBadgeValid as RatingValue,
    personalWeapon: row.personalWeapon as RatingValue,
    fullMagazine: row.fullMagazine as RatingValue,
    validCommunication: row.validCommunication as RatingValue,
    entranceGateOperational: row.entranceGateOperational as RatingValue,
    scanLogComplete: row.scanLogComplete as RatingValue,
    proceduresBooklet: row.proceduresBooklet as RatingValue,
    selectedProcedures: JSON.parse(row.selectedProcedures),
    entranceProcedures: row.entranceProcedures as RatingValue,
    securityOfficerKnowledge: row.securityOfficerKnowledge as RatingValue,
    inspectorNotes: row.inspectorNotes,
    guardSignature: row.guardSignature,
  }));
});
