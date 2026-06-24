import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"
import { db } from "../lib/firebase"

/* =========================
   PROPERTIES
========================= */

export const getProperties = async (city = null) => {
  let q = query(
    collection(db, "properties"),
    where("status", "==", "active")
  )

  if (city) {
    q = query(
      collection(db, "properties"),
      where("status", "==", "active"),
      where("city", "==", city)
    )
  }

  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

export const createProperty = async (property, hostId) => {
  const docRef = await addDoc(
    collection(db, "properties"),
    {
      ...property,
      hostId,
      status: "pending", // Requires admin approval
      createdAt: serverTimestamp()
    }
  )

  return docRef.id
}

/* =========================
   BOOKINGS
========================= */

export const createBooking = async (booking) => {
  const docRef = await addDoc(
    collection(db, "bookings"),
    {
      ...booking,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: serverTimestamp()
    }
  )

  return docRef.id
}

export const getUserBookings = async (userId) => {
  const q = query(
    collection(db, "bookings"),
    where("travellerId", "==", userId)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/* =========================
   DISCOVERIES
========================= */

export const getDiscoveries = async () => {
  const snapshot = await getDocs(
    collection(db, "discoveries")
  )

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}