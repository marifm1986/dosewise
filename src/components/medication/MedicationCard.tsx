import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { DoseLog, Medication } from '../../types';

interface MedicationCardProps {
  medication: Medication;
  doseLog?: DoseLog;
  scheduledTime?: string;
  dosage?: string;
  onLogDose?: () => void;
  onPress?: () => void;
}

const statusConfig = {
  pending: { bg: Colors.surfaceContainerLow, dot: Colors.warning, label: 'UPCOMING' },
  taken: { bg: '#f0fff8', dot: Colors.secondary, label: 'TAKEN' },
  missed: { bg: '#fff5f5', dot: Colors.error, label: 'MISSED' },
  skipped: { bg: Colors.surfaceContainerLow, dot: Colors.outline, label: 'SKIPPED' },
};

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication, doseLog, scheduledTime, dosage, onLogDose, onPress,
}) => {
  const status = doseLog?.status ?? 'pending';
  const config = statusConfig[status];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, Shadows.card, { backgroundColor: config.bg }]}>
      {/* Status dot + time */}
      <View style={styles.topRow}>
        <View style={styles.nameRow}>
          <View style={[styles.dot, { backgroundColor: config.dot }]} />
          <Text style={styles.name} numberOfLines={1}>{medication.name}</Text>
        </View>
        {scheduledTime && <Text style={styles.time}>{scheduledTime}</Text>}
      </View>

      {/* Dosage + strength */}
      <Text style={styles.subtitle}>
        {medication.strength} · {dosage ?? '1 dose'} · {medication.form}
      </Text>

      {/* Status label + action button */}
      <View style={styles.bottomRow}>
        <View style={[styles.statusChip, { borderColor: config.dot }]}>
          <Text style={[styles.statusText, { color: config.dot }]}>{config.label}</Text>
        </View>
        {status === 'pending' && onLogDose && (
          <TouchableOpacity onPress={onLogDose} style={styles.doneButton} activeOpacity={0.8}>
            <Text style={styles.doneText}>✓ Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
  name: { ...Typography.bodyLg, fontWeight: '700', color: Colors.onSurface, flex: 1 },
  time: { ...Typography.labelMd, color: Colors.onSurfaceVariant, marginLeft: Spacing.sm },
  subtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusText: { ...Typography.labelSm, textTransform: 'uppercase' as const },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    ...Shadows.button,
  },
  doneText: { ...Typography.labelMd, color: Colors.onPrimary },
});
