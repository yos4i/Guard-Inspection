import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Dumbbell, UserCircle } from 'lucide-react-native';
import { useGuards, useSortedGuardsByExercise } from '@/contexts/GuardsProvider';

export default function ExercisesScreen() {
  const { isLoading, getLastExerciseDate } = useGuards();
  const guards = useSortedGuardsByExercise();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: 'תרגילים',
            headerTitleAlign: 'center',
          }}
        />
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'תרגילים',
          headerTitleAlign: 'center',
        }}
      />

      {guards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Dumbbell size={80} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>אין מאבטחים במערכת</Text>
          <Text style={styles.emptyText}>הוסף מאבטחים בעמוד המאבטחים כדי להתחיל</Text>
        </View>
      ) : (
        <FlatList
          data={guards}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const lastExercise = getLastExerciseDate(item.id);
            const daysRemaining = lastExercise
              ? Math.max(
                  0,
                  180 -
                    Math.floor(
                      (Date.now() - new Date(lastExercise).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                )
              : 0;

            const getTimerColor = (days: number) => {
              if (days > 90) return '#10B981';
              if (days > 30) return '#F59E0B';
              return '#DC2626';
            };

            const timerColor = getTimerColor(daysRemaining);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.guardInfo}>
                    <View style={styles.iconContainer}>
                      <UserCircle size={40} color="#2563EB" strokeWidth={1.5} />
                    </View>
                    <View style={styles.guardDetails}>
                      <Text style={styles.guardName}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={styles.guardId}>ת.ז: {item.idNumber}</Text>
                      <Text style={styles.guardPhone}>טלפון: {item.phone}</Text>
                    </View>
                  </View>

                </View>

                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: timerColor + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: timerColor }]} />
                    <Text style={[styles.statusText, { color: timerColor }]}>
                      {daysRemaining} ימים
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.newExerciseButton}
                    onPress={() => {
                      router.push(`/new-exercise?guardId=${item.id}` as any);
                    }}
                  >
                    <Dumbbell size={18} color="#FFFFFF" />
                    <Text style={styles.newExerciseButtonText}>תרגיל חדש</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.historyButton}
                  onPress={() => {
                    router.push(`/exercise-history?guardId=${item.id}` as any);
                  }}
                >
                  <Text style={styles.historyButtonText}>היסטוריית תרגילים</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guardInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    marginLeft: 12,
  },
  guardDetails: {
    flex: 1,
  },
  guardName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  guardId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  guardPhone: {
    fontSize: 14,
    color: '#6B7280',
  },

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  newExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  newExerciseButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  historyButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
