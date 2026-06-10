const express = require('express')
const supabase = require('../db/supabase')
const { getUser } = require('../middleware/auth')
const { requireRole } = require('../middleware/roles')
const router = express.Router()

// GET /api/properties - List all approved properties + search
router.get('/', async (req, res) => {
  const { city, min_price, max_price, limit = 20, page = 1 } = req.query
  const offset = (page - 1) * limit

  let query = supabase
   .from('properties')
   .select('*, users(name,avatar)')
   .eq('status', 'approved')
   .order('created_at', { ascending: false })
   .range(offset, offset + limit - 1)

  if (city) query = query.ilike('city', `%${city}%`)
  if (min_price) query = query.gte('price', min_price)
  if (max_price) query = query.lte('price', max_price)

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
   .from('properties')
   .select('*, users(name,avatar,bio,country)')
   .eq('id', req.params.id)
   .single()

  if (error) return res.status(404).json({ error: 'Property not found' })
  res.json(data)
})

// POST /api/properties - Create property, host only
router.post('/', getUser, requireRole('host', 'both'), async (req, res) => {
  const { title, desc, price, city, country, images, amenities } = req.body

  const { data, error } = await supabase
   .from('properties')
   .insert({
     host_id: req.user.id,
     title,
     desc,
     price,
     city,
     country,
     images: images || [],
     amenities: amenities || [],
     status: 'pending' // admin must approve
   })
   .select()
   .single()

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// PATCH /api/properties/:id - Update property, owner or admin
router.patch('/:id', getUser, async (req, res) => {
  const { data: prop } = await supabase
   .from('properties')
   .select('host_id')
   .eq('id', req.params.id)
   .single()

  if (!prop) return res.status(404).json({ error: 'Not found' })
  if (prop.host_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { title, desc, price, city, country, images, amenities } = req.body
  const { data, error } = await supabase
   .from('properties')
   .update({ title, desc, price, city, country, images, amenities })
   .eq('id', req.params.id)
   .select()
   .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// DELETE /api/properties/:id - Delete property, owner or admin
router.delete('/:id', getUser, async (req, res) => {
  const { data: prop } = await supabase
   .from('properties')
   .select('host_id')
   .eq('id', req.params.id)
   .single()

  if (!prop) return res.status(404).json({ error: 'Not found' })
  if (prop.host_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  await supabase.from('properties').delete().eq('id', req.params.id)
  res.json({ msg: 'Deleted' })
})

module.exports = router