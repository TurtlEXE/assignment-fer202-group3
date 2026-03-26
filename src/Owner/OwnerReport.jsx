import { useContext, useMemo, useState } from "react";
import { globalContext } from "../GlobalContextProvider";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#0dcaf0", "#6f42c1"];

export default function OwnerReport() {
    const { currentUser, complexes, courts, courtSchedules } = useContext(globalContext);

    // Lấy khu của owner hiện tại
    const ownerComplexes = complexes.filter(c => c.ownerId === currentUser?.id);

    const [selectedComplexId, setSelectedComplexId] = useState(ownerComplexes[0]?.id || "");

    // Courts thuộc khu được chọn
    const complexCourts = courts.filter(c => c.complexId === selectedComplexId);
    const courtIds      = complexCourts.map(c => c.id);

    // Schedules booked của khu được chọn
    const bookedSchedules = useMemo(() =>
        courtSchedules.filter(cs => cs.status === "booked" && courtIds.includes(cs.courtId)),
        [courtSchedules, courtIds]
    );

    // ── 1. Lượt đặt theo ngày (14 ngày gần nhất) ────────────────────────────
    const byDay = useMemo(() => {
        const map = {};
        bookedSchedules.forEach(cs => {
            map[cs.date] = (map[cs.date] || 0) + 1;
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-14)
            .map(([date, count]) => ({
                date: date.slice(5), // MM-DD
                "Lượt đặt": count,
            }));
    }, [bookedSchedules]);

    // ── 2. Lượt đặt theo từng sân (pie chart) ───────────────────────────────
    const byCourt = useMemo(() =>
        complexCourts.map(court => ({
            name:  court.name,
            value: bookedSchedules.filter(cs => cs.courtId === court.id).length,
        })),
        [bookedSchedules, complexCourts]
    );

    // ── 3. Lượt đặt theo khung giờ (slotId → giờ) ───────────────────────────
    const bySlot = useMemo(() => {
        const map = {};
        bookedSchedules.forEach(cs => {
            // slotId dạng T2_1..T2_16, T1_1..T1_32
            // Quy đổi sang giờ bằng index: T2_N → (N-1)*60 + 6h
            const match = cs.slotId.match(/^T(\d+)_(\d+)$/);
            if (!match) return;
            const [, type, idx] = match;
            const durMin  = type === "1" ? 30 : type === "2" ? 60 : 120;
            const startMin = 6 * 60 + (parseInt(idx) - 1) * durMin;
            const hh = String(Math.floor(startMin / 60)).padStart(2, "0");
            const mm = String(startMin % 60).padStart(2, "0");
            const label = `${hh}:${mm}`;
            map[label] = (map[label] || 0) + 1;
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([hour, count]) => ({ hour, "Lượt đặt": count }));
    }, [bookedSchedules]);

    // ── 4. Lượt đặt theo thứ trong tuần ─────────────────────────────────────
    const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const byDow = useMemo(() => {
        const map = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        bookedSchedules.forEach(cs => {
            const dow = new Date(cs.date).getDay();
            map[dow]++;
        });
        return Object.entries(map).map(([d, count]) => ({
            day: DOW[d],
            "Lượt đặt": count,
        }));
    }, [bookedSchedules]);

    // ── Summary cards ────────────────────────────────────────────────────────
    const totalBooked  = bookedSchedules.length;
    const uniqueDates  = new Set(bookedSchedules.map(cs => cs.date)).size;
    const avgPerDay    = uniqueDates ? (totalBooked / uniqueDates).toFixed(1) : 0;
    const topCourt     = [...byCourt].sort((a, b) => b.value - a.value)[0];

    if (ownerComplexes.length === 0) {
        return (
            <Container className="py-4">
                <div style={{ textAlign: "center", color: "#6c757d", padding: 60 }}>
                    Bạn chưa có khu nào để xem thống kê.
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Header + Select khu */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{ margin: 0, fontWeight: 700 }}>📊 Thống kê lượt đặt sân</h5>
                <Form.Select
                    style={{ width: 260 }}
                    value={selectedComplexId}
                    onChange={e => setSelectedComplexId(e.target.value)}
                >
                    {ownerComplexes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </Form.Select>
            </div>

            {/* Summary cards */}
            <Row className="g-3 mb-4">
                {[
                    { label: "Tổng lượt đặt",    value: totalBooked,       color: "#0d6efd" },
                    { label: "Số ngày có đặt",    value: uniqueDates,       color: "#198754" },
                    { label: "TB lượt/ngày",      value: avgPerDay,         color: "#ffc107" },
                    { label: "Sân hot nhất",       value: topCourt?.name || "—", color: "#dc3545" },
                ].map(({ label, value, color }) => (
                    <Col xs={6} md={3} key={label}>
                        <Card body style={{ borderTop: `4px solid ${color}`, textAlign: "center" }}>
                            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
                            <div style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>{label}</div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Chart 1: Lượt đặt theo ngày */}
            <Card className="mb-4">
                <Card.Header><strong>Lượt đặt theo ngày (14 ngày gần nhất)</strong></Card.Header>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={byDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="Lượt đặt" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                {/* Chart 2: Theo sân */}
                <Col md={5}>
                    <Card className="h-100">
                        <Card.Header><strong>Lượt đặt theo sân</strong></Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={byCourt}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, percent }) =>
                                            `${name} (${(percent * 100).toFixed(0)}%)`
                                        }
                                        labelLine={false}
                                    >
                                        {byCourt.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`${v} lượt`, ""]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Chart 3: Theo thứ */}
                <Col md={7}>
                    <Card className="h-100">
                        <Card.Header><strong>Lượt đặt theo thứ trong tuần</strong></Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={byDow} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" tick={{ fontSize: 13 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="Lượt đặt" fill="#198754" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Chart 4: Theo khung giờ */}
            <Card>
                <Card.Header><strong>Lượt đặt theo khung giờ trong ngày</strong></Card.Header>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={bySlot} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Lượt đặt"
                                stroke="#ffc107"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </Container>
    );
}