const jwt = require('jsonwebtoken')
const supabase = require('../db/supabase')

const getUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return res.status(401).json({ error: 'Invalid token' })

    req.user = user
    next()
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { getUser }
