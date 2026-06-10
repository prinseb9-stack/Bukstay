const jwt = require('jsonwebtoken')
const supabase = require('../db/supabase')

const getUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', decoded.userId)
    .single()

    if (error ||!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { getUser }
