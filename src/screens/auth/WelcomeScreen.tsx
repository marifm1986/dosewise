import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, SafeAreaView, Alert, Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { signInWithGoogle } from '../../services/auth.service';

interface Props {
  onSignedIn: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onSignedIn }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onSignedIn();
    } catch (error: any) {
      Alert.alert('Sign-In Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        {/* Logo / Illustration placeholder */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>💊</Text>
        </View>
        <Text style={styles.appName}>DoseWise</Text>
        <Text style={styles.tagline}>Your smart medicine tracker for a healthier, stress-free routine.</Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '⏰', text: 'Smart reminders for every dose' },
          { icon: '📋', text: 'Track your full medication schedule' },
          { icon: '👨‍👩‍👧', text: 'Caregiver support & monitoring' },
          { icon: '📊', text: 'Adherence reports & insights' },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label={loading ? 'Signing in…' : 'Continue with Google'}
          onPress={handleGoogleSignIn}
          loading={loading}
          fullWidth
        />
        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy. Your health data is encrypted and never shared.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.containerMargin,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoIcon: { fontSize: 48 },
  appName: {
    ...Typography.headlineLgMobile,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  features: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  featureIcon: { fontSize: 24 },
  featureText: { ...Typography.bodyMd, color: Colors.onSurface, flex: 1 },
  footer: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  disclaimer: {
    ...Typography.labelSm,
    color: Colors.outline,
    textAlign: 'center',
    lineHeight: 18,
  },
});
