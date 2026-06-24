import { useEffect, useState } from "react"

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore"

import { db } from "../lib/firebase"


export function useFirestore(
  collectionName,
  conditions = [],
  orderField = null
) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    let queries = []

    conditions.forEach(condition => {
      queries.push(
        where(
          condition.field,
          condition.operator,
          condition.value
        )
      )
    })

    if (orderField) {
      queries.push(
        orderBy(orderField, "desc")
      )
    }


    const q = query(
      collection(db, collectionName),
      ...queries
    )


    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setData(items)
        setLoading(false)
      },

      err => {
        setError(err.message)
        setLoading(false)
      }
    )


    return () => unsubscribe()

  }, [
    collectionName,
    JSON.stringify(conditions),
    orderField
  ])


  return {
    data,
    loading,
    error
  }
}