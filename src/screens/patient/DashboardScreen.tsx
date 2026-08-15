import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  RefreshControl, TouchableOpacity, Image,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { MedicationCard } from '../../components/medication/MedicationCard';
import { getTodayDoseLogs, getAdherenceStats, getUserMedications } from '../../services/medication.service';
import { updateDoseStatus } from '../../services/medication.service';
import { auth } from '../../config/firebase';
import { DoseLog, Medication } from '../../types';
import { format } from 'date-fns';

export const DashboardScreen: React.FC = () => {
  const user = auth.currentUser;
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [stats, setStats] = useState({ taken: 0, missed: 0, total: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [logs, meds, adherence] = await Promise.all([
      getTodayDoseLogs(user.uid),
      getUserMedications(user.uid),
      getAdherenceStats(user.uid, 7),
    ]);
    setDoseLogs(logs);
    setMedications(meds);
    setStats(adherence);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogDose = async (log: DoseLog) => {
    await updateDoseStatus(log.id, 'taken', new Date());
    await load();
  };

  const todayLabel = format(new Date(), 'EEEE, MMMM d');
  const adherencePct = stats.total > 0 ? (stats.taken / stats.total) * 100 : 0;

  // Group by time period
  const morningLogs = doseLogs.filter(l => {
    const h = new Date(l.scheduledTime).getHours();
    return h >= 5 && h < 12;
  });
  const afternoonLogs = doseLogs.filter(l => {
    const h = new Date(l.scheduledTime).getHours();
    return h >= 12 && h < 17;
  });
  const eveningLogs = doseLogs.filter(l => {
    const h = new Date(l.scheduledTime).getHours();
    return h >= 17 || h < 5;
  });

  const getMedForLog = (log: DoseLog) => medications.find(m => m.id === log.medicationId);

  const renderSection = (title: string, logs: DoseLog[]) => {
    if (logs.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {logs.map(log => {
          const med = getMedForLog(log);
          if (!med) return null;
          return (
            <MedicationCard
              key={log.id}
              medication={med}
              doseLog={log}
              scheduledTime={format(log.scheduledTime, 'h:mm a')}
              dosage="1 dose"
              onLogDose={() => handleLogDose(log)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}, {user?.displayName?.split(' ')[0]} 👋</Text>
            <Text style={styles.date}>{todayLabel}</Text>
          </View>
          {user?.photoURL && (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          )}
        </View>

        {/* Adherence summary card */}
        <Card style={styles.adherenceCard} elevated>
          <Text style={styles.adherenceTitle}>Weekly Adherence</Text>
          <ProgressBar value={adherencePct} showPercent />
          <View style={styles.statsRow}>
            <StatChip icon="✅" value={stats.taken} label="Taken" color={Colors.secondary} />
            <StatChip icon="❌" value={stats.missed} label="Missed" color={Colors.error} />
            <StatChip icon="📋" value={stats.total} label="Total" color={Colors.primary} />
          </View>
        </Card>

        {/* Today's doses */}
        <Text style={styles.heading}>Today's Doses</Text>

        {doseLogs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptyText}>No doses scheduled for today, or you're all caught up.</Text>
          </Card>
        ) : (
          <>
            {renderSection('🌅  MORNING', morningLogs)}
            {renderSection('☀️  AFTERNOON', afternoonLogs)}
            {renderSection('🌙  EVENING', eveningLogs)}
          </>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatChip = ({ icon, value, label, color }: any) => (
  <View style={statStyles.chip}>
    <Text style={statStyles.icon}>{icon}</Text>
    <Text style={[statStyles.value, { color }]}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: { ...Typography.headlineLgMobile, color: Colors.onSurface },
  date: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: Colors.primaryFixed },
  adherenceCard: {
    marginHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  adherenceTitle: { ...Typography.headlineMd, color: Colors.onSurface },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  heading: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.sm,
  },
  section: { paddingHorizontal: Spacing.containerMargin, marginBottom: Spacing.sm },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  emptyCard: {
    marginHorizontal: Spacing.containerMargin,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { ...Typography.headlineMd, color: Colors.onSurface },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});

const statStyles = StyleSheet.create({
  chip: { alignItems: 'center', gap: 2 },
  icon: { fontSize: 18 },
  value: { ...Typography.headlineMd },
  label: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
});
