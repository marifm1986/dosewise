import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const configureGoogleSignIn = () => {
  if (Platform.OS === 'web') return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
};

export const signInWithGoogle = async (): Promise<User> => {
  let firebaseUser;

  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    firebaseUser = result.user;
  } else {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    firebaseUser = result.user;
  }

  // Check if user doc exists
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user document
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: 'patient',
      createdAt: serverTimestamp(),
    });
  }

  const userData = userSnap.exists() ? userSnap.data() : {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role: 'patient' as const,
    createdAt: new Date(),
  };

  return userData as User;
};

export const signOut = async (): Promise<void> => {
  await GoogleSignin.signOut();
  await firebaseSignOut(auth);
};

export const getCurrentUser = () => auth.currentUser;
