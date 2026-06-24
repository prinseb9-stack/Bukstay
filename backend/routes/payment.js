const express = require('express')
const axios = require('axios')
const supabase = require('../db/supabase')
const { getUser } = require('../middleware/auth')
const router = express.Router()

// Initialize Paystack payment
router.post('/paystack/initialize', getUser, async (req, res) => {
  const { booking_id, amount, email } = req.body

  if (!booking_id || !amount || !email) {
    return res.status(400).json({ error: 'booking_id, amount and email are required' })
  }

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100), // Paystack uses kobo
        reference: `bukstay_${booking_id}_${Date.now()}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
        metadata: {
          booking_id,
          user_id: req.user.id
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // Save payment record
    await supabase.from('payments').insert({
      booking_id,
      user_id: req.user.id,
      amount,
      currency: 'NGN',
      status: 'pending',
      provider: 'paystack',
      reference: response.data.data.reference
    })

    res.json({
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    })
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || err.message })
  }
})

// Verify Paystack payment
router.get('/paystack/verify/:reference', getUser, async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    )

    const data = response.data.data

    if (data.status === 'success') {
      const { booking_id } = data.metadata

      // Update payment status
      await supabase.from('payments')
        .update({ status: 'success' })
        .eq('reference', req.params.reference)

      // Update booking status
      await supabase.from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking_id)

      return res.json({ success: true, booking_id })
    }

    res.json({ success: false, status: data.status })
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || err.message })
  }
})

// Paystack webhook
router.post('/paystack/webhook', async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY
  const hash = require('crypto')
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature')
  }

  const event = req.body
  if (event.event === 'charge.success') {
    const { booking_id } = event.data.metadata
    await supabase.from('payments')
      .update({ status: 'success' })
      .eq('reference', event.data.reference)
    await supabase.from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking_id)
  }

  res.sendStatus(200)
})

module.exports = router
