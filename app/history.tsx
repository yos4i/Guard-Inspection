import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useGuards } from '@/contexts/GuardsProvider';
import { History, ChevronDown, ChevronUp, Trash2, Download } from 'lucide-react-native';
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
        <Text style={styles.errorText}>ביקורות לא נמצאה</Text>
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

  const generateHTMLReport = (inspection: any) => {
    const getRatingLabel = (rating: RatingValue) => {
      switch (rating) {
        case 'excellent': return 'מצוין';
        case 'good': return 'טוב';
        case 'needs_improvement': return 'דרוש שיפור';
      }
    };

    const getRatingColorForHTML = (rating: RatingValue) => {
      switch (rating) {
        case 'excellent': return '#10B981';
        case 'good': return '#F59E0B';
        case 'needs_improvement': return '#EF4444';
      }
    };

    const scores = {
      category1: calculateInspectionScore(inspection),
      category2: 0,
      category3: 0,
      total: calculateInspectionScore(inspection),
    };

    return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>טופס ביקורות - ${guard.firstName} ${guard.lastName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .header {
      text-align: center;
      background-color: #2563EB;
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 15px 0;
      font-size: 28px;
    }
    .guard-info {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .guard-info h2 {
      margin: 0 0 10px 0;
      color: #1F2937;
    }
    .inspector-info {
      background-color: #EEF2FF;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .section {
      background-color: white;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #2563EB;
      border-bottom: 2px solid #2563EB;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .rating-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .rating-row:last-child {
      border-bottom: none;
    }
    .rating-label {
      font-weight: 500;
      color: #374151;
    }
    .rating-value {
      font-weight: bold;
      padding: 4px 12px;
      border-radius: 6px;
      color: white;
    }
    .score-summary {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      padding: 25px;
      border-radius: 12px;
      margin-top: 30px;
      border: 2px solid #2563EB;
    }
    .score-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 16px;
    }
    .total-score {
      font-size: 22px;
      font-weight: bold;
      color: #2563EB;
      border-top: 2px solid #2563EB;
      padding-top: 15px;
      margin-top: 15px;
    }
    .notes {
      background-color: #FFFBEB;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
      border-right: 4px solid #F59E0B;
    }
    .procedure-item {
      background-color: #F9FAFB;
      padding: 12px;
      border-radius: 6px;
      margin: 8px 0;
      border-right: 3px solid #6B7280;
    }
    .signature-section {
      margin-top: 30px;
      padding: 20px;
      background-color: #F9FAFB;
      border-radius: 8px;
    }
    .date {
      text-align: center;
      color: #6B7280;
      margin-top: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>טופס ביקורות</h1>
  </div>

  <div class="guard-info">
    <h2>${guard.firstName} ${guard.lastName}</h2>
    <p><strong>ת.ז:</strong> ${guard.idNumber}</p>
  </div>

  <div class="inspector-info">
    <p><strong>שם הקב"ט המבקר:</strong> ${inspection.inspectorName || '---'}</p>
    <p><strong>תאריך הביקורות:</strong> ${new Date(inspection.date).toLocaleDateString('he-IL')}</p>
  </div>

  <div class="section">
    <div class="section-title">1. הופעה וציוד אישי</div>
    <div class="rating-row">
      <span class="rating-label">מדים תקניים (מכנס, חולצה, חגורה, נעליים סגורות)</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.uniformComplete)}">${getRatingLabel(inspection.uniformComplete)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">תעודת מאבטח גלויה בתוקף</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.guardBadgeValid)}">${getRatingLabel(inspection.guardBadgeValid)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">נשק אישי + נרתיק</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.personalWeapon)}">${getRatingLabel(inspection.personalWeapon)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">מחסנית מלאה + פונדה</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.fullMagazine)}">${getRatingLabel(inspection.fullMagazine)}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. עמדת השמירה</div>
    <div class="rating-row">
      <span class="rating-label">קשר תקין / מכשיר טעון</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.validCommunication)}">${getRatingLabel(inspection.validCommunication)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">שער כניסה תקין ופועל</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.entranceGateOperational)}">${getRatingLabel(inspection.entranceGateOperational)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">יומן סריקות מלא ועדכני</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.scanLogComplete)}">${getRatingLabel(inspection.scanLogComplete)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">חוברת נהלים נגישה בעמדה</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.proceduresBooklet)}">${getRatingLabel(inspection.proceduresBooklet)}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. נהלים והכרת השגרה</div>
    ${inspection.selectedProcedures && inspection.selectedProcedures.length > 0 ? `
    <p style="font-weight: 600; margin-bottom: 10px;">נהלים שנבדקו:</p>
    ${inspection.selectedProcedures.map((p: any) => `
    <div class="procedure-item">
      <div style="display: flex; justify-content: space-between;">
        <span>${p.procedure}</span>
        <span class="rating-value" style="background-color: ${getRatingColorForHTML(p.rating)}">${getRatingLabel(p.rating)}</span>
      </div>
    </div>
    `).join('')}
    ` : '<p style="color: #6B7280;">לא נבחרו נהלים</p>'}
    <div class="rating-row" style="margin-top: 15px;">
      <span class="rating-label">בקיאות בנהלי הכניסה למוסד</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.entranceProcedures)}">${getRatingLabel(inspection.entranceProcedures)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">בדיקת היכרות רכז הביטחון + מנהל בית הספר</span>
      <span class="rating-value" style="background-color: ${getRatingColorForHTML(inspection.securityOfficerKnowledge)}">${getRatingLabel(inspection.securityOfficerKnowledge)}</span>
    </div>
  </div>

  ${inspection.inspectorNotes && inspection.inspectorNotes.trim() ? `
  <div class="section">
    <div class="section-title">הערות הקב"ט</div>
    <div class="notes">
      ${inspection.inspectorNotes.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="score-summary">
    <h2 style="text-align: center; color: #2563EB; margin-bottom: 20px;">סיכום ציונים</h2>
    <div class="score-row total-score">
      <span>ציון כולל:</span>
      <strong>${scores.total.toFixed(1)}</strong>
    </div>
  </div>

  <div class="signature-section">
    <p><strong>חתימת המאבטח:</strong> ${inspection.guardSignature || '_______________'}</p>
  </div>

  <div class="date">
    מסמך זה הופק ב-${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}
  </div>
</body>
</html>`;
  };

  const handleExport = async (inspection: any) => {
    try {
      const htmlContent = generateHTMLReport(inspection);
      const fileName = `ביקורות_${guard.firstName}_${guard.lastName}_${new Date(inspection.date).toISOString().split('T')[0]}.html`;

      if (Platform.OS === 'web') {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('הצלחה', 'הקובץ יוצא בהצלחה');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert('שגיאה', 'שיתוף קבצים אינו זמין במכשיר זה');
          return;
        }

        const fsAny = FileSystem as any;
        if (!fsAny.documentDirectory) {
          throw new Error('Document directory not available');
        }
        const fileUri = fsAny.documentDirectory + fileName;
        await fsAny.writeAsStringAsync(fileUri, htmlContent);

        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'ייצוא טופס ביקורות',
          UTI: 'public.html',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('שגיאה', 'נכשל בייצוא הקובץ');
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
          title: 'היסטוריית ביקורות',
          headerBackTitle: 'חזור',
        }}
      />

      <View style={styles.header}>
        <Text style={styles.guardName}>
          {guard.firstName} {guard.lastName}
        </Text>
        <Text style={styles.guardId}>ת.ז: {guard.idNumber}</Text>
        <Text style={styles.totalInspections}>
          סה״כ ביקורות: {inspections.length}
        </Text>
      </View>

      {inspections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <History size={60} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>אין ביקורות</Text>
          <Text style={styles.emptyText}>טרם בוצעו ביקורות למאבטח זה</Text>
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
                            {item.selectedProcedures?.map((proc: any, index: number) => (
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

                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        style={styles.exportButton}
                        activeOpacity={0.7}
                        onPress={() => handleExport(item)}
                      >
                        <Download size={18} color="#2563EB" strokeWidth={2} />
                        <Text style={styles.exportButtonText}>ייצא קובץ</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (confirm('האם אתה בטוח שברצונך למחוק ביקורות זו?')) {
                            deleteInspection(item.id);
                          }
                        }}
                      >
                        <Trash2 size={18} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.deleteButtonText}>מחק ביקורות</Text>
                      </TouchableOpacity>
                    </View>
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
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
