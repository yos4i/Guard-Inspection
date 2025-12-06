import { useMemo } from 'react';
import { Guard, Inspection, Exercise } from '@/constants/types';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';

export const [GuardsProvider, useGuards] = createContextHook(() => {
  const guardsQuery = trpc.guards.getAll.useQuery(undefined, {
    refetchOnMount: true,
  });
  const inspectionsQuery = trpc.inspections.getAll.useQuery(undefined, {
    refetchOnMount: true,
  });
  const exercisesQuery = trpc.exercises.getAll.useQuery(undefined, {
    refetchOnMount: true,
  });

  const guards = guardsQuery.data || [];
  const inspections = inspectionsQuery.data || [];
  const exercises = exercisesQuery.data || [];
  const isLoading = guardsQuery.isLoading || inspectionsQuery.isLoading || exercisesQuery.isLoading;

  const addGuardMutation = trpc.guards.add.useMutation({
    onSuccess: () => {
      guardsQuery.refetch();
    },
  });

  const deleteGuardMutation = trpc.guards.delete.useMutation({
    onSuccess: () => {
      guardsQuery.refetch();
      inspectionsQuery.refetch();
      exercisesQuery.refetch();
    },
  });

  const addInspectionMutation = trpc.inspections.add.useMutation({
    onSuccess: () => {
      inspectionsQuery.refetch();
    },
  });

  const deleteInspectionMutation = trpc.inspections.delete.useMutation({
    onSuccess: () => {
      inspectionsQuery.refetch();
    },
  });

  const addExerciseMutation = trpc.exercises.add.useMutation({
    onSuccess: () => {
      exercisesQuery.refetch();
    },
  });

  const deleteExerciseMutation = trpc.exercises.delete.useMutation({
    onSuccess: () => {
      exercisesQuery.refetch();
    },
  });

  const addGuard = async (guard: Omit<Guard, 'id' | 'createdAt'>) => {
    try {
      const newGuard = await addGuardMutation.mutateAsync(guard);
      return newGuard;
    } catch (error) {
      console.error('Failed to add guard:', error);
      throw error;
    }
  };

  const deleteGuard = async (guardId: string) => {
    try {
      await deleteGuardMutation.mutateAsync({ guardId });
    } catch (error) {
      console.error('Failed to delete guard:', error);
      throw error;
    }
  };

  const addInspection = async (inspection: Omit<Inspection, 'id' | 'date'>) => {
    try {
      const newInspection = await addInspectionMutation.mutateAsync(inspection);
      return newInspection;
    } catch (error) {
      console.error('Failed to add inspection:', error);
      throw error;
    }
  };

  const deleteInspection = async (inspectionId: string) => {
    try {
      await deleteInspectionMutation.mutateAsync({ inspectionId });
    } catch (error) {
      console.error('Failed to delete inspection:', error);
      throw error;
    }
  };

  const addExercise = async (exercise: Omit<Exercise, 'id' | 'date'>) => {
    try {
      const newExercise = await addExerciseMutation.mutateAsync(exercise);
      return newExercise;
    } catch (error) {
      console.error('Failed to add exercise:', error);
      throw error;
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    try {
      await deleteExerciseMutation.mutateAsync({ exerciseId });
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      throw error;
    }
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

  const getGuardExercises = (guardId: string) => {
    return exercises
      .filter(e => e.guardId === guardId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
