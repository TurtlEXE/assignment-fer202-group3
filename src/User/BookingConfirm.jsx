import { Container, Button, Alert, Spinner } from 'react-bootstrap'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'

const BANK_CODE = 'TPB'
const BANK_ACCOUNT = '0393863658'
const ACCOUNT_NAME = 'DO MANH DUONG'

const API = 'http://localhost:3001'
const HOLD_SECONDS = 180
const POLL_INTERVAL_MS = 3000

const formatVND = (amount) => (amount || 0).toLocaleString('vi-VN') + 'd'

export default function BookingConfirm() {
    const [bookingData, setBookingData] = useState(null)
    const [txRef, setTxRef] = useState('')
    const [amount, setAmount] = useState(0)
    const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS)
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')

    const timerRef = useRef(null)
    const pollRef = useRef(null)
    const confirmStartedRef = useRef(false)

    const navigate = useNavigate()
    const transferContent = txRef || 'DANG_TAO_MA_GIAO_DICH'
    const qrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACCOUNT}-compact2.png?amount=${amount || 0}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

    useEffect(() => {
        const raw = sessionStorage.getItem('bookingData')
        if (!raw) {
            navigate('/complexes')
            return
        }

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
                console.error('CREATE PAYMENT ERROR:', err)
                setErrorMessage('Khong the tao giao dich thanh toan.')
                setStatus('error')
            }
        }

        init()
    }, [navigate])

    useEffect(() => {
        if (!txRef || status !== 'pending') return

        pollRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API}/check-payment/${txRef}`)

                if (res.data.status === 'success') {
                    clearInterval(pollRef.current)
                    clearInterval(timerRef.current)
                    setStatus('confirming')
                }
            } catch (err) {
                console.error('CHECK PAYMENT ERROR:', err)
            }
        }, POLL_INTERVAL_MS)

        return () => clearInterval(pollRef.current)
    }, [txRef, status])

    useEffect(() => {
        if (status !== 'pending') return

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    clearInterval(pollRef.current)
                    setStatus('expired')
                    return 0
                }

                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerRef.current)
    }, [status])

    useEffect(() => {
        if (status !== 'confirming' || !bookingData || !txRef || confirmStartedRef.current) return

        confirmStartedRef.current = true

        const confirmBooking = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('pb_user') || '{}')

                await axios.post(`${API}/confirm-booking`, {
                    txRef,
                    customerId: user.id,
                    bookingData
                })

                setStatus('success')
            } catch (err) {
                console.error('CONFIRM BOOKING ERROR:', err)
                setErrorMessage('Thanh toan da thanh cong nhung khong the ghi booking vao he thong.')
                setStatus('error')
            }
        }

        confirmBooking()
    }, [status, bookingData, txRef])

    const copyTransferContent = () => {
        navigator.clipboard.writeText(transferContent)
    }

    const copyAmount = () => {
        navigator.clipboard.writeText(String(amount || 0))
    }

    if (status === 'loading') {
        return (
            <Container className="py-5 text-center">
                <Spinner />
            </Container>
        )
    }

    if (status === 'confirming') {
        return (
            <Container className="py-5 text-center">
                <Spinner className="mb-3" />
                <h4>Dang xac nhan booking</h4>
            </Container>
        )
    }

    if (status === 'success') {
        return (
            <Container className="py-5 text-center">
                <h2 className="text-success">Thanh toan thanh cong</h2>
                <Button onClick={() => navigate('/complexes')}>Ve danh sach khu</Button>
            </Container>
        )
    }

    if (status === 'expired') {
        return (
            <Container className="py-5 text-center">
                <h3 className="text-danger">Het thoi gian giu slot</h3>
                <Button onClick={() => navigate('/complexes')}>Dat lai</Button>
            </Container>
        )
    }

    if (status === 'error') {
        return (
            <Container className="py-5 text-center">
                <Alert variant="danger">{errorMessage || 'Co loi xay ra trong qua trinh dat san.'}</Alert>
                <Button onClick={() => navigate('/complexes')}>Quay lai chon khu</Button>
            </Container>
        )
    }

    return (
        <Container className="py-4" style={{ maxWidth: 420 }}>
            <h3 className="mb-3">Thanh toan QR</h3>

            <Alert variant="warning" className="text-center">
                Con {secondsLeft}s
            </Alert>

            <div className="text-center mb-4">
                <img
                    src={qrUrl}
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
                <div><b>So tien:</b> {formatVND(amount)}</div>
                <div><b>Ngan hang:</b> TPBank</div>
                <div><b>STK:</b> {BANK_ACCOUNT}</div>
                <div><b>Ten:</b> {ACCOUNT_NAME}</div>
                <div><b>QR:</b> Tu dong sinh theo so tien va noi dung CK</div>

                <hr />

                <div><b>Noi dung CK:</b></div>
                <code>{transferContent}</code>

                <div className="mt-2 d-flex gap-2">
                    <Button size="sm" onClick={copyTransferContent}>
                        Copy noi dung
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={copyAmount}>
                        Copy so tien
                    </Button>
                </div>
            </Alert>

            <p className="text-center text-muted small">
                Sau khi chuyen khoan, he thong se tu xac nhan va ghi booking.
            </p>
        </Container>
    )
}
