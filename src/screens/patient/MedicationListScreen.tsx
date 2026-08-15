import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { getUserMedications, updateMedication, deleteMedication } from '../../services/medication.service';
import { auth } from '../../config/firebase';
import { Medication } from '../../types';

interface Props {
  onAddMedication: () => void;
  onViewMedication: (id: string) => void;
  onEditMedication: (id: string) => void;
}

const FORM_ICONS: Record<string, string> = {
  pill: '💊', capsule: '💉', liquid: '🥤', injection: '💉',
  patch: '🩹', inhaler: '🫁', drops: '💧', cream: '🧴',
};

export const MedicationListScreen: React.FC<Props> = ({ onAddMedication, onViewMedication, onEditMedication }) => {
  const user = auth.currentUser;
  const [medications, setMedications] = useState<Medication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const meds = await getUserMedications(user.uid);
    setMedications(meds);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleActions = (med: Medication) => {
    Alert.alert(
      med.name,
      'Choose an action',
      [
        { text: 'Edit', onPress: () => onEditMedication(med.id) },
        {
          text: 'Archive',
          onPress: async () => {
            await updateMedication(med.id, { isActive: false });
            load();
          },
        },
        {
          text: 'Delete Permanently', style: 'destructive',
          onPress: () => confirmDelete(med),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const confirmDelete = (med: Medication) => {
    Alert.alert(
      'Delete Medication',
      `Permanently delete ${med.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteMedication(med.id);
            load();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Medication }) => (
    <TouchableOpacity
      style={[styles.card, Shadows.card]}
      onPress={() => onViewMedication(item.id)}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrapper}>
        <Text style={styles.formIcon}>{FORM_ICONS[item.form] ?? '💊'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.genericName && (
          <Text style={styles.generic} numberOfLines={1}>{item.genericName}</Text>
        )}
        <Text style={styles.details}>{item.strength} · {item.form}</Text>
        {item.prescribedBy && (
          <Text style={styles.prescriber}>Dr. {item.prescribedBy}</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => handleActions(item)} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>⋯</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Medications</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddMedication}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={medications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No medications yet</Text>
            <Text style={styles.emptyText}>Tap "+ Add" to add your first medication.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.md,
  },
  title: { ...Typography.headlineLgMobile, color: Colors.onSurface },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    ...Shadows.button,
  },
  addBtnText: { ...Typography.labelMd, color: Colors.onPrimary },
  list: { paddingHorizontal: Spacing.containerMargin, paddingBottom: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  formIcon: { fontSize: 24 },
  info: { flex: 1 },
  name: { ...Typography.bodyLg, fontWeight: '700', color: Colors.onSurface },
  generic: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  details: { ...Typography.labelMd, color: Colors.primary, marginTop: 2 },
  prescriber: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 2 },
  removeBtn: {
    padding: Spacing.sm,
  },
  removeBtnText: { ...Typography.bodyMd, color: Colors.outline },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...Typography.headlineMd, color: Colors.onSurface },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
