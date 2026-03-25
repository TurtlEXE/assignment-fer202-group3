import { Card, Col, Container, Row, Form, Badge } from 'react-bootstrap'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'

export default function ListComplexes() {
    const [complexes, setComplexes] = useState([])
    const [amenities, setAmenities] = useState([])
    const [search, setSearch] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        const getData = async () => {
            const complexesRes = await axios.get('http://localhost:9999/complexes')
            // Chỉ lấy khu sân active
            const activeComplexes = complexesRes.data.filter(c => c.status === 'active')
            setComplexes(activeComplexes)

            const amenitiesRes = await axios.get('http://localhost:9999/complexAmenities')
            setAmenities(amenitiesRes.data)
        }

        getData()
    }, [])

    // Lấy amenities của từng complex
    const getAmenities = (complexId) => {
        return amenities.filter(a => a.complexId === complexId)
    }

    // Filter theo tên khu
    const filtered = complexes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelectComplex = (complexId) => {
        navigate(`/complex/${complexId}/courts`)
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Danh sách khu Pickleball</h2>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm khu sân..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
            </Row>

            <Row>
                {filtered.map(c => (
                    <Col md={6} key={c.id} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title>{c.name}</Card.Title>

                                <Card.Text className="text-muted small">
                                    📍 {c.address}
                                </Card.Text>

                                <Card.Text className="small">
                                    ⏰ {c.openTime} – {c.closeTime}
                                </Card.Text>

                                <Card.Text className="small">
                                    📞 {c.phone}
                                </Card.Text>

                                {c.discountRate > 0 && (
                                    <Badge bg="success" className="mb-2">
                                        Giảm {c.discountRate}%
                                    </Badge>
                                )}

                                <div className="mb-3 d-flex flex-wrap gap-1">
                                    {getAmenities(c.id).map(a => (
                                        <Badge key={a.id} bg="secondary" className="fw-normal">
                                            {a.name}
                                        </Badge>
                                    ))}
                                </div>

                                <Card.Text className="small text-muted">
                                    {c.description}
                                </Card.Text>

                                <button
                                    className="btn btn-success btn-sm mt-2"
                                    onClick={() => handleSelectComplex(c.id)}
                                >
                                    Xem sân & đặt lịch
                                </button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}

                {filtered.length === 0 && (
                    <Col>
                        <p className="text-muted">Không tìm thấy khu sân nào.</p>
                    </Col>
                )}
            </Row>
        </Container>
    )
}