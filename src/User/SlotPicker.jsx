import { Container, Row, Col, Button, Form, Badge } from 'react-bootstrap'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import React from 'react'

const genId = () => crypto.randomUUID()

const getToday = () => {
    const now = new Date()
    const offset = 7 * 60
    const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000)
    return local.toISOString().split('T')[0]
}

export default function SlotPicker() {
    const { complexId, courtId } = useParams()

    const [complex, setComplex] = useState(null)
    const [court, setCourt] = useState(null)
    const [slots, setSlots] = useState([])
    const [schedules, setSchedules] = useState([])
    const [loadingContinue, setLoadingContinue] = useState(false)

    // Tick moi 30 giay de tu dong cap nhat slot da qua gio
    const [, setTick] = useState(0)

    const navigate = useNavigate()

    const today = getToday()
    const [selectedDate, setSelectedDate] = useState(today)
    const [selectedSlots, setSelectedSlots] = useState([])

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const [y, m, d] = dateStr.split('-')
        return `${d}/${m}/${y}`
    }

    useEffect(() => {
        const getData = async () => {
            const complexRes = await axios.get(`http://localhost:9999/complexes/${complexId}`)
            setComplex(complexRes.data)

            const courtRes = await axios.get(`http://localhost:9999/courts/${courtId}`)
            setCourt(courtRes.data)

            const slotsRes = await axios.get('http://localhost:9999/slots')
            setSlots(slotsRes.data)

            const schedulesRes = await axios.get('http://localhost:9999/courtSchedules')
            setSchedules(schedulesRes.data)
        }

        getData()
    }, [complexId, courtId])

    // Tick moi 30 giay -> React re-render -> isSlotPast tinh lai theo gio thuc
    useEffect(() => {
        if (selectedDate !== today) return
        const interval = setInterval(() => {
            setTick(t => t + 1)
            // Xoa khoi selectedSlots neu slot do vua bi qua gio
            setSelectedSlots(prev => prev.filter(slot => {
                const [h, m] = slot.slotEnd.split(':').map(Number)
                const slotEndTime = new Date()
                slotEndTime.setHours(h, m, 0, 0)
                return slotEndTime > new Date()
            }))
        }, 30000)

        return () => clearInterval(interval)
    }, [selectedDate, today])

    const reloadSchedules = async () => {
        const schedulesRes = await axios.get('http://localhost:9999/courtSchedules')
        setSchedules(schedulesRes.data)
    }

    useEffect(() => {
        setSelectedSlots([])
        reloadSchedules()
    }, [selectedDate])

    const filteredSlots = slots.filter(s => complex && s.slotType === complex.slotType)

    const isSlotPast = (slot) => {
        if (selectedDate !== today) return false
        const [h, m] = slot.slotEnd.split(':').map(Number)
        const slotEndTime = new Date()
        slotEndTime.setHours(h, m, 0, 0)
        return slotEndTime <= new Date()
    }

    const getSlotStatus = (slotId) => {
        const slot = filteredSlots.find(s => s.id === slotId)
        if (slot && isSlotPast(slot)) return 'past'

        // Lay tat ca schedule, bo qua expired
        const allSchedules = schedules.filter(
            s => s.courtId === courtId && s.slotId === slotId
                && s.date === selectedDate && s.status !== 'expired'
        )
        if (allSchedules.length === 0) return 'available'

        // Uu tien: booked > blocked > holding
        const priority = ['booked', 'blocked', 'holding']
        for (const p of priority) {
            const found = allSchedules.find(s => s.status === p)
            if (found) {
                // Holding het han thi bo qua
                if (found.status === 'holding' && found.holdExpiredAt) {
                    if (new Date(found.holdExpiredAt) < new Date()) continue
                }
                return found.status
            }
        }

        return 'available'
    }

    const isSlotSelectable = (slotId) => getSlotStatus(slotId) === 'available'

    const handleToggleSlot = (slot) => {
        if (!isSlotSelectable(slot.id)) return
        setSelectedSlots(prev => {
            const exists = prev.find(s => s.id === slot.id)
            if (exists) return prev.filter(s => s.id !== slot.id)
            return [...prev, slot]
        })
    }

    const isSelected = (slotId) => selectedSlots.some(s => s.id === slotId)

    const getSlotBtnVariant = (slotId) => {
        const status = getSlotStatus(slotId)
        if (isSelected(slotId)) return 'success'
        if (status === 'past') return 'dark'
        if (status === 'booked') return 'danger'
        if (status === 'holding') return 'warning'
        if (status === 'blocked') return 'secondary'
        return 'outline-primary'
    }

    const getSlotLabel = (slotId) => {
        const status = getSlotStatus(slotId)
        if (status === 'past') return 'Đã qua'
        if (status === 'booked') return 'Đã đặt'
        if (status === 'holding') return 'Đang giữ'
        if (status === 'blocked') return 'Đã khoá'
        return ''
    }

    const handleContinue = async () => {
        if (!selectedDate || selectedSlots.length === 0) return
        setLoadingContinue(true)

        try {
            const holdExpiredAt = new Date(Date.now() + 3 * 60 * 1000).toISOString()
            const holdingIds = []

            for (const slot of selectedSlots) {
                const id = genId()
                holdingIds.push(id)
                await axios.post('http://localhost:9999/courtSchedules', {
                    id,
                    courtId,
                    slotId: slot.id,
                    status: 'holding',
                    date: selectedDate,
                    bookingItemId: null,
                    holdExpiredAt
                })
            }

            sessionStorage.setItem('bookingData', JSON.stringify({
                complexId,
                courtId,
                date: selectedDate,
                slots: selectedSlots,
                holdingIds,
                holdExpiredAt
            }))

            navigate('/booking/summary')
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingContinue(false)
        }
    }

    return (
        <Container className="py-4">
            <Button
                variant="outline-secondary"
                size="sm"
                className="mb-3"
                onClick={() => navigate(`/complex/${complexId}/courts`)}
            >
                ← Quay lại
            </Button>

            {court && complex && (
                <h2 className="mb-4">{court.name} – {complex.name}</h2>
            )}

            <Form.Group className="mb-4" style={{ maxWidth: 300 }}>
                <Form.Label><strong>Chọn ngày</strong></Form.Label>
                <Form.Control
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate && (
                    <Form.Text className="text-muted">
                        Lịch ngày: <strong>{formatDate(selectedDate)}</strong>
                    </Form.Text>
                )}
            </Form.Group>

            <h5 className="mb-3">Chọn khung giờ – {formatDate(selectedDate)}</h5>

            <div className="d-flex gap-2 mb-3 small flex-wrap align-items-center">
                <Badge bg="primary" className="fw-normal">Trống</Badge>
                <Badge bg="success">Đã chọn</Badge>
                <Badge bg="warning" text="dark">Đang giữ</Badge>
                <Badge bg="danger">Đã đặt</Badge>
                <Badge bg="secondary">Đã khoá</Badge>
                <Badge bg="dark">Đã qua</Badge>
            </div>

            <Row className="g-2">
                {filteredSlots.map(slot => (
                    <Col xs={6} md={3} key={slot.id}>
                        <button
                            className={`btn btn-${getSlotBtnVariant(slot.id)} w-100`}
                            disabled={!isSlotSelectable(slot.id)}
                            onClick={() => handleToggleSlot(slot)}
                        >
                            {slot.slotStart.slice(0, 5)} – {slot.slotEnd.slice(0, 5)}
                            {getSlotLabel(slot.id) && (
                                <div style={{ fontSize: '0.7rem' }}>
                                    {getSlotLabel(slot.id)}
                                </div>
                            )}
                        </button>
                    </Col>
                ))}
            </Row>

            <div className="mt-4 p-3 bg-light rounded">
                <strong>Đã chọn: </strong>
                {selectedSlots.length === 0
                    ? <span className="text-muted">Chưa chọn khung giờ nào</span>
                    : selectedSlots
                        .sort((a, b) => a.slotStart.localeCompare(b.slotStart))
                        .map(s => `${s.slotStart.slice(0, 5)}–${s.slotEnd.slice(0, 5)}`)
                        .join(', ')
                }
            </div>

            <Button
                variant="success"
                className="mt-3"
                disabled={selectedSlots.length === 0 || loadingContinue}
                onClick={handleContinue}
            >
                {loadingContinue ? 'Đang xử lý...' : 'Tiếp tục →'}
            </Button>
        </Container>
    )
}