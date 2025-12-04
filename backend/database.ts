import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

const sqlite = new Database('app.db');
export const db = drizzle(sqlite);

export const guards = sqliteTable('guards', {
  id: text('id').primaryKey(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  idNumber: text('idNumber').notNull(),
  phone: text('phone').notNull(),
  createdAt: text('createdAt').notNull(),
});

export const inspections = sqliteTable('inspections', {
  id: text('id').primaryKey(),
  guardId: text('guardId').notNull(),
  date: text('date').notNull(),
  inspectorName: text('inspectorName').notNull(),
  uniformComplete: text('uniformComplete').notNull(),
  guardBadgeValid: text('guardBadgeValid').notNull(),
  personalWeapon: text('personalWeapon').notNull(),
  fullMagazine: text('fullMagazine').notNull(),
  validCommunication: text('validCommunication').notNull(),
  entranceGateOperational: text('entranceGateOperational').notNull(),
  scanLogComplete: text('scanLogComplete').notNull(),
  proceduresBooklet: text('proceduresBooklet').notNull(),
  selectedProcedures: text('selectedProcedures').notNull(),
  entranceProcedures: text('entranceProcedures').notNull(),
  securityOfficerKnowledge: text('securityOfficerKnowledge').notNull(),
  inspectorNotes: text('inspectorNotes').notNull(),
  guardSignature: text('guardSignature').notNull(),
});

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  guardId: text('guardId').notNull(),
  date: text('date').notNull(),
  instructorName: text('instructorName').notNull(),
  exerciseType: text('exerciseType').notNull(),
  scenarioDescription: text('scenarioDescription').notNull(),
  identifiedThreat: text('identifiedThreat').notNull(),
  reportedOnRadio: text('reportedOnRadio').notNull(),
  updatedKabt: text('updatedKabt').notNull(),
  updatedCoordinator: text('updatedCoordinator').notNull(),
  identifiedThreatScore: real('identifiedThreatScore').notNull(),
  reportedOnRadioScore: real('reportedOnRadioScore').notNull(),
  updatedKabtScore: real('updatedKabtScore').notNull(),
  updatedCoordinatorScore: real('updatedCoordinatorScore').notNull(),
  responseSpeed: text('responseSpeed').notNull(),
  situationControl: text('situationControl').notNull(),
  confidenceUnderPressure: text('confidenceUnderPressure').notNull(),
  responseSpeedScore: real('responseSpeedScore').notNull(),
  situationControlScore: real('situationControlScore').notNull(),
  confidenceUnderPressureScore: real('confidenceUnderPressureScore').notNull(),
  workedByProcedure: text('workedByProcedure').notNull(),
  workedByProcedureScore: real('workedByProcedureScore').notNull(),
  kabtEvaluation: real('kabtEvaluation').notNull(),
  toMaintain: text('toMaintain').notNull(),
  toImprove: text('toImprove').notNull(),
  additionalNotes: text('additionalNotes').notNull(),
  guardSignature: text('guardSignature').notNull(),
  duration: real('duration').notNull(),
  notes: text('notes').notNull(),
});

export const users = sqliteTable('users', {
  username: text('username').primaryKey(),
  password: text('password').notNull(),
  token: text('token').notNull(),
});

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS guards (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    idNumber TEXT NOT NULL,
    phone TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    guardId TEXT NOT NULL,
    date TEXT NOT NULL,
    inspectorName TEXT NOT NULL,
    uniformComplete TEXT NOT NULL,
    guardBadgeValid TEXT NOT NULL,
    personalWeapon TEXT NOT NULL,
    fullMagazine TEXT NOT NULL,
    validCommunication TEXT NOT NULL,
    entranceGateOperational TEXT NOT NULL,
    scanLogComplete TEXT NOT NULL,
    proceduresBooklet TEXT NOT NULL,
    selectedProcedures TEXT NOT NULL,
    entranceProcedures TEXT NOT NULL,
    securityOfficerKnowledge TEXT NOT NULL,
    inspectorNotes TEXT NOT NULL,
    guardSignature TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    guardId TEXT NOT NULL,
    date TEXT NOT NULL,
    instructorName TEXT NOT NULL,
    exerciseType TEXT NOT NULL,
    scenarioDescription TEXT NOT NULL,
    identifiedThreat TEXT NOT NULL,
    reportedOnRadio TEXT NOT NULL,
    updatedKabt TEXT NOT NULL,
    updatedCoordinator TEXT NOT NULL,
    identifiedThreatScore REAL NOT NULL,
    reportedOnRadioScore REAL NOT NULL,
    updatedKabtScore REAL NOT NULL,
    updatedCoordinatorScore REAL NOT NULL,
    responseSpeed TEXT NOT NULL,
    situationControl TEXT NOT NULL,
    confidenceUnderPressure TEXT NOT NULL,
    responseSpeedScore REAL NOT NULL,
    situationControlScore REAL NOT NULL,
    confidenceUnderPressureScore REAL NOT NULL,
    workedByProcedure TEXT NOT NULL,
    workedByProcedureScore REAL NOT NULL,
    kabtEvaluation REAL NOT NULL,
    toMaintain TEXT NOT NULL,
    toImprove TEXT NOT NULL,
    additionalNotes TEXT NOT NULL,
    guardSignature TEXT NOT NULL,
    duration REAL NOT NULL,
    notes TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    token TEXT NOT NULL
  );
`);

const existingUser = sqlite.prepare('SELECT * FROM users WHERE username = ?').get('אשכול');
if (!existingUser) {
  sqlite.prepare('INSERT INTO users (username, password, token) VALUES (?, ?, ?)').run('אשכול', '0123456', 'user-token-ashkol');
}

export const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
