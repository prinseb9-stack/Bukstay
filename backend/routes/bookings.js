const express = require('express')
const supabase = require('../db/supabase')
const { getUser } = require('../middleware/auth')
const router = express.Router()

router.use(getUser)

// POST /api/bookings - Create booking
router.post('/', async (req, res) => {
  const { property_id, check_in, check_out, guests } = req.body
  const guest_id = req.user.id

  // Get property price
  const { data: property } = await supabase
   .from('properties')
   .select('price, host_id, status')
   .eq('id', property_id)
   .single()

  if (!property) return res.status(404).json({ error: 'Property not found' })
  if (property.status !== 'approved') return res.status(400).json({ error: 'Property not available' })
  if (property.host_id === guest_id) return res.status(400).json({ error: 'Cannot book your own property' })

  // Calculate total
  const days = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24))
  if (days <= 0) return res.status(400).json({ error: 'Invalid dates' })
  const total = Number(property.price) * days

  const payment_ref = `buk_${Date.now()}_${guest_id.slice(0, 8)}`

  const { data, error } = await supabase
   .from('bookings')
   .insert({
     property_id,
     guest_id,
     check_in,
     check_out,
     guests,
     total,
     status: 'pending',
     payment_ref
   })
   .select('*, properties(title,city,images)')
   .single()

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// GET /api/bookings - Get my bookings
router.get('/', async (req, res) => {
  const { data } = await supabase
   .from('bookings')
   .select('*, properties(title,city,images,price)')
   .eq('guest_id', req.user.id)
   .order('created_at', { ascending: false })

  res.json(data)
})

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
   .from('bookings')
   .select('*, properties(*, users(name,avatar)), users(name,email)')
   .eq('id', req.params.id)
   .single()

  if (error) return res.status(404).json({ error: 'Booking not found' })
  if (data.guest_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  res.json(data)
})

// PATCH /api/bookings/:id/cancel - Cancel booking
router.patch('/:id/cancel', async (req, res) => {
  const { data: booking } = await supabase
   .from('bookings')
   .select('guest_id, status')
   .eq('id', req.params.id)
   .single()

  if (!booking) return res.status(404).json({ error: 'Not found' })
  if (booking.guest_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    return res.status(400).json({ error: 'Cannot cancel this booking' })
  }

  const { data } = await supabase
   .from('bookings')
   .update({ status: 'cancelled' })
   .eq('id', req.params.id)
   .select()
   .single()

  res.json(data)
})

module.exports = router