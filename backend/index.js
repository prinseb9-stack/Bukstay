const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const propertyRoutes = require('./routes/properties')
const bookingRoutes = require('./routes/bookings')
const discoverRoutes = require('./routes/discover')
const userRoutes = require('./routes/users')
const hostRoutes = require('./routes/host')
const adminRoutes = require('./routes/admin')
const paymentRoutes = require('./routes/payment')
const travellerRoutes = require('./routes/traveller')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.json({ msg: 'BukStay API Live' }))

app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/discover', discoverRoutes)
app.use('/api/users', userRoutes)
app.use('/api/host', hostRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/traveller', travellerRoutes)

const PORT = process.env.PORT || 8000
app.listen(PORT, '0.0.0.0', () => console.log(`Running on ${PORT}`))