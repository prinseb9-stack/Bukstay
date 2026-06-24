import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Destinations from '../components/home/Destinations'
import FeaturedStays from '../components/home/FeaturedStays'
import CTA from '../components/home/CTA'

export default function Home() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const q = query(
          collection(db, 'properties'),
          where('isActive', '==', true),
          limit(20)
        )

        const snapshot = await getDocs(q)

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0
          const bTime = b.createdAt?.seconds || 0
          return bTime - aTime
        })

        setProperties(data)
      } catch (err) {
        console.error('Failed to load properties:', err)
        setError('Unable to load stays right now')
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  return (
    <div className="home-page">
      <Hero />
      <Features />
      <Destinations properties={properties} loading={loading} />
      <FeaturedStays properties={properties} loading={loading} />
      {error && <div className="home-error">{error}</div>}
      <CTA />
    </div>
  )
}