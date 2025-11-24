import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', now: new Date().toISOString() })
})

// Mock rates endpoint
app.get('/api/rates', (req, res) => {
  const rates = {
    base: 'USD',
    timestamp: Date.now(),
    rates: {
      AED: 3.67,
      EGP: 30.12,
      SAR: 3.75
    }
  }
  res.json(rates)
})

// Mock gold prices
app.get('/api/gold', (req, res) => {
  res.json({
    unit: 'g',
    price: 75.5,
    currency: 'USD',
    fetchedAt: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
