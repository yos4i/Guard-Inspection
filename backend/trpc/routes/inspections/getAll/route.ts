import { protectedProcedure } from "../../../create-context";
import { inspectionsCollection } from "@/backend/firestore-admin";
import { Inspection, RatingValue } from "@/constants/types";

export default protectedProcedure.query(async () => {
  const snapshot = await inspectionsCollection.get();
  return snapshot.docs.map((doc): Inspection => {
    const data = doc.data();
    return {
      id: doc.id,
      guardId: data.guardId,
      date: data.date,
      inspectorName: data.inspectorName,
      uniformComplete: data.uniformComplete as RatingValue,
      guardBadgeValid: data.guardBadgeValid as RatingValue,
      personalWeapon: data.personalWeapon as RatingValue,
      fullMagazine: data.fullMagazine as RatingValue,
      validCommunication: data.validCommunication as RatingValue,
      entranceGateOperational: data.entranceGateOperational as RatingValue,
      scanLogComplete: data.scanLogComplete as RatingValue,
      proceduresBooklet: data.proceduresBooklet as RatingValue,
      selectedProcedures: data.selectedProcedures,
      entranceProcedures: data.entranceProcedures as RatingValue,
      securityOfficerKnowledge: data.securityOfficerKnowledge as RatingValue,
      inspectorNotes: data.inspectorNotes,
      guardSignature: data.guardSignature,
    };
  });
});
