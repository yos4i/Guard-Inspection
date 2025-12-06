export interface Guard {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  createdAt: string;
}

export type RatingValue = 'needs_improvement' | 'good' | 'excellent';

export interface ProcedureTest {
  procedure: string;
  rating: RatingValue;
}

export interface Inspection {
  id: string;
  guardId: string;
  date: string;
  inspectorName: string;
  
  uniformComplete: RatingValue;
  guardBadgeValid: RatingValue;
  personalWeapon: RatingValue;
  fullMagazine: RatingValue;
  
  validCommunication: RatingValue;
  entranceGateOperational: RatingValue;
  scanLogComplete: RatingValue;
  proceduresBooklet: RatingValue;
  
  selectedProcedures: ProcedureTest[];
  entranceProcedures: RatingValue;
  securityOfficerKnowledge: RatingValue;
  
  inspectorNotes: string;
  guardSignature: string;
}

export interface Exercise {
  id: string;
  guardId: string;
  date: string;
  instructorName: string;
  exerciseType: string;
  scenarioDescription: string;
  identifiedThreat: string;
  reportedOnRadio: string;
  updatedKabt: string;
  updatedCoordinator: string;
  identifiedThreatScore: number;
  reportedOnRadioScore: number;
  updatedKabtScore: number;
  updatedCoordinatorScore: number;
  responseSpeed: string;
  situationControl: string;
  confidenceUnderPressure: string;
  responseSpeedScore: number;
  situationControlScore: number;
  confidenceUnderPressureScore: number;
  workedByProcedure: string;
  workedByProcedureScore: number;
  kabtEvaluation: number;
  toMaintain: string;
  toImprove: string;
  additionalNotes: string;
  guardSignature: string;
  duration: number;
  notes: string;
}
