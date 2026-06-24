const express = require('express')

const { getUser } = require('../middleware/auth')

const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'traveler' } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } }
  })
  if (error) return res.status(400).json({ error: error.message })

  // Save to users table
  await supabase.from('users').insert({
    id: data.user.id,
    name,
    email,
    role,
    traveler_mode: role === 'traveler' || role === 'both',
    host_mode: role === 'host' || role === 'both'
  })

  res.json({
    token: data.session?.access_token,
    user: { id: data.user.id, name, email, role }
  })
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(401).json({ error: error.message })

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      name: profile?.name,
      email: data.user.email,
      role: profile?.role
    }
  })
})

// Get current user
router.get('/me', getUser, async (req, res) => {
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single()
  res.json(profile)
})

module.exports = router
