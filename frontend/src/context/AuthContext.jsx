import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore"
import {
  auth,
  db,
  googleProvider,
  appleProvider
} from "../lib/firebase"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}

const getErrorMessage = (code) => {
  switch(code) {
    case "auth/email-already-in-use":
      return "This email is already registered"
    case "auth/invalid-credential":
      return "Invalid email or password"
    case "auth/weak-password":
      return "Password must be at least 6 characters"
    case "auth/popup-closed-by-user":
      return "Sign in cancelled"
    default:
      return "Something went wrong"
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const createUserDocument = async (firebaseUser, role = "user") => {
    const userRef = doc(db, "users", firebaseUser.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      const data = {
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || "",
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "",
        role,
        phone: "",
        bio: "",
        country: "",
        currency: "USD",
        onboarded: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(userRef, data)
      return data
    }
    return { id: snap.id, ...snap.data() }
  }

  const loadProfile = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid))
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() }
    }
    return null
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const profile = await loadProfile(currentUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Regular register
  const register = async (name, email, password, role = "user") => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      const profile = await createUserDocument(result.user, role)
      return { success: true, role: profile.role, user: profile }
    } catch (error) {
      return { success: false, error: getErrorMessage(error.code) }
    }
  }

  // Regular login — blocks admins, allows users & hosts
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const profile = await loadProfile(result.user.uid)
      
      if (!profile) {
        await signOut(auth)
        return { success: false, error: "User profile not found" }
      }

      // Block admins from regular login
      if (profile.role === "admin") {
        await signOut(auth)
        return { success: false, error: "Please use the admin portal" }
      }

      return { success: true, role: profile.role, user: profile }
    } catch (error) {
      return { success: false, error: getErrorMessage(error.code) }
    }
  }

  // Host login — blocks users, allows hosts & admins
  const loginHost = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const profile = await loadProfile(result.user.uid)
      
      if (!profile) {
        await signOut(auth)
        return { success: false, error: "User profile not found" }
      }

      // Block regular users from host login
      if (profile.role === "user") {
        await signOut(auth)
        return { success: false, error: "This login is for hosts only. Please use the traveller app." }
      }

      return { success: true, role: profile.role, user: profile }
    } catch (error) {
      return { success: false, error: getErrorMessage(error.code) }
    }
  }

  // Admin login — only allows admins
  const loginAdmin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const profile = await loadProfile(result.user.uid)
      
      if (!profile) {
        await signOut(auth)
        return { success: false, error: "User profile not found" }
      }

      // Only allow admins
      if (profile.role !== "admin") {
        await signOut(auth)
        return { success: false, error: "Access denied. Admin accounts only." }
      }

      return { success: true, role: profile.role, user: profile }
    } catch (error) {
      return { success: false, error: getErrorMessage(error.code) }
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const profile = await createUserDocument(result.user)
      
      if (profile.role === "admin") {
        await signOut(auth)
        return { success: false, error: "Please use the admin portal" }
      }

      return { success: true, role: profile.role, user: profile }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider)
      const profile = await createUserDocument(result.user)
      
      if (profile.role === "admin") {
        await signOut(auth)
        return { success: false, error: "Please use the admin portal" }
      }

      return { success: true, role: profile.role, user: profile }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const updateUserProfile = async (data) => {
    if (!user) return
    await updateDoc(doc(db, "users", user.uid), { ...data, updatedAt: serverTimestamp() })
    const updated = await loadProfile(user.uid)
    setUserProfile(updated)
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      register,
      login,
      loginHost,
      loginAdmin,
      loginWithGoogle,
      loginWithApple,
      logout,
      updateUserProfile,
      updateUser: updateUserProfile,
      isAdmin: userProfile?.role === "admin",
      isHost: userProfile?.role === "host",
      isUser: userProfile?.role === "user"
    }}>
      {children}
    </AuthContext.Provider>
  )
}