// DoseWise — Core Type Definitions

export type MedicationForm = 'pill' | 'capsule' | 'liquid' | 'injection' | 'patch' | 'inhaler' | 'drops' | 'cream';
export type FrequencyType = 'daily' | 'every_x_hours' | 'specific_days' | 'as_needed';
export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';
export type UserRole = 'patient' | 'caregiver';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  genericName?: string;
  form: MedicationForm;
  strength: string; // e.g. "500mg"
  color?: string;
  notes?: string;
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  medicationId: string;
  userId: string;
  frequencyType: FrequencyType;
  intervalHours?: number; // for every_x_hours
  specificDays?: number[]; // 0=Sun..6=Sat for specific_days
  times: string[]; // ["08:00", "20:00"]
  dosageAmount: number;
  dosageUnit: string; // "pill", "ml", "mg"
  withFood?: boolean;
  instructions?: string;
  reminderMinutesBefore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduleId: string;
  userId: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: DoseStatus;
  notes?: string;
  skippedReason?: string;
  createdAt: Date;
}

export interface CaregiverRelation {
  id: string;
  caregiverId: string;
  patientId: string;
  patientEmail: string;
  caregiverEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  medicationId: string;
  scheduleId: string;
  scheduledFor: Date;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  PatientTabs: undefined;
  CaregiverTabs: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
};

export type PatientTabParamList = {
  Dashboard: undefined;
  Medications: undefined;
  Schedule: undefined;
  Profile: undefined;
};

export type PatientStackParamList = {
  DashboardHome: undefined;
  MedicationList: undefined;
  MedicationDetail: { medicationId: string };
  SearchMedication: undefined;
  AddMedication: { medicationId?: string };
  ScheduleSetup: { medicationId: string };
  ScheduleDetail: { scheduleId: string; medicationId: string };
  LogDoseConfirmation: { doseLogId: string; medicationName: string };
  ReminderSettings: undefined;
  UserProfile: undefined;
  DataExport: undefined;
  MedicationConflict: { medicationId: string };
};
