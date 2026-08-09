import express from 'express'
import { getFlights } from './api/flights.js'
import { getThreats } from './api/threats.js'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 4200

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kcn-command-center-server' })
})

app.get('/api/flights', async (_req, res) => {
  try {
    const data = await getFlights()
    res.json(data)
  } catch (err) {
    console.error('[api/flights] failed:', err)
    res.status(502).json({ error: 'Failed to fetch flight data' })
  }
})

app.get('/api/threats', async (_req, res) => {
  try {
    const data = await getThreats()
    res.json(data)
  } catch (err) {
    console.error('[api/threats] failed:', err)
    res.status(502).json({ error: 'Failed to fetch threat data' })
  }
})

app.listen(PORT, () => {
  console.log(`KCN Command Center server listening on :${PORT}`)
})
