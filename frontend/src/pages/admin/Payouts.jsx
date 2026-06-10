import { useState, useEffect } from 'react'
import api from '../../services/api'
import '../../styles/AdminPayouts.css'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    fetchPayouts()
  }, [filter])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = filter!== 'all'? `?status=${filter}` : ''
      const res = await api.get(`/api/admin/payouts${params}`)
      setPayouts(res.data)
    } catch (err) {
      setError('Failed to load payouts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayout = async (id) => {
    try {
      setProcessing(id)
      await api.patch(`/api/admin/payouts/${id}`, { status: 'paid' })
      fetchPayouts()
    } catch (err) {
      alert(err.response?.