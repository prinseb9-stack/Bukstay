const express = require('express')
const supabase = require('../db/supabase')
const { getUser } = require('../middleware/auth')
const { requireRole } = require('../middleware/roles')
const router = express.Router()

router.use(getUser, requireRole('host', 'both'))

router.get('/stats', async (req, res) => {
  const { data: props } = await supabase.from('properties').select('id').eq('host_id', req.user.id)
  const propertyIds = props.map(p => p.id)

  const { count: totalBookings } = await supabase
   .from('bookings')
   .select('*', { count: 'exact', head: true })
   .in('property_id', propertyIds)
   .eq('status', 'confirmed')

  const { data: earnings } = await supabase
   .from('bookings')
   .select('total')
   .in('property_id', propertyIds)
   .eq('status', 'confirmed')

  const totalEarnings = earnings?.reduce((sum, b) => sum + Number(b.total), 0) || 0

  res.json({
    properties: props.length,
    bookings: totalBookings || 0,
    earnings: totalEarnings,
    rating: 4.8
  })
})

router.get('/properties', async (req, res) => {
  const { data } = await supabase
   .from('properties')
   .select('*')
   .eq('host_id', req.user.id)
   .order('created_at', { ascending: false })

  res.json(data)
})

router.get('/earnings', async (req, res) => {
  const { data: props } = await supabase.from('properties').select('id').eq('host_id', req.user.id)
  const propertyIds = props.map(p => p.id)

  const { data } = await supabase
   .from('bookings')
   .select('id,total,created_at,properties(title)')
   .in('property_id', propertyIds)
   .eq('status', 'confirmed')
   .order('created_at', { ascending: false })

  res.json(data)
})

module.exports = router