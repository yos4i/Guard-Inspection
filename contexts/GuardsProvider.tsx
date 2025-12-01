import { useState, useEffect, useMemo } from 'react';
import { Guard, Inspection, Exercise } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const GUARDS_KEY = '@guards';
const INSPECTIONS_KEY = '@inspections';
const EXERCISES_KEY = '@exercises';

export const [GuardsProvider, useGuards] = createContextHook(() => {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [guardsData, inspectionsData, exercisesData] = await Promise.all([
        AsyncStorage.getItem(GUARDS_KEY),
        AsyncStorage.getItem(INSPECTIONS_KEY),
        AsyncStorage.getItem(EXERCISES_KEY),
      ]);

      if (guardsData) {
        setGuards(JSON.parse(guardsData));
      }
      if (inspectionsData) {
        setInspections(JSON.parse(inspectionsData));
      }
      if (exercisesData) {
        setExercises(JSON.parse(exercisesData));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGuards = async (newGuards: Guard[]) => {
    try {
      await AsyncStorage.setItem(GUARDS_KEY, JSON.stringify(newGuards));
      setGuards(newGuards);
    } catch (error) {
      console.error('Failed to save guards:', error);
    }
  };

  const saveInspections = async (newInspections: Inspection[]) => {
    try {
      await AsyncStorage.setItem(INSPECTIONS_KEY, JSON.stringify(newInspections));
      setInspections(newInspections);
    } catch (error) {
      console.error('Failed to save inspections:', error);
    }
  };

  const saveExercises = async (newExercises: Exercise[]) => {
    try {
      await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(newExercises));
      setExercises(newExercises);
    } catch (error) {
      console.error('Failed to save exercises:', error);
    }
  };

  const addGuard = async (guard: Omit<Guard, 'id' | 'createdAt'>) => {
    const newGuard: Guard = {
      ...guard,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedGuards = [...guards, newGuard];
    await saveGuards(updatedGuards);
    return newGuard;
  };

  const deleteGuard = async (guardId: string) => {
    const updatedGuards = guards.filter(g => g.id !== guardId);
    const updatedInspections = inspections.filter(i => i.guardId !== guardId);
    const updatedExercises = exercises.filter(e => e.guardId !== guardId);
    await Promise.all([
      saveGuards(updatedGuards),
      saveInspections(updatedInspections),
      saveExercises(updatedExercises),
    ]);
  };

  const addInspection = async (inspection: Omit<Inspection, 'id' | 'date'>) => {
    const newInspection: Inspection = {
      ...inspection,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updatedInspections = [...inspections, newInspection];
    await saveInspections(updatedInspections);
    return newInspection;
  };

  const getGuardInspections = (guardId: string) => {
    return inspections
      .filter(i => i.guardId === guardId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getLastInspectionDate = (guardId: string) => {
    const guardInspections = getGuardInspections(guardId);
    return guardInspections.length > 0 ? guardInspections[0].date : null;
  };

  const getDaysUntilNextInspection = (guardId: string) => {
    const lastInspection = getLastInspectionDate(guardId);
    if (!lastInspection) return 0;

    const lastDate = new Date(lastInspection);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 30);
    
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const addExercise = async (exercise: Omit<Exercise, 'id' | 'date'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updatedExercises = [...exercises, newExercise];
    await saveExercises(updatedExercises);
    return newExercise;
  };

  const getGuardExercises = (guardId: string) => {
    return exercises
      .filter(e => e.guardId === guardId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const deleteInspection = async (inspectionId: string) => {
    const updatedInspections = inspections.filter(i => i.id !== inspectionId);
    await saveInspections(updatedInspections);
  };

  const deleteExercise = async (exerciseId: string) => {
    const updatedExercises = exercises.filter(e => e.id !== exerciseId);
    await saveExercises(updatedExercises);
  };

  const getLastExerciseDate = (guardId: string) => {
    const guardExercises = getGuardExercises(guardId);
    return guardExercises.length > 0 ? guardExercises[0].date : null;
  };

  const getDaysUntilNextExercise = (guardId: string) => {
    const lastExercise = getLastExerciseDate(guardId);
    if (!lastExercise) return 0;

    const lastDate = new Date(lastExercise);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 180);
    
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return {
    guards,
    inspections,
    exercises,
    isLoading,
    addGuard,
    deleteGuard,
    addInspection,
    deleteInspection,
    getGuardInspections,
    getLastInspectionDate,
    getDaysUntilNextInspection,
    addExercise,
    deleteExercise,
    getGuardExercises,
    getLastExerciseDate,
    getDaysUntilNextExercise,
  };
});

export const useGuardReminders = () => {
  const { guards, getDaysUntilNextInspection, getLastInspectionDate } = useGuards();

  return useMemo(() => {
    return guards
      .map(guard => {
        const daysUntilNext = getDaysUntilNextInspection(guard.id);
        const lastInspection = getLastInspectionDate(guard.id);
        
        return {
          guard,
          daysUntilNext,
          lastInspection,
          isOverdue: daysUntilNext < 0,
          isDueSoon: daysUntilNext >= 0 && daysUntilNext <= 7,
        };
      })
      .sort((a, b) => a.daysUntilNext - b.daysUntilNext);
  }, [guards, getDaysUntilNextInspection, getLastInspectionDate]);
};

export const useSortedGuards = () => {
  const { guards, getDaysUntilNextInspection } = useGuards();

  return useMemo(() => {
    return [...guards].sort((a, b) => {
      const daysA = getDaysUntilNextInspection(a.id);
      const daysB = getDaysUntilNextInspection(b.id);
      return daysA - daysB;
    });
  }, [guards, getDaysUntilNextInspection]);
};

export const useSortedGuardsByExercise = () => {
  const { guards, getDaysUntilNextExercise } = useGuards();

  return useMemo(() => {
    return [...guards].sort((a, b) => {
      const daysA = getDaysUntilNextExercise(a.id);
      const daysB = getDaysUntilNextExercise(b.id);
      return daysA - daysB;
    });
  }, [guards, getDaysUntilNextExercise]);
};
