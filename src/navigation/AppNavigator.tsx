import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Colors, Typography } from '../theme';

// Screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { DashboardScreen } from '../screens/patient/DashboardScreen';
import { MedicationListScreen } from '../screens/patient/MedicationListScreen';
import { AddMedicationScreen } from '../screens/patient/AddMedicationScreen';
import { UserProfileScreen } from '../screens/patient/UserProfileScreen';

const Stack = createNativeStackNavigator();
const MedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Medications nested stack (List → Add/Edit) ─────────────────────────────────
function MedicationsStack() {
  return (
    <MedStack.Navigator screenOptions={{ headerShown: false }}>
      <MedStack.Screen name="MedicationList">
        {({ navigation }) => (
          <MedicationListScreen
            onAddMedication={() => navigation.navigate('AddMedication' as never, {} as never)}
            onViewMedication={(id) =>
              navigation.navigate('AddMedication' as never, { medicationId: id } as never)
            }
            onEditMedication={(id) =>
              navigation.navigate('AddMedication' as never, { medicationId: id } as never)
            }
          />
        )}
      </MedStack.Screen>
      <MedStack.Screen name="AddMedication">
        {({ navigation, route }) => {
          const params = (route.params ?? {}) as { medicationId?: string };
          return (
            <AddMedicationScreen
              medicationId={params.medicationId}
              onSaved={() => navigation.navigate('MedicationList' as never)}
              onBack={() => navigation.goBack()}
            />
          );
        }}
      </MedStack.Screen>
    </MedStack.Navigator>
  );
}

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Dashboard: { active: '🏠', inactive: '🏠' },
  Medications: { active: '💊', inactive: '💊' },
  Schedule: { active: '📅', inactive: '📅' },
  Profile: { active: '👤', inactive: '👤' },
};

// ─── Patient Tab Navigator ──────────────────────────────────────────────────────
function PatientTabs({ onSignedOut }: { onSignedOut: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22 }}>
            {focused ? TAB_ICONS[route.name]?.active : TAB_ICONS[route.name]?.inactive}
          </Text>
        ),
        tabBarLabel: ({ focused, color }) => (
          <Text style={{ ...Typography.labelSm, color, marginBottom: 4 }}>{route.name}</Text>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopColor: Colors.outlineVariant,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Medications" component={MedicationsStack} />
      <Tab.Screen name="Schedule" children={() => <View style={{ flex: 1 }} />} />
      <Tab.Screen
        name="Profile"
        children={() => <UserProfileScreen onSignedOut={onSignedOut} />}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ─────────────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => {
  const [user, setUser] = useState<any>(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen
            name="Welcome"
            children={() => <WelcomeScreen onSignedIn={() => {}} />}
          />
        ) : (
          <Stack.Screen
            name="PatientTabs"
            children={() => <PatientTabs onSignedOut={() => {}} />}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
});
