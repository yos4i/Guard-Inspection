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
import { History, ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import { RatingValue } from '@/constants/types';

export default function HistoryScreen() {
  const { guardId } = useLocalSearchParams<{ guardId: string }>();
  const { guards, getGuardInspections, deleteInspection } = useGuards();
  const [expandedInspectionId, setExpandedInspectionId] = useState<string | null>(null);

  const guard = guards.find(g => g.id === guardId);
  const inspections = getGuardInspections(guardId || '');

  if (!guard) {
    return (
      <View style={styles.container}>
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

  const getRatingColor = (rating: RatingValue) => {
    switch (rating) {
      case 'excellent':
        return '#10B981';
      case 'good':
        return '#F59E0B';
      case 'needs_improvement':
        return '#EF4444';
    }
  };

  const getRatingText = (rating: RatingValue) => {
    switch (rating) {
      case 'excellent':
        return 'מצוין';
      case 'good':
        return 'טוב';
      case 'needs_improvement':
        return 'דרוש שיפור';
    }
  };

  const calculateInspectionScore = (inspection: any) => {
    const getStandardScore = (rating: RatingValue) => {
      switch (rating) {
        case 'excellent':
          return 7;
        case 'good':
          return 3.5;
        case 'needs_improvement':
          return 0;
      }
    };

    const getProcedureScore = (rating: RatingValue) => {
      switch (rating) {
        case 'excellent':
          return 30;
        case 'good':
          return 15;
        case 'needs_improvement':
          return 0;
      }
    };

    let totalScore = 0;

    totalScore += getStandardScore(inspection.uniformComplete);
    totalScore += getStandardScore(inspection.guardBadgeValid);
    totalScore += getStandardScore(inspection.personalWeapon);
    totalScore += getStandardScore(inspection.fullMagazine);

    totalScore += getStandardScore(inspection.validCommunication);
    totalScore += getStandardScore(inspection.entranceGateOperational);
    totalScore += getStandardScore(inspection.scanLogComplete);
    totalScore += getStandardScore(inspection.proceduresBooklet);

    if (inspection.selectedProcedures && inspection.selectedProcedures.length > 0) {
      inspection.selectedProcedures.forEach((proc: any) => {
        totalScore += getProcedureScore(proc.rating);
      });
    }

    totalScore += getStandardScore(inspection.entranceProcedures);
    totalScore += getStandardScore(inspection.securityOfficerKnowledge);

    return totalScore;
  };

  const getScoreColor = (score: number) => {
    if (score > 80) {
      return '#10B981';
    } else if (score >= 60) {
      return '#F59E0B';
    } else {
      return '#EF4444';
    }
  };

  const RatingItem = ({ rating, label }: { rating: RatingValue; label: string }) => (
    <View style={styles.ratingItem}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={[
        styles.ratingBadge,
        { backgroundColor: getRatingColor(rating) },
      ]}>
        <Text style={styles.ratingBadgeText}>{getRatingText(rating)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'היסטוריית בקרות',
          headerBackTitle: 'חזור',
        }}
      />

      <View style={styles.header}>
        <Text style={styles.guardName}>
          {guard.firstName} {guard.lastName}
        </Text>
        <Text style={styles.guardId}>ת.ז: {guard.idNumber}</Text>
        <Text style={styles.totalInspections}>
          סה״כ בקרות: {inspections.length}
        </Text>
      </View>

      {inspections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <History size={60} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>אין בקרות</Text>
          <Text style={styles.emptyText}>טרם בוצעו בקרות למאבטח זה</Text>
        </View>
      ) : (
        <FlatList
          data={inspections}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isExpanded = expandedInspectionId === item.id;
            
            return (
              <View style={styles.card}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedInspectionId(isExpanded ? null : item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[
                      styles.scoreContainer,
                      { backgroundColor: getScoreColor(calculateInspectionScore(item)) + '20' },
                    ]}>
                      <Text style={[
                        styles.scoreValue,
                        { color: getScoreColor(calculateInspectionScore(item)) },
                      ]}>{calculateInspectionScore(item)}</Text>
                      <Text style={[
                        styles.scoreLabel,
                        { color: getScoreColor(calculateInspectionScore(item)) },
                      ]}>ציון</Text>
                    </View>
                    <View style={styles.headerCenter}>
                      <Text style={styles.date}>{formatDate(item.date)}</Text>
                      <Text style={styles.inspector}>קב&quot;ט מבקר: {item.inspectorName}</Text>
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
                      <Text style={styles.sectionTitle}>1. הופעה וציוד אישי</Text>
                      <View style={styles.sectionContent}>
                        <RatingItem
                          rating={item.uniformComplete}
                          label="מדים תקניים (מכנס, חולצה, חגורה, נעליים סגורות)"
                        />
                        <RatingItem
                          rating={item.guardBadgeValid}
                          label="תעודת מאבטח גלויה בתוקף"
                        />
                        <RatingItem
                          rating={item.personalWeapon}
                          label="נשק אישי + נרתיק"
                        />
                        <RatingItem
                          rating={item.fullMagazine}
                          label="מחסנית מלאה + פונדה"
                        />
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>2. עמדת השמירה</Text>
                      <View style={styles.sectionContent}>
                        <RatingItem
                          rating={item.validCommunication}
                          label="קשר תקין / מכשיר טעון"
                        />
                        <RatingItem
                          rating={item.entranceGateOperational}
                          label="שער כניסה תקין ופועל"
                        />
                        <RatingItem
                          rating={item.scanLogComplete}
                          label="יומן סריקות מלא ועדכני"
                        />
                        <RatingItem
                          rating={item.proceduresBooklet}
                          label="חוברת נהלים נגישה בעמדה"
                        />
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>3. נהלים והכרת השגרה</Text>
                      <View style={styles.sectionContent}>
                        {item.selectedProcedures && item.selectedProcedures.length > 0 ? (
                          <View style={styles.proceduresContainer}>
                            <Text style={styles.proceduresTitle}>ביצוע נוהל לבחירת הקב״ט (מבחן ידע קצר)</Text>
                            {item.selectedProcedures?.map((proc, index) => (
                              <View key={index} style={styles.procedureItem}>
                                <Text style={styles.procedureName}>{proc.procedure}</Text>
                                <View style={[
                                  styles.ratingBadge,
                                  { backgroundColor: getRatingColor(proc.rating) },
                                ]}>
                                  <Text style={styles.ratingBadgeText}>{getRatingText(proc.rating)}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.noProcedures}>לא נבחרו נהלים</Text>
                        )}
                        <RatingItem
                          rating={item.entranceProcedures}
                          label="בקיאות בנהלי הכניסה למוסד"
                        />
                        <RatingItem
                          rating={item.securityOfficerKnowledge}
                          label="בדיקת היכרות רכז הביטחון + מנהל בית הספר"
                        />
                      </View>
                    </View>

                    {item.inspectorNotes ? (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>הערות הקב&quot;ט:</Text>
                        <Text style={styles.notesText}>{item.inspectorNotes}</Text>
                      </View>
                    ) : null}

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
                        if (confirm('האם אתה בטוח שברצונך למחוק בקרה זו?')) {
                          deleteInspection(item.id);
                        }
                      }}
                    >
                      <Trash2 size={18} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.deleteButtonText}>מחק בקרה</Text>
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
  totalInspections: {
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
  inspector: {
    fontSize: 14,
    color: '#6B7280',
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
  notesContainer: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 6,
  },
  notesText: {
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
  proceduresContainer: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  proceduresTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  procedureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingRight: 12,
    gap: 10,
  },
  procedureName: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  noProcedures: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic' as const,
    marginBottom: 8,
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
