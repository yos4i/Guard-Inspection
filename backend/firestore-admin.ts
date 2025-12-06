import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Firebase Admin] Initialized successfully');
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
  }
}

export const adminDb = admin.firestore();

// Collection references
export const guardsCollection = adminDb.collection('guards');
export const inspectionsCollection = adminDb.collection('inspections');
export const exercisesCollection = adminDb.collection('exercises');
export const usersCollection = adminDb.collection('users');

// Helper function to generate IDs
export const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Types matching the database schema
export interface Guard {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  guardId: string;
  date: string;
  inspectorName: string;
  uniformComplete: string;
  guardBadgeValid: string;
  personalWeapon: string;
  fullMagazine: string;
  validCommunication: string;
  entranceGateOperational: string;
  scanLogComplete: string;
  proceduresBooklet: string;
  selectedProcedures: string;
  entranceProcedures: string;
  securityOfficerKnowledge: string;
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

export interface User {
  username: string;
  password: string;
  token: string;
}

// Initialize default user if it doesn't exist
export async function initializeDefaultUser() {
  try {
    const userDocRef = usersCollection.doc('אשכול');
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      await userDocRef.set({
        username: 'אשכול',
        password: '0123456',
        token: 'user-token-ashkol',
      });
      console.log('[Firebase Admin] Default user created');
    } else {
      console.log('[Firebase Admin] Default user already exists');
    }
  } catch (error) {
    console.error('[Firebase Admin] Error initializing default user:', error);
  }
}
