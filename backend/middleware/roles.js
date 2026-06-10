const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role) && req.user.role!== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

const requireAdmin = requireRole('admin')

module.exports = { requireRole, requireAdmin }
