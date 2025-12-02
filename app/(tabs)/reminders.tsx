import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGuardReminders, useSortedGuardsByExercise, useGuards } from '@/contexts/GuardsProvider';
import { Shield, Dumbbell, Timer, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthProvider';

type CategoryType = 'guards' | 'exercises';

interface CategoryTab {
  id: CategoryType;
  title: string;
  icon: any;
  color: string;
}

const categories: CategoryTab[] = [
  { id: 'guards', title: 'בקרה', icon: Shield, color: '#2563EB' },
  { id: 'exercises', title: 'תרגילים', icon: Dumbbell, color: '#DC2626' },
];

export default function RemindersScreen() {
  const reminders = useGuardReminders();
  const sortedGuardsByExercise = useSortedGuardsByExercise();
  const { getLastExerciseDate } = useGuards();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('guards');
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'יציאה מהמערכת',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'יציאה',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const renderGuardsCategory = () => {
    if (reminders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Shield size={60} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>אין מאבטחים</Text>
          <Text style={styles.emptyText}>לא קיימים מאבטחים במערכת</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>כל הבקרות</Text>
        <FlatList
          data={reminders}
          scrollEnabled={false}
          keyExtractor={(item) => item.guard.id}
          renderItem={({ item }) => {
            const daysRemaining = item.lastInspection
              ? Math.max(
                  0,
                  30 -
                    Math.floor(
                      (Date.now() - new Date(item.lastInspection).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                )
              : 0;

            const getTimerColor = (days: number) => {
              if (days >= 15 && days <= 30) return '#10B981';
              if (days >= 5 && days < 15) return '#F59E0B';
              return '#DC2626';
            };

            const timerColor = getTimerColor(daysRemaining);

            return (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.timerContainer,
                      { backgroundColor: timerColor + '15', borderColor: timerColor },
                    ]}
                  >
                    <Timer size={24} color={timerColor} strokeWidth={2.5} />
                    <Text style={[styles.timerDays, { color: timerColor }]}>
                      {daysRemaining}
                    </Text>
                    <Text style={[styles.timerLabel, { color: timerColor }]}>ימים</Text>
                  </View>
                  <View style={styles.guardInfo}>
                    <Text style={styles.guardName}>
                      {item.guard.firstName} {item.guard.lastName}
                    </Text>
                    <Text style={styles.guardId}>ת.ז: {item.guard.idNumber}</Text>
                    {item.lastInspection && (
                      <Text style={styles.lastInspectionText}>
                        בקרה אחרונה:{' '}
                        {new Date(item.lastInspection).toLocaleDateString('he-IL')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    );
  };

  const renderExercisesCategory = () => {
    if (sortedGuardsByExercise.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Dumbbell size={60} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>אין מאבטחים</Text>
          <Text style={styles.emptyText}>לא קיימים מאבטחים במערכת</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>כל הבקרות</Text>
        <FlatList
          data={sortedGuardsByExercise}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const guard = item;
            const lastExercise = getLastExerciseDate(guard.id);
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
              if (days >= 90 && days <= 180) return '#10B981';
              if (days >= 30 && days < 90) return '#F59E0B';
              return '#DC2626';
            };

            const timerColor = getTimerColor(daysRemaining);

            return (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.timerContainer,
                      { backgroundColor: timerColor + '15', borderColor: timerColor },
                    ]}
                  >
                    <Timer size={24} color={timerColor} strokeWidth={2.5} />
                    <Text style={[styles.timerDays, { color: timerColor }]}>
                      {daysRemaining}
                    </Text>
                    <Text style={[styles.timerLabel, { color: timerColor }]}>ימים</Text>
                  </View>
                  <View style={styles.guardInfo}>
                    <Text style={styles.guardName}>
                      {guard.firstName} {guard.lastName}
                    </Text>
                    <Text style={styles.guardId}>ת.ז: {guard.idNumber}</Text>
                    {lastExercise && (
                      <Text style={styles.lastInspectionText}>
                        תרגיל אחרון:{' '}
                        {new Date(lastExercise).toLocaleDateString('he-IL')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    );
  };

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'guards':
        return renderGuardsCategory();
      case 'exercises':
        return renderExercisesCategory();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'תזכורות',
          headerTitleAlign: 'left',
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                marginLeft: 16,
                padding: 8,
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <LogOut size={22} color="#ef4444" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.categoryTabs}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const Icon = category.icon;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                isSelected && { backgroundColor: category.color },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon
                size={20}
                color={isSelected ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  isSelected && styles.categoryTabTextActive,
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCategoryContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
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
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  allGoodContainer: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  allGoodTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#10B981',
    marginTop: 16,
  },
  allGoodText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
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
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  cardDueSoon: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guardInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  guardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  guardId: {
    fontSize: 13,
    color: '#6B7280',
  },
  lastInspectionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeOverdue: {
    backgroundColor: '#FEE2E2',
  },
  badgeDueSoon: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
  },
  timerDays: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 2,
  },
});
