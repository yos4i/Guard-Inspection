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
import { Dumbbell, ChevronDown, ChevronUp, CheckCircle2, TrendingUp, Clock, User, Trash2 } from 'lucide-react-native';

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
        <View style={styles.headerTop}>
          <View style={styles.guardIcon}>
            <User size={32} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.guardInfo}>
            <Text style={styles.guardName}>
              {guard.firstName} {guard.lastName}
            </Text>
            <Text style={styles.guardId}>ת.ז: {guard.idNumber}</Text>
          </View>
        </View>

      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Dumbbell size={64} color="#DC2626" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>אין תרגילים עדיין</Text>
          <Text style={styles.emptyText}>זה הזמן להתחיל באימונים! 💪</Text>
          <Text style={styles.emptySubtext}>תרגילים יופיעו כאן לאחר ביצועם</Text>
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
                    <View style={styles.headerLeft}>
                      <View style={styles.iconCircle}>
                        <Dumbbell size={26} color="#FFFFFF" strokeWidth={2.5} />
                      </View>
                    </View>
                    <View style={styles.headerCenter}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{item.exerciseType}</Text>
                      </View>
                      <View style={styles.dateRow}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.date}>{formatDate(item.date)}</Text>
                      </View>
                      <Text style={styles.instructor}>👨‍🏫 {item.instructorName}</Text>
                    </View>
                    <View style={styles.headerRight}>
                      <View style={styles.scoreCircle}>
                        <Text style={[styles.scoreText, { color: scoreColor }]}>
                          {totalScore}
                        </Text>
                      </View>
                      <View style={styles.expandButton}>
                        {isExpanded ? (
                          <ChevronUp size={20} color="#FFFFFF" strokeWidth={2.5} />
                        ) : (
                          <ChevronDown size={20} color="#FFFFFF" strokeWidth={2.5} />
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <>
                    <View style={styles.divider} />
                    
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBg}>
                          <Text style={styles.sectionIcon}>📋</Text>
                        </View>
                        <Text style={styles.sectionTitle}>תיאור התרחיש</Text>
                      </View>
                      <View style={styles.sectionContent}>
                        <View style={styles.descriptionBox}>
                          <Text style={styles.descriptionText}>
                            {item.scenarioDescription}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBg}>
                          <Text style={styles.sectionIcon}>✅</Text>
                        </View>
                        <Text style={styles.sectionTitle}>תגובת המאבטח</Text>
                      </View>
                      <View style={styles.sectionContent}>
                        <View style={styles.scoreRow}>
                          <View style={styles.scoreRowLeft}>
                            <View style={[
                              styles.checkIcon,
                              item.identifiedThreat && styles.checkIconChecked,
                            ]}>
                              {item.identifiedThreat && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>זיהוי האיום / חשוד</Text>
                          </View>
                          <View style={styles.scorePointsBadge}>
                            <Text style={styles.scorePointsText}>{item.identifiedThreatScore}</Text>
                            <Text style={styles.scorePointsLabel}>נק&apos;</Text>
                          </View>
                        </View>
                        <View style={styles.scoreRow}>
                          <View style={styles.scoreRowLeft}>
                            <View style={[
                              styles.checkIcon,
                              item.reportedOnRadio && styles.checkIconChecked,
                            ]}>
                              {item.reportedOnRadio && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>דיווח בקשר</Text>
                          </View>
                          <View style={styles.scorePointsBadge}>
                            <Text style={styles.scorePointsText}>{item.reportedOnRadioScore}</Text>
                            <Text style={styles.scorePointsLabel}>נק&apos;</Text>
                          </View>
                        </View>
                        <View style={styles.scoreRow}>
                          <View style={styles.scoreRowLeft}>
                            <View style={[
                              styles.checkIcon,
                              item.updatedKabt && styles.checkIconChecked,
                            ]}>
                              {item.updatedKabt && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>עדכון קב&quot;ט</Text>
                          </View>
                          <View style={styles.scorePointsBadge}>
                            <Text style={styles.scorePointsText}>{item.updatedKabtScore}</Text>
                            <Text style={styles.scorePointsLabel}>נק&apos;</Text>
                          </View>
                        </View>
                        <View style={styles.scoreRow}>
                          <View style={styles.scoreRowLeft}>
                            <View style={[
                              styles.checkIcon,
                              item.updatedCoordinator && styles.checkIconChecked,
                            ]}>
                              {item.updatedCoordinator && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkLabel}>עדכון רכז ביטחון / מנהל</Text>
                          </View>
                          <View style={styles.scorePointsBadge}>
                            <Text style={styles.scorePointsText}>{item.updatedCoordinatorScore}</Text>
                            <Text style={styles.scorePointsLabel}>נק&apos;</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBg}>
                          <Text style={styles.sectionIcon}>⭐</Text>
                        </View>
                        <Text style={styles.sectionTitle}>הערכה מקצועית</Text>
                      </View>
                      <View style={styles.sectionContent}>
                        <View style={styles.professionalRow}>
                          <View style={styles.professionalRowLeft}>
                            <Text style={styles.ratingLabel}>⚡ מהירות תגובה:</Text>
                            <View style={[styles.ratingBadge, getRatingColor(item.responseSpeed)]}>
                              <Text style={styles.ratingBadgeText}>
                                {item.responseSpeed}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.scorePointsBadge}>
                            <Text style={styles.scorePointsText}>{item.responseSpeedScore}</Text>
                            <Text style={styles.scorePointsLabel}>נק&apos;</Text>
                          </View>
                        </View>
                        <View style={styles.professionalRow}>
                          <View style={styles.professionalRowLeft}>
                            <Text style={styles.ratingLabel}>🎯 רמת שליטה במצב:</Text>
                            <View style={[styles.ratingBadge, getRatingColor(item.situationControl)]}>
                              <Text style={styles.ratingBadgeText}>
                                {item.situationControl}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.scorePointsBadge}>
                            <Text style={styles.scorePointsText}>{item.situationControlScore}</Text>
                            <Text style={styles.scorePointsLabel}>נק&apos;</Text>
                          </View>
                        </View>
                        <View style={styles.professionalRow}>
                          <View style={styles.professionalRowLeft}>
                            <Text style={styles.ratingLabel}>💪 ביטחון ועמידה בלחץ:</Text>
                            <View style={[styles.ratingBadge, getRatingColor(item.confidenceUnderPressure)]}>
                              <Text style={styles.ratingBadgeText}>
                                {item.confidenceUnderPressure}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.scorePointsBadge}>
                            <Text style={styles.scorePointsText}>{item.confidenceUnderPressureScore}</Text>
                            <Text style={styles.scorePointsLabel}>נק&apos;</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBg}>
                          <Text style={styles.sectionIcon}>📝</Text>
                        </View>
                        <Text style={styles.sectionTitle}>סיכום קב&quot;ט</Text>
                      </View>
                      <View style={styles.sectionContent}>
                        {item.toMaintain && (
                          <View style={styles.summaryItem}>
                            <View style={styles.summaryItemHeader}>
                              <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} />
                              <Text style={styles.summaryLabelGreen}>לשימור:</Text>
                            </View>
                            <View style={styles.summaryTextBox}>
                              <Text style={styles.summaryText}>{item.toMaintain}</Text>
                            </View>
                          </View>
                        )}
                        {item.toImprove && (
                          <View style={styles.summaryItem}>
                            <View style={styles.summaryItemHeader}>
                              <TrendingUp size={16} color="#F59E0B" strokeWidth={2.5} />
                              <Text style={styles.summaryLabelOrange}>לשיפור:</Text>
                            </View>
                            <View style={styles.summaryTextBox}>
                              <Text style={styles.summaryText}>{item.toImprove}</Text>
                            </View>
                          </View>
                        )}
                        {item.additionalNotes && (
                          <View style={styles.summaryItem}>
                            <View style={styles.summaryItemHeader}>
                              <Text style={styles.summaryEmoji}>💭</Text>
                              <Text style={styles.summaryLabelBlue}>הערות נוספות:</Text>
                            </View>
                            <View style={styles.summaryTextBox}>
                              <Text style={styles.summaryText}>{item.additionalNotes}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                    {item.guardSignature && (
                      <View style={styles.signatureContainer}>
                        <Text style={styles.signatureLabel}>חתימת המאבטח:</Text>
                        <Text style={styles.signatureText}>{item.guardSignature}</Text>
                      </View>
                    )}

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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  guardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  guardInfo: {
    flex: 1,
  },
  guardName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  guardId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  headerLeft: {
    marginLeft: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  instructor: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  sectionContent: {
    gap: 8,
  },
  descriptionBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  scoreRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  scorePointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  scorePointsText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scorePointsLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  professionalRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    gap: 8,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
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
    fontSize: 12,
    fontWeight: '700' as const,
  },
  checkLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryEmoji: {
    fontSize: 16,
  },
  summaryLabelGreen: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  summaryLabelOrange: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  summaryLabelBlue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  summaryTextBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  signatureContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    borderStyle: 'dashed' as const,
  },
  signatureLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
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
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
