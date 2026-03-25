import { Card, Col, Container, Row, Badge, Button } from 'react-bootstrap'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import React from 'react'

export default function ListCourt() {
    const { complexId } = useParams()

    const [complex, setComplex] = useState(null)
    const [courts, setCourts] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        const getData = async () => {
            const complexRes = await axios.get(`http://localhost:9999/complexes/${complexId}`)
            setComplex(complexRes.data)

            const courtsRes = await axios.get('http://localhost:9999/courts')
            
            const activeCourts = courtsRes.data.filter(
                c => c.complexId === complexId && c.status === 'active'
            )
            setCourts(activeCourts)
        }

        getData()
    }, [complexId])

    const getCourtTypeName = (type) => {
        const map = { indoor: 'Trong nhà', covered: 'Có mái che', outdoor: 'Ngoài trời' }
        return map[type] || type
    }

    const getSurfaceTypeName = (type) => {
        const map = { cushion: 'Cushion', hardcourt: 'Hardcourt', concrete: 'Bê tông' }
        return map[type] || type
    }

    const getCourtTypeBadge = (type) => {
        const map = { indoor: 'primary', covered: 'warning', outdoor: 'success' }
        return map[type] || 'secondary'
    }

    const handleSelectCourt = (courtId) => {
        navigate(`/complex/${complexId}/courts/${courtId}/slots`)
    }

    return (
        <Container className="py-4">
            <Button
                variant="outline-secondary"
                size="sm"
                className="mb-3"
                onClick={() => navigate('/')}
            >
                ← Quay lại
            </Button>

            {complex && (
                <>
                    <h2 className="mb-1">{complex.name}</h2>
                    <p className="text-muted mb-4">
                        📍 {complex.address} &nbsp;|&nbsp; ⏰ {complex.openTime} – {complex.closeTime}
                    </p>
                </>
            )}

            <h5 className="mb-3">Chọn sân để đặt lịch</h5>

            <Row>
                {courts.map(court => (
                    <Col md={4} key={court.id} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title>{court.name}</Card.Title>

                                <div className="mb-2 d-flex gap-1 flex-wrap">
                                    <Badge bg={getCourtTypeBadge(court.courtType)}>
                                        {getCourtTypeName(court.courtType)}
                                    </Badge>
                                    <Badge bg="secondary">
                                        {getSurfaceTypeName(court.surfaceType)}
                                    </Badge>
                                </div>

                                <Card.Text className="small text-muted">
                                    {court.description}
                                </Card.Text>

                                <button
                                    className="btn btn-success btn-sm mt-2 w-100"
                                    onClick={() => handleSelectCourt(court.id)}
                                >
                                    Chọn sân này
                                </button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}

                {courts.length === 0 && (
                    <Col>
                        <p className="text-muted">Khu này hiện chưa có sân khả dụng.</p>
                    </Col>
                )}
            </Row>
        </Container>
    )
}