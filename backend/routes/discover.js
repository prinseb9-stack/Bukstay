const express = require('express')
const { supabase } = require('../db/supabase.js')
const router = express.Router()

router.get('/videos', async (req, res) => {
  const { data, error } = await supabase
    .from('discover_videos')
    .select('*, properties(id, title, city)')
    .order('created_at', { ascending: false })
  if (error) return res.status(400).json({ error })
  res.json(data)
})

module.exports = router
