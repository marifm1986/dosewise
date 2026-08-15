import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, Switch, Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { addSchedule } from '../../services/medication.service';
import { auth } from '../../config/firebase';
import { FrequencyType } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FREQ_OPTIONS: { value: FrequencyType; label: string; desc: string }[] = [
  { value: 'daily', label: 'Daily', desc: 'Same times every day' },
  { value: 'every_x_hours', label: 'Every X Hours', desc: 'e.g. every 8 hours' },
  { value: 'specific_days', label: 'Specific Days', desc: 'e.g. Mon, Wed, Fri' },
  { value: 'as_needed', label: 'As Needed', desc: 'Take when required' },
];

interface Props {
  medicationId: string;
  medicationName: string;
  onSaved: () => void;
  onBack: () => void;
}

export const ScheduleSetupScreen: React.FC<Props> = ({ medicationId, medicationName, onSaved, onBack }) => {
  const user = auth.currentUser;
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [intervalHours, setIntervalHours] = useState('8');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [times, setTimes] = useState<string[]>(['08:00', '20:00']);
  const [dosageAmount, setDosageAmount] = useState('1');
  const [dosageUnit, setDosageUnit] = useState('pill');
  const [withFood, setWithFood] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('15');
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addTime = () => setTimes(prev => [...prev, '12:00']);
  const removeTime = (i: number) => setTimes(prev => prev.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) => {
    setTimes(prev => prev.map((t, idx) => idx === i ? val : t));
  };

  const handleSave = async () => {
    if (!user) return;
    if (times.length === 0 && frequency !== 'as_needed') {
      return Alert.alert('Required', 'Add at least one dose time.');
    }
    try {
      setLoading(true);
      await addSchedule(user.uid, {
        medicationId,
        userId: user.uid,
        frequencyType: frequency,
        intervalHours: frequency === 'every_x_hours' ? parseInt(intervalHours) : undefined,
        specificDays: frequency === 'specific_days' ? selectedDays : undefined,
        times: frequency === 'as_needed' ? [] : times,
        dosageAmount: parseFloat(dosageAmount) || 1,
        dosageUnit,
        withFood,
        instructions: instructions.trim() || undefined,
        reminderMinutesBefore: parseInt(reminderMinutes) || 15,
        isActive: true,
      });
      onSaved();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Schedule Setup</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.medName}>{medicationName}</Text>

        {/* Frequency */}
        <Text style={styles.sectionLabel}>Frequency</Text>
        <View style={styles.freqGrid}>
          {FREQ_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.freqChip, frequency === opt.value && styles.freqChipSelected]}
              onPress={() => setFrequency(opt.value)}
            >
              <Text style={[styles.freqLabel, frequency === opt.value && styles.freqLabelSelected]}>{opt.label}</Text>
              <Text style={styles.freqDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interval hours */}
        {frequency === 'every_x_hours' && (
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Every</Text>
            <TextInput
              style={[styles.input, styles.inputSm]}
              value={intervalHours}
              onChangeText={setIntervalHours}
              keyboardType="numeric"
            />
            <Text style={styles.label}>hours</Text>
          </View>
        )}

        {/* Day selector */}
        {frequency === 'specific_days' && (
          <>
            <Text style={styles.sectionLabel}>Days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayChip, selectedDays.includes(i) && styles.dayChipSelected]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={[styles.dayText, selectedDays.includes(i) && styles.dayTextSelected]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Times */}
        {frequency !== 'as_needed' && (
          <>
            <Text style={styles.sectionLabel}>Dose Times</Text>
            {times.map((t, i) => (
              <View key={i} style={styles.timeRow}>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  value={t}
                  onChangeText={v => updateTime(i, v)}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.outline}
                />
                {times.length > 1 && (
                  <TouchableOpacity onPress={() => removeTime(i)} style={styles.removeTime}>
                    <Text style={styles.removeTimeText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={addTime} style={styles.addTimeBtn}>
              <Text style={styles.addTimeText}>+ Add another time</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Dosage */}
        <Text style={styles.sectionLabel}>Dosage</Text>
        <View style={styles.fieldRow}>
          <TextInput
            style={[styles.input, styles.inputSm]}
            value={dosageAmount}
            onChangeText={setDosageAmount}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={dosageUnit}
            onChangeText={setDosageUnit}
            placeholder="pill / ml / mg"
            placeholderTextColor={Colors.outline}
          />
        </View>

        {/* With food */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Take with food</Text>
          <Switch value={withFood} onValueChange={setWithFood} trackColor={{ true: Colors.secondary }} />
        </View>

        {/* Reminder */}
        <Text style={styles.sectionLabel}>Reminder</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Notify</Text>
          <TextInput
            style={[styles.input, styles.inputSm]}
            value={reminderMinutes}
            onChangeText={setReminderMinutes}
            keyboardType="numeric"
          />
          <Text style={styles.label}>min before</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.sectionLabel}>Special Instructions</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="e.g. Take with a full glass of water"
          placeholderTextColor={Colors.outline}
          multiline
          numberOfLines={3}
        />

        <View style={{ marginTop: Spacing.lg }}>
          <Button label="Save Schedule" onPress={handleSave} loading={loading} fullWidth />
        </View>
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  back: { ...Typography.bodyMd, color: Colors.primary },
  title: { ...Typography.headlineMd, color: Colors.onSurface },
  form: { padding: Spacing.containerMargin },
  medName: { ...Typography.headlineMd, color: Colors.primary, marginBottom: Spacing.lg },
  sectionLabel: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  label: { ...Typography.bodyMd, color: Colors.onSurface },
  input: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.DEFAULT,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  inputSm: { width: 80 },
  textarea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  freqGrid: { gap: Spacing.sm, marginBottom: Spacing.sm },
  freqChip: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  freqChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryFixed },
  freqLabel: { ...Typography.labelMd, color: Colors.onSurface },
  freqLabelSelected: { color: Colors.primary },
  freqDesc: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 2 },
  daysRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  dayChip: {
    width: 40, height: 40,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  dayText: { ...Typography.labelSm, color: Colors.onSurface },
  dayTextSelected: { color: Colors.onPrimary },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  timeInput: { flex: 1 },
  removeTime: { padding: Spacing.sm },
  removeTimeText: { ...Typography.bodyMd, color: Colors.outline },
  addTimeBtn: { paddingVertical: Spacing.sm },
  addTimeText: { ...Typography.labelMd, color: Colors.primary },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  switchLabel: { ...Typography.bodyMd, color: Colors.onSurface },
});
