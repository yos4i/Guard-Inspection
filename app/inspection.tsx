import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useGuards } from '@/contexts/GuardsProvider';
import { ClipboardCheck, CheckCircle2, Download } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

export default function InspectionScreen() {
  const router = useRouter();
  const { guardId } = useLocalSearchParams<{ guardId: string }>();
  const { guards, addInspection } = useGuards();

  const guard = guards.find(g => g.id === guardId);

  const [inspectorName, setInspectorName] = useState('');
  
  const [uniformComplete, setUniformComplete] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  const [guardBadgeValid, setGuardBadgeValid] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  const [personalWeapon, setPersonalWeapon] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  const [fullMagazine, setFullMagazine] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  
  const [validCommunication, setValidCommunication] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  const [entranceGateOperational, setEntranceGateOperational] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  const [scanLogComplete, setScanLogComplete] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  const [proceduresBooklet, setProceduresBooklet] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  
  const [selectedProcedures, setSelectedProcedures] = useState<{procedure: string; rating: 'needs_improvement' | 'good' | 'excellent'}[]>([]);
  const [showProceduresDropdown, setShowProceduresDropdown] = useState(false);
  
  const procedureOptions = [
    'פתיחה באש',
    'לחימה בעת תקרית',
    'הודעה אנונימית',
    'ירי תמס',
    'שריפה',
  ];
  const [entranceProcedures, setEntranceProcedures] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  const [securityOfficerKnowledge, setSecurityOfficerKnowledge] = useState<'needs_improvement' | 'good' | 'excellent'>('excellent');
  
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [guardSignature, setGuardSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!guard) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>מאבטח לא נמצא</Text>
      </View>
    );
  }

  const RatingItem = ({
    value,
    onChange,
    label,
  }: {
    value: 'needs_improvement' | 'good' | 'excellent';
    onChange: (value: 'needs_improvement' | 'good' | 'excellent') => void;
    label: string;
  }) => {
    return (
      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>{label}</Text>
        <View style={styles.ratingButtons}>
          <TouchableOpacity
            style={[
              styles.ratingButton,
              styles.needsImprovementButton,
              value === 'needs_improvement' && styles.needsImprovementButtonActive,
            ]}
            onPress={() => onChange('needs_improvement')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.ratingButtonText,
              value === 'needs_improvement' && styles.ratingButtonTextActive,
            ]}>
              דרוש שיפור
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.ratingButton,
              styles.goodButton,
              value === 'good' && styles.goodButtonActive,
            ]}
            onPress={() => onChange('good')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.ratingButtonText,
              value === 'good' && styles.ratingButtonTextActive,
            ]}>
              טוב
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.ratingButton,
              styles.excellentButton,
              value === 'excellent' && styles.excellentButtonActive,
            ]}
            onPress={() => onChange('excellent')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.ratingButtonText,
              value === 'excellent' && styles.ratingButtonTextActive,
            ]}>
              מצוין
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const calculateScore = (rating: 'needs_improvement' | 'good' | 'excellent', isProcedure: boolean = false): number => {
    if (isProcedure) {
      switch (rating) {
        case 'excellent':
          return 30;
        case 'good':
          return 15;
        case 'needs_improvement':
          return 0;
      }
    }
    
    switch (rating) {
      case 'excellent':
        return 7;
      case 'good':
        return 3.5;
      case 'needs_improvement':
        return 0;
    }
  };

  const getTotalScore = (): { category1: number; category2: number; category3: number; total: number } => {
    const category1 = [
      uniformComplete,
      guardBadgeValid,
      personalWeapon,
      fullMagazine,
    ].reduce((sum, rating) => sum + calculateScore(rating), 0);

    const category2 = [
      validCommunication,
      entranceGateOperational,
      scanLogComplete,
      proceduresBooklet,
    ].reduce((sum, rating) => sum + calculateScore(rating), 0);

    const proceduresScore = selectedProcedures.reduce(
      (sum, item) => sum + calculateScore(item.rating, true),
      0
    );
    const category3 = proceduresScore + calculateScore(entranceProcedures) + calculateScore(securityOfficerKnowledge);

    const total = category1 + category2 + category3;

    return { category1, category2, category3, total };
  };

  const scores = getTotalScore();

  const generateHTMLReport = () => {
    const getRatingLabel = (rating: 'needs_improvement' | 'good' | 'excellent') => {
      switch (rating) {
        case 'excellent': return 'מצוין';
        case 'good': return 'טוב';
        case 'needs_improvement': return 'דרוש שיפור';
      }
    };

    const getRatingColor = (rating: 'needs_improvement' | 'good' | 'excellent') => {
      switch (rating) {
        case 'excellent': return '#10B981';
        case 'good': return '#F59E0B';
        case 'needs_improvement': return '#EF4444';
      }
    };

    return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>טופס בקרה למאבטח - ${guard.firstName} ${guard.lastName}</title>
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
    <h1>טופס בקרה למאבטח</h1>
  </div>

  <div class="guard-info">
    <h2>${guard.firstName} ${guard.lastName}</h2>
    <p><strong>ת.ז:</strong> ${guard.idNumber}</p>
  </div>

  <div class="inspector-info">
    <p><strong>שם הקב"ט המבקר:</strong> ${inspectorName || '---'}</p>
    <p><strong>תאריך הבקרה:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
  </div>

  <div class="section">
    <div class="section-title">1. הופעה וציוד אישי</div>
    <div class="rating-row">
      <span class="rating-label">מדים תקניים (מכנס, חולצה, חגורה, נעליים סגורות)</span>
      <span class="rating-value" style="background-color: ${getRatingColor(uniformComplete)}">${getRatingLabel(uniformComplete)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">תעודת מאבטח גלויה בתוקף</span>
      <span class="rating-value" style="background-color: ${getRatingColor(guardBadgeValid)}">${getRatingLabel(guardBadgeValid)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">נשק אישי + נרתיק</span>
      <span class="rating-value" style="background-color: ${getRatingColor(personalWeapon)}">${getRatingLabel(personalWeapon)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">מחסנית מלאה + פונדה</span>
      <span class="rating-value" style="background-color: ${getRatingColor(fullMagazine)}">${getRatingLabel(fullMagazine)}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. עמדת השמירה</div>
    <div class="rating-row">
      <span class="rating-label">קשר תקין / מכשיר טעון</span>
      <span class="rating-value" style="background-color: ${getRatingColor(validCommunication)}">${getRatingLabel(validCommunication)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">שער כניסה תקין ופועל</span>
      <span class="rating-value" style="background-color: ${getRatingColor(entranceGateOperational)}">${getRatingLabel(entranceGateOperational)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">יומן סריקות מלא ועדכני</span>
      <span class="rating-value" style="background-color: ${getRatingColor(scanLogComplete)}">${getRatingLabel(scanLogComplete)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">חוברת נהלים נגישה בעמדה</span>
      <span class="rating-value" style="background-color: ${getRatingColor(proceduresBooklet)}">${getRatingLabel(proceduresBooklet)}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. נהלים והכרת השגרה</div>
    ${selectedProcedures.length > 0 ? `
    <p style="font-weight: 600; margin-bottom: 10px;">נהלים שנבדקו:</p>
    ${selectedProcedures.map(p => `
    <div class="procedure-item">
      <div style="display: flex; justify-content: space-between;">
        <span>${p.procedure}</span>
        <span class="rating-value" style="background-color: ${getRatingColor(p.rating)}">${getRatingLabel(p.rating)}</span>
      </div>
    </div>
    `).join('')}
    ` : '<p style="color: #6B7280;">לא נבחרו נהלים</p>'}
    <div class="rating-row" style="margin-top: 15px;">
      <span class="rating-label">בקיאות בנהלי הכניסה למוסד</span>
      <span class="rating-value" style="background-color: ${getRatingColor(entranceProcedures)}">${getRatingLabel(entranceProcedures)}</span>
    </div>
    <div class="rating-row">
      <span class="rating-label">בדיקת היכרות רכז הביטחון + מנהל בית הספר</span>
      <span class="rating-value" style="background-color: ${getRatingColor(securityOfficerKnowledge)}">${getRatingLabel(securityOfficerKnowledge)}</span>
    </div>
  </div>

  ${inspectorNotes.trim() ? `
  <div class="section">
    <div class="section-title">הערות הקב"ט</div>
    <div class="notes">
      ${inspectorNotes.split('\n').map(line => `<p>${line}</p>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="score-summary">
    <h2 style="text-align: center; color: #2563EB; margin-bottom: 20px;">סיכום ציונים</h2>
    <div class="score-row">
      <span>1. הופעה וציוד אישי:</span>
      <strong>${scores.category1.toFixed(1)} / 28</strong>
    </div>
    <div class="score-row">
      <span>2. עמדת השמירה:</span>
      <strong>${scores.category2.toFixed(1)} / 28</strong>
    </div>
    <div class="score-row">
      <span>3. נהלים והכרת השגרה:</span>
      <strong>${scores.category3.toFixed(1)} / ${(14 + selectedProcedures.length * 30)}</strong>
    </div>
    <div class="score-row total-score">
      <span>ציון כולל:</span>
      <strong>${scores.total.toFixed(1)} / ${(56 + selectedProcedures.length * 30)} (${((scores.total / (56 + selectedProcedures.length * 30)) * 100).toFixed(1)}%)</strong>
    </div>
  </div>

  <div class="signature-section">
    <p><strong>חתימת המאבטח:</strong> ${guardSignature || '_______________'}</p>
  </div>

  <div class="date">
    מסמך זה הופק ב-${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}
  </div>
</body>
</html>`;
  };

  const handleExport = async () => {
    try {
      const htmlContent = generateHTMLReport();
      const fileName = `בקרה_${guard.firstName}_${guard.lastName}_${new Date().toISOString().split('T')[0]}.html`;

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

        const file = new File(Paths.cache, fileName);
        file.write(htmlContent);

        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/html',
          dialogTitle: 'ייצוא טופס בקרה',
          UTI: 'public.html',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('שגיאה', 'נכשל בייצוא הקובץ');
    }
  };

  const handleSubmit = async () => {
    if (!inspectorName.trim()) {
      Alert.alert('שגיאה', 'נא להזין שם הקב"ט המבקר');
      return;
    }

    setIsSubmitting(true);
    try {
      await addInspection({
        guardId: guard.id,
        inspectorName: inspectorName.trim(),
        uniformComplete,
        guardBadgeValid,
        personalWeapon,
        fullMagazine,
        validCommunication,
        entranceGateOperational,
        scanLogComplete,
        proceduresBooklet,
        selectedProcedures,
        entranceProcedures,
        securityOfficerKnowledge,
        inspectorNotes: inspectorNotes.trim(),
        guardSignature: guardSignature.trim(),
      });

      Alert.alert('הצלחה', 'הבקרה נשמרה בהצלחה', [
        {
          text: 'אישור',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('שגיאה', 'נכשל בשמירת הבקרה');
      console.error('Failed to save inspection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'טופס בקרה למאבטח',
          headerBackTitle: 'חזור',
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <ClipboardCheck size={48} color="#2563EB" strokeWidth={1.5} />
          <Text style={styles.title}>טופס בקרה למאבטח</Text>
          <View style={styles.guardInfoCard}>
            <Text style={styles.guardName}>
              {guard.firstName} {guard.lastName}
            </Text>
            <Text style={styles.guardId}>ת.ז: {guard.idNumber}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>שם הקב&quot;ט המבקר *</Text>
            <TextInput
              style={styles.input}
              value={inspectorName}
              onChangeText={setInspectorName}
              placeholder="הזן שם מלא של המבקר"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. הופעה וציוד אישי</Text>
            <View style={styles.sectionContent}>
              <RatingItem
                value={uniformComplete}
                onChange={setUniformComplete}
                label="מדים תקניים (מכנס, חולצה, חגורה, נעליים סגורות)"
              />
              <RatingItem
                value={guardBadgeValid}
                onChange={setGuardBadgeValid}
                label="תעודת מאבטח גלויה בתוקף"
              />
              <RatingItem
                value={personalWeapon}
                onChange={setPersonalWeapon}
                label="נשק אישי + נרתיק"
              />
              <RatingItem
                value={fullMagazine}
                onChange={setFullMagazine}
                label="מחסנית מלאה + פונדה"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. עמדת השמירה</Text>
            <View style={styles.sectionContent}>
              <RatingItem
                value={validCommunication}
                onChange={setValidCommunication}
                label="קשר תקין / מכשיר טעון"
              />
              <RatingItem
                value={entranceGateOperational}
                onChange={setEntranceGateOperational}
                label="שער כניסה תקין ופועל"
              />
              <RatingItem
                value={scanLogComplete}
                onChange={setScanLogComplete}
                label="יומן סריקות מלא ועדכני"
              />
              <RatingItem
                value={proceduresBooklet}
                onChange={setProceduresBooklet}
                label="חוברת נהלים נגישה בעמדה"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. נהלים והכרת השגרה</Text>
            <View style={styles.sectionContent}>
              <View style={styles.procedureSection}>
                <Text style={styles.ratingLabel}>ביצוע נוהל לבחירת הקב״ט (מבחן ידע קצר)</Text>
                
                <TouchableOpacity
                  style={styles.procedureDropdownButton}
                  onPress={() => setShowProceduresDropdown(!showProceduresDropdown)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.procedureDropdownButtonText}>
                    {selectedProcedures.length > 0 
                      ? `נבחרו ${selectedProcedures.length} נהלים`
                      : 'בחר נהלים'}
                  </Text>
                  <Text style={styles.arrowIcon}>{showProceduresDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showProceduresDropdown && (
                  <View style={styles.procedureDropdown}>
                    {procedureOptions.map((procedure) => {
                      const isSelected = selectedProcedures.some(p => p.procedure === procedure);
                      return (
                        <TouchableOpacity
                          key={procedure}
                          style={styles.procedureOption}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedProcedures(prev => prev.filter(p => p.procedure !== procedure));
                            } else {
                              setSelectedProcedures(prev => [...prev, { procedure, rating: 'excellent' }]);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}>
                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <Text style={styles.procedureOptionText}>{procedure}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {selectedProcedures.length > 0 && (
                  <View style={styles.selectedProceduresContainer}>
                    {selectedProcedures.map((item, index) => (
                      <View key={item.procedure} style={styles.selectedProcedureCard}>
                        <View style={styles.selectedProcedureHeader}>
                          <Text style={styles.selectedProcedureTitle}>{item.procedure}</Text>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedProcedures(prev => prev.filter((_, i) => i !== index));
                            }}
                            style={styles.removeButton}
                          >
                            <Text style={styles.removeButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <View style={styles.ratingButtons}>
                          <TouchableOpacity
                            style={[
                              styles.ratingButton,
                              styles.needsImprovementButton,
                              item.rating === 'needs_improvement' && styles.needsImprovementButtonActive,
                            ]}
                            onPress={() => {
                              setSelectedProcedures(prev => {
                                const updated = [...prev];
                                updated[index] = { ...updated[index], rating: 'needs_improvement' };
                                return updated;
                              });
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.ratingButtonText,
                              item.rating === 'needs_improvement' && styles.ratingButtonTextActive,
                            ]}>
                              דרוש שיפור
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[
                              styles.ratingButton,
                              styles.goodButton,
                              item.rating === 'good' && styles.goodButtonActive,
                            ]}
                            onPress={() => {
                              setSelectedProcedures(prev => {
                                const updated = [...prev];
                                updated[index] = { ...updated[index], rating: 'good' };
                                return updated;
                              });
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.ratingButtonText,
                              item.rating === 'good' && styles.ratingButtonTextActive,
                            ]}>
                              טוב
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[
                              styles.ratingButton,
                              styles.excellentButton,
                              item.rating === 'excellent' && styles.excellentButtonActive,
                            ]}
                            onPress={() => {
                              setSelectedProcedures(prev => {
                                const updated = [...prev];
                                updated[index] = { ...updated[index], rating: 'excellent' };
                                return updated;
                              });
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.ratingButtonText,
                              item.rating === 'excellent' && styles.ratingButtonTextActive,
                            ]}>
                              מצוין
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <RatingItem
                value={entranceProcedures}
                onChange={setEntranceProcedures}
                label="בקיאות בנהלי הכניסה למוסד"
              />
              <RatingItem
                value={securityOfficerKnowledge}
                onChange={setSecurityOfficerKnowledge}
                label="בדיקת היכרות רכז הביטחון + מנהל בית הספר"
              />
            </View>
          </View>

          <View style={styles.signaturesSection}>
            <Text style={styles.signaturesSectionTitle}>הערות וחתימות</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>הערות הקב&quot;ט</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={inspectorNotes}
                onChangeText={setInspectorNotes}
                placeholder="הזן הערות נוספות (אופציונלי)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>חתימת המאבטח</Text>
              <TextInput
                style={styles.input}
                value={guardSignature}
                onChangeText={setGuardSignature}
                placeholder="שם מלא של המאבטח"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>סיכום ציונים</Text>
            </View>
            
            <View style={styles.scoreBreakdown}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>1. הופעה וציוד אישי</Text>
                <View style={styles.scoreValueContainer}>
                  <Text style={styles.scoreValue}>{scores.category1.toFixed(1)}</Text>
                  <Text style={styles.scoreMax}>/ 28</Text>
                </View>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>2. עמדת השמירה</Text>
                <View style={styles.scoreValueContainer}>
                  <Text style={styles.scoreValue}>{scores.category2.toFixed(1)}</Text>
                  <Text style={styles.scoreMax}>/ 28</Text>
                </View>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>3. נהלים והכרת השגרה</Text>
                <View style={styles.scoreValueContainer}>
                  <Text style={styles.scoreValue}>{scores.category3.toFixed(1)}</Text>
                  <Text style={styles.scoreMax}>/ {(14 + selectedProcedures.length * 30)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.totalScoreContainer}>
              <Text style={styles.totalScoreLabel}>ציון כולל</Text>
              <View style={styles.totalScoreBox}>
                <Text style={styles.totalScoreValue}>{scores.total.toFixed(1)}</Text>
                <Text style={styles.totalScoreMax}>/ {(56 + selectedProcedures.length * 30)}</Text>
              </View>
            </View>
            
            <View style={styles.scorePercentageContainer}>
              <View style={styles.percentageBarBackground}>
                <View 
                  style={[
                    styles.percentageBarFill,
                    { width: `${Math.min(100, (scores.total / (56 + selectedProcedures.length * 30)) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.percentageText}>
                {((scores.total / (56 + selectedProcedures.length * 30)) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.exportButton]}
              onPress={handleExport}
            >
              <Download size={20} color="#2563EB" />
              <Text style={styles.exportButtonText}>ייצוא לקובץ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'שומר...' : 'שמור בקרה'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 16,
  },
  guardInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  guardId: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    gap: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionContent: {
    padding: 12,
  },
  ratingRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ratingLabel: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 10,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  needsImprovementButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  needsImprovementButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  goodButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  goodButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  excellentButton: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  excellentButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  ratingButtonTextActive: {
    color: '#FFFFFF',
  },
  signaturesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signaturesSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  exportButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 24,
  },
  procedureSection: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  procedureDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  procedureDropdownButtonText: {
    fontSize: 15,
    color: '#374151',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  procedureDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
    maxHeight: 240,
  },
  procedureOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
    minHeight: 48,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  procedureOptionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    flexWrap: 'wrap',
  },
  selectedProceduresContainer: {
    marginTop: 12,
    gap: 12,
  },
  selectedProcedureCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  selectedProcedureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedProcedureTitle: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600' as const,
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  scoreHeader: {
    marginBottom: 20,
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  scoreBreakdown: {
    gap: 16,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scoreLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600' as const,
    flex: 1,
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  scoreMax: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600' as const,
  },
  totalScoreContainer: {
    marginTop: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  totalScoreLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  totalScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalScoreValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  totalScoreMax: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600' as const,
  },
  scorePercentageContainer: {
    marginTop: 16,
    gap: 12,
  },
  percentageBarBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  percentageBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#10B981',
    textAlign: 'center',
  },
});
