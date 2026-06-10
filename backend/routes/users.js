const express = require('express')
const supabase = require('../db/supabase')
const { getUser } = require('../middleware/auth')
const router = express.Router()

router.patch('/profile', getUser, async (req, res) => {
  const { name, bio, country, travel_style, avatar } = req.body
  const { data, error } = await supabase
   .from('users')
   .update({ name, bio, country, travel_style, avatar })
   .eq('id', req.user.id)
   .select()
   .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

module.exports = router