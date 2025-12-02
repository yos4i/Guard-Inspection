import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGuards } from '@/contexts/GuardsProvider';
import { Dumbbell } from 'lucide-react-native';

type ExerciseTypeOption = 'כניסה בכיסוי' | 'חפץ חשוד' | 'אדם חשוד' | 'אחר';
type RatingLevel = 'מצוין' | 'טוב' | 'צריך שיפור';

export default function NewExerciseScreen() {
  const { guardId } = useLocalSearchParams<{ guardId: string }>();
  const { guards, addExercise } = useGuards();
  const router = useRouter();

  const guard = guards.find(g => g.id === guardId);

  const [instructorName, setInstructorName] = useState('');
  const [exerciseType, setExerciseType] = useState<ExerciseTypeOption>('כניסה בכיסוי');
  const [otherExerciseType, setOtherExerciseType] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  
  const [identifiedThreat, setIdentifiedThreat] = useState(false);
  const [reportedOnRadio, setReportedOnRadio] = useState(false);
  const [updatedKabt, setUpdatedKabt] = useState(false);
  const [updatedCoordinator, setUpdatedCoordinator] = useState(false);
  
  const [identifiedThreatScore, setIdentifiedThreatScore] = useState('10');
  const [reportedOnRadioScore, setReportedOnRadioScore] = useState('10');
  const [updatedKabtScore, setUpdatedKabtScore] = useState('10');
  const [updatedCoordinatorScore, setUpdatedCoordinatorScore] = useState('10');
  
  const [responseSpeed, setResponseSpeed] = useState<RatingLevel>('מצוין');
  const [situationControl, setSituationControl] = useState<RatingLevel>('מצוין');
  const [confidenceUnderPressure, setConfidenceUnderPressure] = useState<RatingLevel>('מצוין');
  const [workedByProcedure, setWorkedByProcedure] = useState<RatingLevel>('מצוין');
  
  const [kabtEvaluation, setKabtEvaluation] = useState('20');
  
  const getRatingScore = (level: RatingLevel): string => {
    switch (level) {
      case 'מצוין': return '10';
      case 'טוב': return '5';
      case 'צריך שיפור': return '0';
    }
  };
  
  const [toMaintain, setToMaintain] = useState('');
  const [toImprove, setToImprove] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [guardSignature, setGuardSignature] = useState('');

  const calculateTotalScore = (): number => {
    const responseScore = [
      parseInt(identifiedThreatScore) || 0,
      parseInt(reportedOnRadioScore) || 0,
      parseInt(updatedKabtScore) || 0,
      parseInt(updatedCoordinatorScore) || 0,
    ].reduce((sum, score) => sum + score, 0);

    const evaluationScore = [
      parseInt(getRatingScore(responseSpeed)),
      parseInt(getRatingScore(situationControl)),
      parseInt(getRatingScore(confidenceUnderPressure)),
      parseInt(getRatingScore(workedByProcedure)),
    ].reduce((sum, score) => sum + score, 0);

    const kabtScore = parseInt(kabtEvaluation) || 0;

    return responseScore + evaluationScore + kabtScore;
  };

  const handleSubmit = async () => {
    if (!instructorName.trim()) {
      Alert.alert('שגיאה', 'נא להזין שם הקב"ט המתרגל');
      return;
    }

    if (exerciseType === 'אחר' && !otherExerciseType.trim()) {
      Alert.alert('שגיאה', 'נא לציין סוג תרגיל אחר');
      return;
    }

    if (!scenarioDescription.trim()) {
      Alert.alert('שגיאה', 'נא להזין תיאור התרחיש');
      return;
    }

    const finalExerciseType = exerciseType === 'אחר' ? otherExerciseType : exerciseType;

    try {
      await addExercise({
        guardId: guardId!,
        instructorName: instructorName.trim(),
        exerciseType: finalExerciseType.trim(),
        scenarioDescription: scenarioDescription.trim(),
        identifiedThreat,
        reportedOnRadio,
        updatedKabt,
        updatedCoordinator,
        identifiedThreatScore: parseInt(identifiedThreatScore) || 0,
        reportedOnRadioScore: parseInt(reportedOnRadioScore) || 0,
        updatedKabtScore: parseInt(updatedKabtScore) || 0,
        updatedCoordinatorScore: parseInt(updatedCoordinatorScore) || 0,
        responseSpeed,
        situationControl,
        confidenceUnderPressure,
        responseSpeedScore: parseInt(getRatingScore(responseSpeed)),
        situationControlScore: parseInt(getRatingScore(situationControl)),
        confidenceUnderPressureScore: parseInt(getRatingScore(confidenceUnderPressure)),
        workedByProcedure,
        workedByProcedureScore: parseInt(getRatingScore(workedByProcedure)),
        kabtEvaluation: parseInt(kabtEvaluation) || 0,
        toMaintain: toMaintain.trim(),
        toImprove: toImprove.trim(),
        additionalNotes: additionalNotes.trim(),
        guardSignature: guardSignature.trim(),
        duration: 0,
        notes: '',
      });

      Alert.alert('הצלחה', 'התרגיל נוסף בהצלחה', [
        {
          text: 'אישור',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת התרגיל');
    }
  };

  if (!guard) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen
          options={{
            title: 'תרגיל חדש',
          }}
        />
        <Text style={styles.errorText}>מאבטח לא נמצא</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'תרגיל חדש',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Dumbbell size={32} color="#DC2626" strokeWidth={2} />
          </View>
          <Text style={styles.guardName}>
            {guard.firstName} {guard.lastName}
          </Text>
          <Text style={styles.guardId}>ת.ז: {guard.idNumber}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>פרטי התרגיל</Text>
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>שם הקב&apos;ט המתרגל *</Text>
                <TextInput
                  style={styles.input}
                  value={instructorName}
                  onChangeText={setInstructorName}
                  placeholder="הזן שם מלא"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>סוג התרגיל *</Text>
                <View style={styles.optionsRow}>
                  {(['כניסה בכיסוי', 'חפץ חשוד', 'אדם חשוד', 'אחר'] as ExerciseTypeOption[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        exerciseType === type && styles.optionButtonSelected,
                      ]}
                      onPress={() => setExerciseType(type)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          exerciseType === type && styles.optionButtonTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {exerciseType === 'אחר' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ציין סוג תרגיל *</Text>
                  <TextInput
                    style={styles.input}
                    value={otherExerciseType}
                    onChangeText={setOtherExerciseType}
                    placeholder="הזן סוג תרגיל"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>תיאור התרחיש (ימולא על ידי קב&apos;ט) *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={scenarioDescription}
                  onChangeText={setScenarioDescription}
                  placeholder="תיאור מפורט של התרחיש..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>תגובת המאבטח</Text>
            <View style={styles.sectionContent}>
              <View style={styles.scoreItemContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIdentifiedThreat(!identifiedThreat)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, identifiedThreat && styles.checkboxChecked]}>
                    {identifiedThreat && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>זיהוי האיום / חשוד</Text>
                </TouchableOpacity>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={styles.scoreInput}
                    value={identifiedThreatScore}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, '');
                      if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 10)) {
                        setIdentifiedThreatScore(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="10"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.scoreLabel}>נק&apos;</Text>
                </View>
              </View>

              <View style={styles.scoreItemContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setReportedOnRadio(!reportedOnRadio)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, reportedOnRadio && styles.checkboxChecked]}>
                    {reportedOnRadio && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>דיווח בקשר</Text>
                </TouchableOpacity>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={styles.scoreInput}
                    value={reportedOnRadioScore}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, '');
                      if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 10)) {
                        setReportedOnRadioScore(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="10"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.scoreLabel}>נק&apos;</Text>
                </View>
              </View>

              <View style={styles.scoreItemContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setUpdatedKabt(!updatedKabt)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, updatedKabt && styles.checkboxChecked]}>
                    {updatedKabt && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>עדכון קב&apos;ט</Text>
                </TouchableOpacity>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={styles.scoreInput}
                    value={updatedKabtScore}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, '');
                      if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 10)) {
                        setUpdatedKabtScore(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="10"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.scoreLabel}>נק&apos;</Text>
                </View>
              </View>

              <View style={styles.scoreItemContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setUpdatedCoordinator(!updatedCoordinator)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, updatedCoordinator && styles.checkboxChecked]}>
                    {updatedCoordinator && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>עדכון רכז ביטחון / מנהל</Text>
                </TouchableOpacity>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={styles.scoreInput}
                    value={updatedCoordinatorScore}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, '');
                      if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 10)) {
                        setUpdatedCoordinatorScore(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="10"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.scoreLabel}>נק&apos;</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>הערכת מקצועית</Text>
            <View style={styles.sectionContent}>
              <View style={styles.ratingGroup}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.ratingLabel}>מהירות תגובה</Text>
                  <View style={styles.scoreDisplay}>
                    <Text style={styles.scoreDisplayText}>{getRatingScore(responseSpeed)}</Text>
                    <Text style={styles.scoreLabel}>נק&apos;</Text>
                  </View>
                </View>
                <View style={styles.ratingButtons}>
                  {(['מצוין', 'טוב', 'צריך שיפור'] as RatingLevel[]).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.ratingButton,
                        level === 'מצוין' && styles.ratingButtonExcellent,
                        level === 'טוב' && styles.ratingButtonGood,
                        level === 'צריך שיפור' && styles.ratingButtonNeedsWork,
                        responseSpeed === level && styles.ratingButtonActive,
                      ]}
                      onPress={() => setResponseSpeed(level)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.ratingButtonText,
                          responseSpeed === level && styles.ratingButtonTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.ratingGroup}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.ratingLabel}>רמת שליטה במצב</Text>
                  <View style={styles.scoreDisplay}>
                    <Text style={styles.scoreDisplayText}>{getRatingScore(situationControl)}</Text>
                    <Text style={styles.scoreLabel}>נק&apos;</Text>
                  </View>
                </View>
                <View style={styles.ratingButtons}>
                  {(['מצוין', 'טוב', 'צריך שיפור'] as RatingLevel[]).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.ratingButton,
                        level === 'מצוין' && styles.ratingButtonExcellent,
                        level === 'טוב' && styles.ratingButtonGood,
                        level === 'צריך שיפור' && styles.ratingButtonNeedsWork,
                        situationControl === level && styles.ratingButtonActive,
                      ]}
                      onPress={() => setSituationControl(level)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.ratingButtonText,
                          situationControl === level && styles.ratingButtonTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.ratingGroup}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.ratingLabel}>ביטחון המאבטח ועמידה בלחץ</Text>
                  <View style={styles.scoreDisplay}>
                    <Text style={styles.scoreDisplayText}>{getRatingScore(confidenceUnderPressure)}</Text>
                    <Text style={styles.scoreLabel}>נק&apos;</Text>
                  </View>
                </View>
                <View style={styles.ratingButtons}>
                  {(['מצוין', 'טוב', 'צריך שיפור'] as RatingLevel[]).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.ratingButton,
                        level === 'מצוין' && styles.ratingButtonExcellent,
                        level === 'טוב' && styles.ratingButtonGood,
                        level === 'צריך שיפור' && styles.ratingButtonNeedsWork,
                        confidenceUnderPressure === level && styles.ratingButtonActive,
                      ]}
                      onPress={() => setConfidenceUnderPressure(level)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.ratingButtonText,
                          confidenceUnderPressure === level && styles.ratingButtonTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.ratingGroup}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.ratingLabel}>עבד על פי נוהל</Text>
                  <View style={styles.scoreDisplay}>
                    <Text style={styles.scoreDisplayText}>{getRatingScore(workedByProcedure)}</Text>
                    <Text style={styles.scoreLabel}>נק&apos;</Text>
                  </View>
                </View>
                <View style={styles.ratingButtons}>
                  {(['מצוין', 'טוב', 'צריך שיפור'] as RatingLevel[]).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.ratingButton,
                        level === 'מצוין' && styles.ratingButtonExcellent,
                        level === 'טוב' && styles.ratingButtonGood,
                        level === 'צריך שיפור' && styles.ratingButtonNeedsWork,
                        workedByProcedure === level && styles.ratingButtonActive,
                      ]}
                      onPress={() => setWorkedByProcedure(level)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.ratingButtonText,
                          workedByProcedure === level && styles.ratingButtonTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>הערכת קב&apos;ט</Text>
            <View style={styles.sectionContent}>
              <View style={styles.kabtEvaluationContainer}>
                <View style={styles.kabtEvaluationHeader}>
                  <Text style={styles.kabtEvaluationLabel}>ציון הערכת קב&apos;ט</Text>
                  <View style={styles.kabtEvaluationInputContainer}>
                    <TextInput
                      style={styles.kabtEvaluationInput}
                      value={kabtEvaluation}
                      onChangeText={(text) => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 20)) {
                          setKabtEvaluation(num);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="20"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.kabtEvaluationScoreText}>מתוך 20 נק'</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>סיכום קב&apos;ט</Text>
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>לשימור</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={toMaintain}
                  onChangeText={setToMaintain}
                  placeholder="מה המאבטח עשה טוב שצריך לשמר?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>לשיפור</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={toImprove}
                  onChangeText={setToImprove}
                  placeholder="מה צריך לשפר?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>הערות נוספות</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                  placeholder="הערות נוספות..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>חתימה</Text>
            <View style={styles.sectionContent}>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>סיכום ציונים</Text>
            <View style={styles.sectionContent}>
              <View style={styles.totalScoreContainer}>
                <View style={styles.totalScoreRow}>
                  <Text style={styles.totalScoreLabel}>סה&apos;כ ציון תגובת המאבטח:</Text>
                  <View style={styles.totalScoreValue}>
                    <Text style={styles.totalScoreNumber}>
                      {[
                        parseInt(identifiedThreatScore) || 0,
                        parseInt(reportedOnRadioScore) || 0,
                        parseInt(updatedKabtScore) || 0,
                        parseInt(updatedCoordinatorScore) || 0,
                      ].reduce((sum, score) => sum + score, 0)}
                    </Text>
                    <Text style={styles.totalScoreText}>מתוך 40 נק'</Text>
                  </View>
                </View>

                <View style={styles.totalScoreRow}>
                  <Text style={styles.totalScoreLabel}>סה&apos;כ ציון הערכה מקצועית:</Text>
                  <View style={styles.totalScoreValue}>
                    <Text style={styles.totalScoreNumber}>
                      {[
                        parseInt(getRatingScore(responseSpeed)),
                        parseInt(getRatingScore(situationControl)),
                        parseInt(getRatingScore(confidenceUnderPressure)),
                        parseInt(getRatingScore(workedByProcedure)),
                      ].reduce((sum, score) => sum + score, 0)}
                    </Text>
                    <Text style={styles.totalScoreText}>מתוך 40 נק'</Text>
                  </View>
                </View>

                <View style={styles.totalScoreRow}>
                  <Text style={styles.totalScoreLabel}>ציון הערכת קב&apos;ט:</Text>
                  <View style={styles.totalScoreValue}>
                    <Text style={styles.totalScoreNumber}>{parseInt(kabtEvaluation) || 0}</Text>
                    <Text style={styles.totalScoreText}>מתוך 20 נק'</Text>
                  </View>
                </View>

                <View style={styles.totalScoreDivider} />

                <View style={styles.finalScoreRow}>
                  <Text style={styles.finalScoreLabel}>ציון סופי:</Text>
                  <View style={styles.finalScoreValue}>
                    <Text style={styles.finalScoreNumber}>{calculateTotalScore()}</Text>
                    <Text style={styles.finalScoreText}>מתוך 100 נק'</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>שמור תרגיל</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
  },
  form: {
    gap: 12,
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
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionContent: {
    padding: 14,
    gap: 14,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  scoreItemContainer: {
    gap: 8,
  },
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    width: 50,
    height: 38,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#DC2626',
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreDisplayText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#DC2626',
  },
  ratingGroup: {
    gap: 8,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    flex: 1,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  ratingButtonExcellent: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  ratingButtonGood: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  ratingButtonNeedsWork: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  ratingButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  ratingButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#374151',
  },
  ratingButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
  },
  totalScoreContainer: {
    gap: 16,
  },
  totalScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalScoreLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#374151',
    flex: 1,
  },
  totalScoreValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  totalScoreNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#DC2626',
  },
  totalScoreText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  totalScoreDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  finalScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  finalScoreLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#991B1B',
  },
  finalScoreValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finalScoreNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#DC2626',
  },
  finalScoreText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#991B1B',
  },
  kabtEvaluationContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 16,
  },
  kabtEvaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kabtEvaluationLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#78350F',
    flex: 1,
  },
  kabtEvaluationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kabtEvaluationInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F59E0B',
    width: 60,
    height: 44,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  kabtEvaluationScoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#92400E',
  },
});
