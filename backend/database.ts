import { Guard, Inspection, Exercise } from '@/constants/types';

interface Database {
  guards: Guard[];
  inspections: Inspection[];
  exercises: Exercise[];
  users: { username: string; password: string; token: string }[];
}

const db: Database = {
  guards: [],
  inspections: [],
  exercises: [],
  users: [
    {
      username: 'אשכול',
      password: '0123456',
      token: 'user-token-ashkol'
    }
  ]
};

export const database = db;

export const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
