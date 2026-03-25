const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
app.use(cors())
app.use(express.json())

// ───────── FAKE DATABASE ─────────
let payments = []
const DB_PATH = path.join(__dirname, 'database.json')

const readDb = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))

const writeDb = (db) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n', 'utf8')
}

const genId = () => crypto.randomUUID()

const genBookingCode = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `PKL-${y}${m}${d}-${String(now.getTime()).slice(-4)}`
}

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

app.post('/confirm-booking', (req, res) => {
    try {
        const { txRef, customerId, bookingData } = req.body

        if (!txRef || !customerId || !bookingData) {
            return res.status(400).json({ message: 'Missing booking confirmation data.' })
        }

        const payment = payments.find(p => p.txRef === txRef)
        if (!payment || payment.status !== 'success') {
            return res.status(400).json({ message: 'Payment has not been completed.' })
        }

        const db = readDb()
        const existingPayment = db.payments.find(item => item.transactionRef === txRef)
        if (existingPayment) {
            return res.json({
                bookingId: existingPayment.bookingId,
                paymentId: existingPayment.id,
                alreadyConfirmed: true
            })
        }

        const customer = db.users.find(user => user.id === customerId && user.role === 'customer')
        if (!customer) {
            return res.status(400).json({ message: 'Customer account is invalid.' })
        }

        const {
            complexId,
            courtId,
            date,
            slots = [],
            holdingIds = [],
            totalAmount = 0,
            discountAmount = 0,
            finalAmount = 0
        } = bookingData

        if (!complexId || !courtId || !date || slots.length === 0 || holdingIds.length !== slots.length) {
            return res.status(400).json({ message: 'Booking data is incomplete.' })
        }

        const holdMap = new Map(db.courtSchedules.map(item => [item.id, item]))
        const invalidHold = holdingIds.find((holdId, index) => {
            const hold = holdMap.get(holdId)
            return !hold
                || hold.status !== 'holding'
                || hold.courtId !== courtId
                || hold.date !== date
                || hold.slotId !== slots[index]?.id
        })

        if (invalidHold) {
            return res.status(409).json({ message: 'Selected slots are no longer available.' })
        }

        const bookingId = genId()
        const bookingItemId = genId()
        const paymentId = genId()
        const createdAt = new Date().toISOString()

        db.bookings.push({
            id: bookingId,
            bookingCode: genBookingCode(),
            customerId,
            complexId,
            status: 'paid',
            totalAmount,
            discountAmount,
            finalAmount,
            note: null,
            cancelledReason: null,
            cancelledAt: null,
            createdAt
        })

        db.bookingItems.push({
            id: bookingItemId,
            bookingId,
            courtId,
            date,
            totalAmount: finalAmount
        })

        db.payments.push({
            id: paymentId,
            bookingId,
            method: 'qr_tpb',
            amount: finalAmount,
            status: 'success',
            transactionRef: txRef,
            gatewayResponse: {
                txRef,
                message: 'Mock payment confirmed'
            },
            paidAt: createdAt,
            refundedAt: null,
            createdAt
        })

        db.courtSchedules = db.courtSchedules.map(item => {
            if (!holdingIds.includes(item.id)) return item
            return {
                id: item.id,
                courtId: item.courtId,
                slotId: item.slotId,
                status: 'booked',
                date: item.date,
                bookingItemId
            }
        })

        writeDb(db)

        res.json({ bookingId, bookingItemId, paymentId, status: 'paid' })
    } catch (error) {
        console.error('CONFIRM BOOKING ERROR:', error)
        res.status(500).json({ message: 'Could not confirm booking.' })
    }
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
