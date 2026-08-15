import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Medication, Schedule, DoseLog, DoseStatus } from '../types';

// ─── Medications ───────────────────────────────────────────────────────────────

export const addMedication = async (userId: string, data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'medications'), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateMedication = async (id: string, data: Partial<Medication>): Promise<void> => {
  await updateDoc(doc(db, 'medications', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteMedication = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'medications', id));
};

export const getUserMedications = async (userId: string): Promise<Medication[]> => {
  const q = query(
    collection(db, 'medications'),
    where('userId', '==', userId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    startDate: (d.data().startDate as Timestamp).toDate(),
    endDate: d.data().endDate ? (d.data().endDate as Timestamp).toDate() : undefined,
    createdAt: (d.data().createdAt as Timestamp).toDate(),
    updatedAt: (d.data().updatedAt as Timestamp).toDate(),
  })) as Medication[];
};

export const getMedication = async (id: string): Promise<Medication | null> => {
  const snap = await getDoc(doc(db, 'medications', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    startDate: (data.startDate as Timestamp).toDate(),
    endDate: data.endDate ? (data.endDate as Timestamp).toDate() : undefined,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as Medication;
};

// ─── Schedules ─────────────────────────────────────────────────────────────────

export const addSchedule = async (userId: string, data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'schedules'), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateSchedule = async (id: string, data: Partial<Schedule>): Promise<void> => {
  await updateDoc(doc(db, 'schedules', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getMedicationSchedules = async (medicationId: string): Promise<Schedule[]> => {
  const q = query(
    collection(db, 'schedules'),
    where('medicationId', '==', medicationId),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp).toDate(),
    updatedAt: (d.data().updatedAt as Timestamp).toDate(),
  })) as Schedule[];
};

export const getUserSchedules = async (userId: string): Promise<Schedule[]> => {
  const q = query(
    collection(db, 'schedules'),
    where('userId', '==', userId),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp).toDate(),
    updatedAt: (d.data().updatedAt as Timestamp).toDate(),
  })) as Schedule[];
};

// ─── Dose Logs ──────────────────────────────────────────────────────────────────

export const logDose = async (data: Omit<DoseLog, 'id' | 'createdAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'doseLogs'), {
    ...data,
    scheduledTime: Timestamp.fromDate(data.scheduledTime),
    takenAt: data.takenAt ? Timestamp.fromDate(data.takenAt) : null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateDoseStatus = async (id: string, status: DoseStatus, takenAt?: Date): Promise<void> => {
  await updateDoc(doc(db, 'doseLogs', id), {
    status,
    takenAt: takenAt ? Timestamp.fromDate(takenAt) : null,
  });
};

export const getTodayDoseLogs = async (userId: string): Promise<DoseLog[]> => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'doseLogs'),
    where('userId', '==', userId),
    where('scheduledTime', '>=', Timestamp.fromDate(start)),
    where('scheduledTime', '<=', Timestamp.fromDate(end)),
    orderBy('scheduledTime', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    scheduledTime: (d.data().scheduledTime as Timestamp).toDate(),
    takenAt: d.data().takenAt ? (d.data().takenAt as Timestamp).toDate() : undefined,
    createdAt: (d.data().createdAt as Timestamp).toDate(),
  })) as DoseLog[];
};

export const getAdherenceStats = async (userId: string, days: number = 7): Promise<{ taken: number; missed: number; total: number }> => {
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, 'doseLogs'),
    where('userId', '==', userId),
    where('scheduledTime', '>=', Timestamp.fromDate(start))
  );
  const snap = await getDocs(q);
  const logs = snap.docs.map(d => d.data());

  const taken = logs.filter(l => l.status === 'taken').length;
  const missed = logs.filter(l => l.status === 'missed').length;
  return { taken, missed, total: logs.length };
};
