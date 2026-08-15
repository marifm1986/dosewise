import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showPercent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, showPercent = true }) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <View>
      {(label || showPercent) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && <Text style={styles.percent}>{clamped.toFixed(0)}%</Text>}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  percent: { ...Typography.labelMd, color: Colors.secondary },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: Radius.full,
  },
});
