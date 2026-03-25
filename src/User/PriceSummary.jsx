import { Container, Table, Button, Alert } from 'react-bootstrap'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'

export default function PriceSummary() {
    const [complex, setComplex] = useState(null)
    const [court, setCourt] = useState(null)
    const [priceRules, setPriceRules] = useState([])

    const [bookingData, setBookingData] = useState(null)
    const [priceDetails, setPriceDetails] = useState([])
    const [totalAmount, setTotalAmount] = useState(0)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [finalAmount, setFinalAmount] = useState(0)

    const navigate = useNavigate()

    useEffect(() => {
        const raw = sessionStorage.getItem('bookingData')
        if (!raw) {
            navigate('/')
            return
        }

        const data = JSON.parse(raw)
        setBookingData(data)

        const getData = async () => {
            const complexRes = await axios.get(`http://localhost:9999/complexes/${data.complexId}`)
            const complexData = complexRes.data
            setComplex(complexData)

            const courtRes = await axios.get(`http://localhost:9999/courts/${data.courtId}`)
            const courtData = courtRes.data
            setCourt(courtData)

            const priceRulesRes = await axios.get('http://localhost:9999/priceRules')
            const rules = priceRulesRes.data.filter(r => r.complexId === data.complexId)
            setPriceRules(rules)

            // Tính giá từng slot
            const details = data.slots.map(slot => {
                const price = calcSlotPrice(slot, courtData.courtType, data.date, rules)
                return { slot, price }
            })
            setPriceDetails(details)

            const total = details.reduce((sum, d) => sum + d.price, 0)
            const discount = Math.round(total * (complexData.discountRate || 0) / 100)
            const final = total - discount

            setTotalAmount(total)
            setDiscountAmount(discount)
            setFinalAmount(final)
        }

        getData()
    }, [])

    // Xác định dayType từ date
    const getDayType = (dateStr) => {
        const date = new Date(dateStr)
        const day = date.getDay() // 0=Sun, 6=Sat
        if (day === 0 || day === 6) return 'weekend'
        return 'weekday'
        // holiday cần bảng riêng, tạm bỏ qua
    }

    // Tìm priceRule phù hợp cho slot
    const calcSlotPrice = (slot, courtType, date, rules) => {
        const dayType = getDayType(date)
        const slotStart = slot.slotStart // "06:00:00"
        const slotEnd = slot.slotEnd

        const rule = rules.find(r =>
            r.courtType === courtType &&
            r.dayType === dayType &&
            r.startTime <= slotStart &&
            r.endTime >= slotEnd
        )

        if (!rule) return 0

        
        const [sh, sm] = slotStart.split(':').map(Number)
        const [eh, em] = slotEnd.split(':').map(Number)
        const hours = (eh * 60 + em - sh * 60 - sm) / 60

        return rule.pricePerHour * hours
    }

    const formatVND = (amount) =>
        amount.toLocaleString('vi-VN') + 'đ'

    const handleConfirm = () => {
        // Lưu thêm giá vào sessionStorage
        sessionStorage.setItem('bookingData', JSON.stringify({
            ...bookingData,
            totalAmount,
            discountAmount,
            finalAmount
        }))
        navigate('/booking/confirm')
    }

    if (!bookingData) return null

    return (
        <Container className="py-4" style={{ maxWidth: 640 }}>
            <Button
                variant="outline-secondary"
                size="sm"
                className="mb-3"
                onClick={() => navigate(-1)}
            >
                ← Quay lại
            </Button>

            <h2 className="mb-4">Xác nhận đặt sân</h2>

            {complex && court && (
                <Alert variant="light" className="border mb-4">
                    <div><strong>Khu sân:</strong> {complex.name}</div>
                    <div><strong>Sân:</strong> {court.name}</div>
                    <div><strong>Ngày:</strong> {bookingData.date}</div>
                </Alert>
            )}

            <Table bordered hover responsive>
                <thead className="table-success">
                    <tr>
                        <th>Khung giờ</th>
                        <th className="text-end">Đơn giá</th>
                    </tr>
                </thead>
                <tbody>
                    {priceDetails.map(({ slot, price }) => (
                        <tr key={slot.id}>
                            <td>{slot.slotStart.slice(0, 5)} – {slot.slotEnd.slice(0, 5)}</td>
                            <td className="text-end">{formatVND(price)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Tổng tiền</strong></td>
                        <td className="text-end"><strong>{formatVND(totalAmount)}</strong></td>
                    </tr>
                    {discountAmount > 0 && (
                        <tr className="table-success">
                            <td>Giảm giá ({complex?.discountRate}%)</td>
                            <td className="text-end text-success">- {formatVND(discountAmount)}</td>
                        </tr>
                    )}
                    <tr className="table-warning">
                        <td><strong>Thanh toán</strong></td>
                        <td className="text-end text-danger fw-bold">{formatVND(finalAmount)}</td>
                    </tr>
                </tfoot>
            </Table>

            <Button
                variant="success"
                size="lg"
                className="w-100 mt-2"
                onClick={handleConfirm}
                disabled={finalAmount === 0}
            >
                Tiến hành thanh toán →
            </Button>
        </Container>
    )
}