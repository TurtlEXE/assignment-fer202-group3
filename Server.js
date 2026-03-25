const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// ───────── FAKE DATABASE ─────────
let payments = []

// ───────── LOG REQUEST ─────────
app.use((req, res, next) => {
    console.log("👉", req.method, req.url)
    next()
})

// ───────── CREATE PAYMENT (POST) ─────────
app.post('/create-payment', (req, res) => {
    const { amount } = req.body

    const txRef = 'PKL' + Date.now()

    const payment = {
        txRef,
        amount,
        status: 'pending'
    }

    payments.push(payment)

    console.log("🆕 Payment created:", payment)

    res.json(payment)
})

// ───────── CREATE PAYMENT (GET - TEST) ─────────
app.get('/create-payment', (req, res) => {
    const txRef = 'PKL' + Date.now()

    const payment = {
        txRef,
        amount: 10000,
        status: 'pending'
    }

    payments.push(payment)

    console.log("🆕 Payment created:", payment)

    res.json(payment)
})

// ───────── CHECK PAYMENT STATUS ─────────
app.get('/check-payment/:txRef', (req, res) => {
    const { txRef } = req.params

    const payment = payments.find(p => p.txRef === txRef)

    if (!payment) {
        return res.json({ status: 'not_found' })
    }

    res.json({ status: payment.status })
})

// ───────── WEBHOOK SEPAY ─────────
app.post('/webhook/sepay', (req, res) => {
    console.log("🔥 WEBHOOK RECEIVED:")
    console.log(req.body)

    // SePay có thể gửi nhiều field khác nhau
    const content =
        req.body.content ||
        req.body.description ||
        req.body.transferContent ||
        ''

    if (!content) {
        console.log("❌ No transfer content")
        return res.sendStatus(200)
    }

    // Tìm mã PKLxxxxx
    const match = content.toUpperCase().match(/PKL\d+/)

    if (!match) {
        console.log("❌ No PKL code found")
        return res.sendStatus(200)
    }

    const txRef = match[0]
    console.log("👉 FOUND TXREF:", txRef)

    const payment = payments.find(p => p.txRef === txRef)

    if (payment) {
        payment.status = 'success'
        console.log("✅ PAYMENT SUCCESS:", txRef)
    } else {
        console.log("❌ PAYMENT NOT FOUND:", txRef)
    }

    res.sendStatus(200)
})

// ───────── WEBHOOK TEST (GET) ─────────
app.get('/webhook/sepay', (req, res) => {
    res.send("Webhook is working")
})

// ───────── ROOT TEST ─────────
app.get('/', (req, res) => {
    res.send("Server is running")
})

// ───────── START SERVER ─────────
app.listen(3001, () => {
    console.log("🚀 Server running at http://localhost:3001")
})