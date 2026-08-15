import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Image,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { signOut } from '../../services/auth.service';
import { auth } from '../../config/firebase';

interface Props {
  onSignedOut: () => void;
}

export const UserProfileScreen: React.FC<Props> = ({ onSignedOut }) => {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await signOut();
            onSignedOut();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const menuItems = [
    { icon: '🔔', label: 'Reminder Settings', onPress: () => {} },
    { icon: '📊', label: 'Export Data', onPress: () => {} },
    { icon: '👨‍👩‍👧', label: 'Caregiver Access', onPress: () => {} },
    { icon: '🔒', label: 'Privacy & Security', onPress: () => {} },
    { icon: '❓', label: 'Help & Support', onPress: () => {} },
    { icon: '⭐', label: 'Rate DoseWise', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileSection}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{user?.displayName?.[0] ?? 'U'}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.displayName ?? 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🏥 Patient</Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeText}>✅ Verified</Text>
            </View>
          </View>
        </View>

        {/* Stats card */}
        <Card style={styles.statsCard} elevated>
          <Text style={styles.statsTitle}>Your Health Journey</Text>
          <View style={styles.statsRow}>
            <StatItem value="0" label="Medications" />
            <StatItem value="0" label="Days Active" />
            <StatItem value="–" label="Adherence" />
          </View>
        </Card>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.75}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="Sign Out" onPress={handleSignOut} variant="ghost" loading={loading} fullWidth />
          <Text style={styles.version}>DoseWise v1.0.0</Text>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <View style={statStyles.item}>
    <Text style={statStyles.value}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.containerMargin,
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: Spacing.md },
  avatarPlaceholder: {
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { ...Typography.headlineLgMobile, color: Colors.primary },
  name: { ...Typography.headlineLgMobile, color: Colors.onSurface, marginBottom: 4 },
  email: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginBottom: Spacing.md },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryFixed,
  },
  badgeGreen: { backgroundColor: Colors.secondaryContainer },
  badgeText: { ...Typography.labelSm, color: Colors.onSurface },
  statsCard: {
    marginHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.lg,
  },
  statsTitle: { ...Typography.headlineMd, color: Colors.onSurface, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  menu: { paddingHorizontal: Spacing.containerMargin },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuLabel: { ...Typography.bodyMd, color: Colors.onSurface, flex: 1 },
  menuArrow: { ...Typography.headlineMd, color: Colors.outline },
  footer: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  version: { ...Typography.labelSm, color: Colors.outline },
});

const statStyles = StyleSheet.create({
  item: { alignItems: 'center' },
  value: { ...Typography.headlineMd, color: Colors.primary },
  label: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
});
