import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';

// Initialize Firebase Client SDK
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firestore = getFirestore(app);

// Collection references
export const guardsCollection = collection(firestore, 'guards');
export const inspectionsCollection = collection(firestore, 'inspections');
export const exercisesCollection = collection(firestore, 'exercises');
export const usersCollection = collection(firestore, 'users');

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
    const userDocRef = doc(firestore, 'users', 'אשכול');
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        username: 'אשכול',
        password: '0123456',
        token: 'user-token-ashkol',
      });
      console.log('Default user created');
    }
  } catch (error) {
    console.error('Error initializing default user:', error);
  }
}
