const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../db/supabase')
const { getUser } = require('../middleware/auth')
const router = express.Router()

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'traveler' } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single()
  if (existing) return res.status(400).json({ error: 'Email already exists' })

  const password_hash = await bcrypt.hash(password, 10)
  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash, role })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data: user } = await supabase.from('users').select('*').eq('email', email).single()

  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.get('/me', getUser, (req, res) => {
  const { id, name, email, role, bio, country, travel_style } = req.user
  res.json({ id, name, email, role, bio, country, travel_style })
})

module.exports = router
