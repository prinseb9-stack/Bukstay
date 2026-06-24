import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAMBd9nP2hLtABDWHhtgRgmT4xTU3sYLLE",
  authDomain: "bukstay-6ea81.firebaseapp.com",
  projectId: "bukstay-6ea81",
  storageBucket: "bukstay-6ea81.appspot.com",
  messagingSenderId: "435710560764",
  appId: "1:435710560764:web:760d68bb40f66e034a4a79",
  measurementId: "G-H8WGR1R7N0"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Social Login Providers
export const googleProvider = new GoogleAuthProvider()
export const appleProvider = new OAuthProvider("apple.com")

googleProvider.addScope("profile")
googleProvider.addScope("email")

appleProvider.addScope("email")
appleProvider.addScope("name")

export default app