import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGuards } from '@/contexts/GuardsProvider';
import { Dumbbell, ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';

export default function ExerciseHistoryScreen() {
  const { guardId } = useLocalSearchParams<{ guardId: string }>();
  const { guards, getGuardExercises, deleteExercise } = useGuards();
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const guard = guards.find(g => g.id === guardId);
  const exercises = getGuardExercises(guardId || '');

  if (!guard) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'היסטוריית תרגילים',
          }}
        />
        <Text style={styles.errorText}>מאבטח לא נמצא</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'מצוין':
        return { backgroundColor: '#10B981' };
      case 'טוב':
        return { backgroundColor: '#3B82F6' };
      case 'בינוני':
        return { backgroundColor: '#F59E0B' };
      case 'דורש שיפור':
        return { backgroundColor: '#EF4444' };
      default:
        return { backgroundColor: '#6B7280' };
    }
  };

  const calculateTotalScore = (exercise: any) => {
    return (
      (exercise.identifiedThreatScore || 0) +
      (exercise.reportedOnRadioScore || 0) +
      (exercise.updatedKabtScore || 0) +
      (exercise.updatedCoordinatorScore || 0) +
      (exercise.responseSpeedScore || 0) +
      (exercise.situationControlScore || 0) +
      (exercise.confidenceUnderPressureScore || 0) +
      (exercise.workedByProcedureScore || 0) +
      (exercise.kabtEvaluation || 0)
    );
  };

  const getScoreColor = (score: number) => {
    if (score > 80) {
      return '#10B981';
    } else if (score >= 60) {
      return '#F59E0B';
    } else {
      return '#000000';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'היסטוריית תרגילים',
          headerBackTitle: 'חזור',
        }}
      />

      <View style={styles.header}>
        <Text style={styles.guardName}>
          {guard.firstName} {guard.lastName}
        </Text>
        <Text style={styles.guardId}>ת.ז: {guard.idNumber}</Text>
        <Text style={styles.totalExercises}>
          סה״כ תרגילים: {exercises.length}
        </Text>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Dumbbell size={60} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>אין תרגילים</Text>
          <Text style={styles.emptyText}>טרם בוצעו תרגילים למאבטח זה</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isExpanded = expandedExerciseId === item.id;
            const totalScore = calculateTotalScore(item);
            const scoreColor = getScoreColor(totalScore);
            
            return (
              <View style={styles.card}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedExerciseId(isExpanded ? null : item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[
                      styles.scoreContainer,
                      { backgroundColor: scoreColor + '20' },
                    ]}>
                      <Text style={[
                        styles.scoreValue,
                        { color: scoreColor },
                      ]}>{totalScore}</Text>
                      <Text style={[
                        styles.scoreLabel,
                        { color: scoreColor },
                      ]}>ציון</Text>
                    </View>
                    <View style={styles.headerCenter}>
                      <Text style={styles.date}>{formatDate(item.date)}</Text>
                      <Text style={styles.instructor}>מדריך: {item.instructorName}</Text>
                      <Text style={styles.exerciseType}>{item.exerciseType}</Text>
                    </View>
                    <View style={styles.headerRight}>
                      {isExpanded ? (
                        <ChevronUp size={24} color="#6B7280" />
                      ) : (
                        <ChevronDown size={24} color="#6B7280" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>תיאור התרחיש</Text>
                      <View style={styles.sectionContent}>
                        <View style={styles.descriptionBox}>
                          <Text style={styles.descriptionText}>
                            {item.scenarioDescription}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>תגובת המאבטח</Text>
                      <View style={styles.sectionContent}>
                        <View style={styles.ratingItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View style={[
                              styles.checkIcon,
                              item.identifiedThreat && styles.checkIconChecked,
                            ]}>
                              {item.identifiedThreat && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>זיהוי האיום / חשוד ({item.identifiedThreatScore} נק&apos;)</Text>
                          </View>
                        </View>
                        <View style={styles.ratingItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View style={[
                              styles.checkIcon,
                              item.reportedOnRadio && styles.checkIconChecked,
                            ]}>
                              {item.reportedOnRadio && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>דיווח בקשר ({item.reportedOnRadioScore} נק&apos;)</Text>
                          </View>
                        </View>
                        <View style={styles.ratingItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View style={[
                              styles.checkIcon,
                              item.updatedKabt && styles.checkIconChecked,
                            ]}>
                              {item.updatedKabt && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>עדכון קב&quot;ט ({item.updatedKabtScore} נק&apos;)</Text>
                          </View>
                        </View>
                        <View style={styles.ratingItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View style={[
                              styles.checkIcon,
                              item.updatedCoordinator && styles.checkIconChecked,
                            ]}>
                              {item.updatedCoordinator && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>עדכון רכז ביטחון / מנהל ({item.updatedCoordinatorScore} נק&apos;)</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>הערכה מקצועית</Text>
                      <View style={styles.sectionContent}>
                        <View style={styles.ratingItem}>
                          <Text style={styles.ratingLabel}>מהירות תגובה ({item.responseSpeedScore} נק&apos;)</Text>
                          <View style={[styles.ratingBadge, getRatingColor(item.responseSpeed)]}>
                            <Text style={styles.ratingBadgeText}>
                              {item.responseSpeed}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.ratingItem}>
                          <Text style={styles.ratingLabel}>רמת שליטה במצב ({item.situationControlScore} נק&apos;)</Text>
                          <View style={[styles.ratingBadge, getRatingColor(item.situationControl)]}>
                            <Text style={styles.ratingBadgeText}>
                              {item.situationControl}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.ratingItem}>
                          <Text style={styles.ratingLabel}>ביטחון ועמידה בלחץ ({item.confidenceUnderPressureScore} נק&apos;)</Text>
                          <View style={[styles.ratingBadge, getRatingColor(item.confidenceUnderPressure)]}>
                            <Text style={styles.ratingBadgeText}>
                              {item.confidenceUnderPressure}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>סיכום מדריך</Text>
                      <View style={styles.sectionContent}>
                        {item.toMaintain && (
                          <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>לשימור:</Text>
                            <Text style={styles.summaryText}>{item.toMaintain}</Text>
                          </View>
                        )}
                        {item.toImprove && (
                          <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>לשיפור:</Text>
                            <Text style={styles.summaryText}>{item.toImprove}</Text>
                          </View>
                        )}
                        {item.additionalNotes && (
                          <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>הערות נוספות:</Text>
                            <Text style={styles.summaryText}>{item.additionalNotes}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {item.guardSignature ? (
                      <View style={styles.signatureContainer}>
                        <Text style={styles.signatureLabel}>חתימת המאבטח:</Text>
                        <Text style={styles.signatureText}>{item.guardSignature}</Text>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (confirm('האם אתה בטוח שברצונך למחוק תרגיל זה?')) {
                          deleteExercise(item.id);
                        }
                      }}
                    >
                      <Trash2 size={18} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.deleteButtonText}>מחק תרגיל</Text>
                    </TouchableOpacity>
                  </>
                )}
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  guardName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  guardId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  totalExercises: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2563EB',
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 55,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerRight: {
    justifyContent: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    color: '#6B7280',
  },
  exerciseType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 10,
  },
  sectionContent: {
    gap: 8,
  },
  descriptionBox: {
    paddingVertical: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 10,
  },
  ratingLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkIconChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  checkLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  summaryItem: {
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  signatureContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signatureLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500' as const,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
