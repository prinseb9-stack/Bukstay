const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  res.json({ message: 'Traveller route working' })
})

module.exports = router
