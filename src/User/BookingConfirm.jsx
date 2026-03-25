import { Container, Button, Alert, Spinner } from 'react-bootstrap'
import axios from 'axios'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'

// ─── CONFIG ─────────────────
const BANK_CODE = 'TPB'
const BANK_ACCOUNT = '0393863658'
const ACCOUNT_NAME = 'DO MANH DUONG'

// QR tĩnh
const QR_STATIC = `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACCOUNT}-compact.png`

const API = 'http://localhost:3001'
const HOLD_SECONDS = 180
const POLL_INTERVAL_MS = 3000

const formatVND = (a) => (a || 0).toLocaleString('vi-VN') + 'đ'

export default function BookingConfirm() {

    const [bookingData, setBookingData] = useState(null)
    const [txRef, setTxRef] = useState('')
    const [amount, setAmount] = useState(0)

    const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS)
    const [status, setStatus] = useState('loading')

    const timerRef = useRef(null)
    const pollRef = useRef(null)

    const navigate = useNavigate()

    // ─── INIT ─────────────────
    useEffect(() => {
        const raw = sessionStorage.getItem('bookingData')
        if (!raw) return navigate('/')

        const data = JSON.parse(raw)
        setBookingData(data)

        const init = async () => {
            try {
                const res = await axios.post(`${API}/create-payment`, {
                    amount: data.finalAmount
                })

                setTxRef(res.data.txRef)
                setAmount(res.data.amount)
                setStatus('pending')

            } catch (err) {
                console.error("❌ CREATE PAYMENT ERROR:", err)
            }
        }

        init()
    }, [])

    // ─── POLLING ─────────────────
    useEffect(() => {
        if (!txRef) return

        pollRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API}/check-payment/${txRef}`)

                if (res.data.status === 'success') {
                    setStatus('success')
                    clearInterval(pollRef.current)
                    clearInterval(timerRef.current)
                }

            } catch (err) {
                console.error("❌ CHECK ERROR:", err)
            }
        }, POLL_INTERVAL_MS)

        return () => clearInterval(pollRef.current)
    }, [txRef])

    // ─── COUNTDOWN ─────────────────
    useEffect(() => {
        if (status !== 'pending') return

        timerRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    setStatus('expired')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerRef.current)
    }, [status])

    const copy = () => {
        navigator.clipboard.writeText(txRef)
    }

    // ─── STATES ─────────────────
    if (status === 'loading') return <Spinner />

    if (status === 'success') {
        return (
            <Container className="py-5 text-center">
                <h2 className="text-success">🎉 Thanh toán thành công</h2>
                <Button onClick={() => navigate('/')}>Về trang chủ</Button>
            </Container>
        )
    }

    if (status === 'expired') {
        return (
            <Container className="py-5 text-center">
                <h3 className="text-danger">Hết thời gian giữ slot</h3>
                <Button onClick={() => navigate('/')}>Đặt lại</Button>
            </Container>
        )
    }

    // ─── UI ─────────────────
    return (
        <Container className="py-4" style={{ maxWidth: 420 }}>

            <h3 className="mb-3">Thanh toán QR</h3>

            <Alert variant="warning" className="text-center">
                Còn {secondsLeft}s
            </Alert>

            {/* QR */}
            <div className="text-center mb-4">
                <img
                    src={QR_STATIC}
                    alt="QR"
                    style={{
                        width: 260,
                        height: 260,
                        borderRadius: 12,
                        border: '2px solid #198754'
                    }}
                />
            </div>

            <Alert>
                <div><b>Số tiền:</b> {formatVND(amount)}</div>
                <div><b>Ngân hàng:</b> TPBank</div>
                <div><b>STK:</b> {BANK_ACCOUNT}</div>
                <div><b>Tên:</b> {ACCOUNT_NAME}</div>

                <hr />

                <div><b>Nội dung CK:</b></div>
                <code>{txRef}</code>

                <div className="mt-2">
                    <Button size="sm" onClick={copy}>
                        📋 Copy nội dung
                    </Button>
                </div>
            </Alert>

            <p className="text-center text-muted small">
                Sau khi chuyển khoản, hệ thống sẽ tự xác nhận
            </p>

        </Container>
    )
}