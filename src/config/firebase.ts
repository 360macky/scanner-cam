/**
 * Firebase configuration
 * @description This file contains the configuration for the firebase app as
 * well as the functions to interact with the database
 */

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth'
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  updateDoc,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

connectAuthEmulator(auth, 'http://localhost:9099')
connectFirestoreEmulator(db, 'localhost', 8080)

const provider = new GoogleAuthProvider()

const createUserInFirestore = async (user: User) => {
  const userCollectionRef = collection(db, 'users')

  // If the user is already in the database, we don't need to create it again:
  const userDoc = await getDoc(doc(userCollectionRef, user.uid))
  if (userDoc.exists()) {
    return null
  }
  const userResponse = await setDoc(doc(userCollectionRef, user.uid), {
    accountId: user.uid,
    detections: [],
    userConfiguration: {
      detectionFrequency: 200
    }
  })
  return userResponse
}

const updateDetectionFrequency = async (userId: string, frequency: number) => {
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    userConfiguration: {
      detectionFrequency: frequency
    }
  })
}

const getDetectionFrequency = async (userId: string) => {
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)
  if (userDoc.exists()) {
    return userDoc.data()?.userConfiguration.detectionFrequency as number
  }
  return 200
}

export {
  app,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  provider,
  signInWithPopup,
  GoogleAuthProvider,
  createUserInFirestore,
  updateDetectionFrequency,
  getDetectionFrequency
}
