# DoseWise — Setup Guide

## 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your project
2. **Project Settings → Your Apps → Web App → Config** — copy the config object
3. Create `.env` from `.env.example`:
   ```
   cp .env.example .env
   ```
4. Fill in all values in `.env`

### Enable Google Sign-In
- Firebase Console → Authentication → Sign-in method → Google → Enable
- Copy the **Web Client ID** → paste in `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

### Android Setup
- Firebase Console → Project Settings → Android App → Add app (`com.techwake360.dosewise`)
- Download `google-services.json` → place in project root

### iOS Setup
- Firebase Console → Project Settings → iOS App → Add app (`com.techwake360.dosewise`)
- Download `GoogleService-Info.plist` → place in project root

## 2. Firestore Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules and indexes
firebase deploy --only firestore
```

## 3. Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

## 4. Project Structure

```
dosewise/
├── src/
│   ├── theme/          # Design system (colors, typography, spacing)
│   ├── types/          # TypeScript types
│   ├── config/         # Firebase config
│   ├── services/       # Firestore & Auth services
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # React Navigation setup
│   ├── screens/
│   │   ├── auth/       # Welcome screen
│   │   ├── patient/    # Dashboard, Medications, Schedule, Profile
│   │   └── caregiver/  # Caregiver screens (Phase 2)
│   └── components/
│       ├── common/     # Button, Card, ProgressBar
│       └── medication/ # MedicationCard
├── firestore.rules     # Security rules
├── firestore.indexes.json
├── .env.example
└── app.json
```

## 5. Design System

Based on **"Clinical Calm"** from Google Stitch (project/6094613667603269583)

| Token | Value |
|---|---|
| Primary | `#0043a2` (Deep Trust Blue) |
| Secondary | `#006a63` (Mint Vitality) |
| Background | `#f9f9ff` |
| Headline Font | Hanken Grotesk |
| Body Font | Atkinson Hyperlegible Next |
| Border Radius | 8px (default), 16px (cards) |
