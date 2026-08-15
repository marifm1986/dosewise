import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { addMedication, getMedication, updateMedication } from '../../services/medication.service';
import { searchMedicines, MedicineSuggestion } from '../../services/rxnorm.service';
import { auth } from '../../config/firebase';
import { MedicationForm } from '../../types';

const FORMS: { value: MedicationForm; icon: string; label: string }[] = [
  { value: 'pill', icon: '💊', label: 'Pill' },
  { value: 'capsule', icon: '💉', label: 'Capsule' },
  { value: 'liquid', icon: '🥤', label: 'Liquid' },
  { value: 'inhaler', icon: '🫁', label: 'Inhaler' },
  { value: 'patch', icon: '🩹', label: 'Patch' },
  { value: 'drops', icon: '💧', label: 'Drops' },
  { value: 'injection', icon: '💉', label: 'Injection' },
  { value: 'cream', icon: '🧴', label: 'Cream' },
];

interface Props {
  medicationId?: string;
  onSaved: (medicationId: string) => void;
  onBack: () => void;
}

export const AddMedicationScreen: React.FC<Props> = ({ medicationId, onSaved, onBack }) => {
  const user = auth.currentUser;
  const isEdit = !!medicationId;
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState<MedicationForm>('pill');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!medicationId) return;
    (async () => {
      try {
        const med = await getMedication(medicationId);
        if (med) {
          setName(med.name);
          setGenericName(med.genericName ?? '');
          setStrength(med.strength);
          setForm(med.form);
          setPrescribedBy(med.prescribedBy ?? '');
          setNotes(med.notes ?? '');
        }
      } catch (e: any) {
        Alert.alert('Error', e.message);
      } finally {
        setFetching(false);
      }
    })();
  }, [medicationId]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) return Alert.alert('Required', 'Medication name is required.');
    if (!strength.trim()) return Alert.alert('Required', 'Strength/dosage is required.');

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        strength: strength.trim(),
        form,
        prescribedBy: prescribedBy.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEdit && medicationId) {
        await updateMedication(medicationId, payload);
        onSaved(medicationId);
      } else {
        const id = await addMedication(user.uid, {
          userId: user.uid,
          ...payload,
          startDate: new Date(),
          isActive: true,
        });
        onSaved(id);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Edit Medication' : 'Add Medication'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Medication Name */}
        <Field label="Medication Name *" placeholder="e.g. Metformin">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Metformin"
            placeholderTextColor={Colors.outline}
          />
        </Field>

        <Field label="Generic Name" placeholder="Optional">
          <TextInput
            style={styles.input}
            value={genericName}
            onChangeText={setGenericName}
            placeholder="Optional"
            placeholderTextColor={Colors.outline}
          />
        </Field>

        <Field label="Strength / Dosage *" placeholder="e.g. 500mg, 10ml">
          <TextInput
            style={styles.input}
            value={strength}
            onChangeText={setStrength}
            placeholder="e.g. 500mg, 10ml"
            placeholderTextColor={Colors.outline}
          />
        </Field>

        {/* Form selector */}
        <Text style={styles.label}>Form *</Text>
        <View style={styles.formGrid}>
          {FORMS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[styles.formChip, form === f.value && styles.formChipSelected]}
              onPress={() => setForm(f.value)}
            >
              <Text style={styles.formChipIcon}>{f.icon}</Text>
              <Text style={[styles.formChipLabel, form === f.value && styles.formChipLabelSelected]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Prescribed By" placeholder="Doctor's name (optional)">
          <TextInput
            style={styles.input}
            value={prescribedBy}
            onChangeText={setPrescribedBy}
            placeholder="Doctor's name (optional)"
            placeholderTextColor={Colors.outline}
          />
        </Field>

        <Field label="Notes" placeholder="Any special instructions…">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions…"
            placeholderTextColor={Colors.outline}
            multiline
            numberOfLines={3}
          />
        </Field>

        <View style={{ marginTop: Spacing.lg }}>
          <Button label={isEdit ? 'Save Changes' : 'Save Medication'} onPress={handleSave} loading={loading} fullWidth />
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Field: React.FC<{ label: string; placeholder: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

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
  fieldWrapper: { marginBottom: Spacing.md },
  label: { ...Typography.labelMd, color: Colors.onSurface, marginBottom: Spacing.xs },
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
  textarea: { height: 88, textAlignVertical: 'top', paddingTop: 12 },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  formChip: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    minWidth: 72,
  },
  formChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed,
  },
  formChipIcon: { fontSize: 20, marginBottom: 2 },
  formChipLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  formChipLabelSelected: { color: Colors.primary, fontWeight: '700' },
});
