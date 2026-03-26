import axios from "axios";
import { useContext, useState } from "react";
import {
    Badge, Button, Card, Col, Container, Form,
    Modal, Row, Tab, Tabs
} from "react-bootstrap";
import { globalContext } from "../GlobalContextProvider";

const BASE = "http://localhost:9999";

const STATUS_MAP = {
    submitted: { bg: "warning", text: "dark", label: "Chờ duyệt" },
    approved: { bg: "success", text: "white", label: "Đã duyệt" },
    rejected: { bg: "danger", text: "white", label: "Từ chối" },
    draft: { bg: "secondary", text: "white", label: "Bản nháp" },
};

const SLOT_LABEL = { "30min": "30 phút", "60min": "1 tiếng", "120min": "2 tiếng" };
const COURT_TYPE_LABEL = { indoor: "Trong nhà", outdoor: "Ngoài trời" };

// ── Helpers ───────────────────────────────────────────────────────────────────
const SectionLabel = ({ title }) => (
    <div style={{ fontWeight: 600, color: "#0d6efd", marginBottom: 10, fontSize: 14 }}>{title}</div>
);

const FieldLabel = ({ children }) => (
    <div style={{ fontSize: 12, color: "#6c757d" }}>{children}</div>
);

const EmptyMessage = ({ text }) => (
    <div style={{ color: "#6c757d", textAlign: "center", padding: 30 }}>{text}</div>
);

// ── DetailModal ───────────────────────────────────────────────────────────────
function DetailModal({
    selectedForm, reviewerNote, setReviewerNote,
    lightboxImg, setLightboxImg,
    onClose, onDecision,
    getOwner, getComplex,
}) {
    if (!selectedForm) return null;

    const owner = getOwner(selectedForm.ownerId);
    const complex = getComplex(selectedForm.complexId);
    const badge = STATUS_MAP[selectedForm.status] || STATUS_MAP.draft;
    const isPending = selectedForm.status === "submitted";
    const courts = selectedForm.courts || [];

    return (
        <>
            <Modal show onHide={onClose} size="lg" scrollable>
                <Modal.Header closeButton style={{ background: "#f8f9fa" }}>
                    <Modal.Title style={{ fontSize: 18 }}>
                        Chi tiết đơn đăng ký
                        <Badge bg={badge.bg} text={badge.text} className="ms-2" style={{ fontSize: 13 }}>
                            {badge.label}
                        </Badge>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Thông tin khu */}
                    <SectionLabel title="Thông tin khu" />
                    <Row className="g-2 mb-3">
                        <Col md={6}><FieldLabel>Tên khu</FieldLabel><div>{complex?.name || "—"}</div></Col>
                        <Col md={6}><FieldLabel>Địa chỉ</FieldLabel><div>{complex?.address || "—"}</div></Col>
                        <Col md={4}><FieldLabel>Giờ mở cửa</FieldLabel><div>{complex?.openTime} – {complex?.closeTime}</div></Col>
                        <Col md={4}><FieldLabel>SĐT</FieldLabel><div>{complex?.phone || "—"}</div></Col>
                        <Col md={4}><FieldLabel>Loại slot</FieldLabel><div>{SLOT_LABEL[selectedForm.slotType] || selectedForm.slotType}</div></Col>
                    </Row>

                    <hr />

                    {/* Thông tin chủ sân */}
                    <SectionLabel title="Thông tin chủ sân" />
                    <Row className="g-2 mb-3">
                        <Col md={4}><FieldLabel>Họ tên</FieldLabel><div>{owner?.fullName || "—"}</div></Col>
                        <Col md={4}><FieldLabel>Email</FieldLabel><div>{owner?.email}</div></Col>
                        <Col md={4}><FieldLabel>SĐT</FieldLabel><div>{owner?.phone}</div></Col>
                    
                    </Row>

                    <hr />

                    {/* Thông tin sân */}
                    <SectionLabel title={`Thông tin sân (${courts.length} sân)`} />
                    {courts.length === 0 ? (
                        <div style={{ color: "#aaa", fontSize: 13, marginBottom: 12 }}>Không có thông tin sân.</div>
                    ) : (
                        <Row className="g-2 mb-3">
                            {courts.map((court, idx) => (
                                <Col md={6} key={court.id || idx}>
                                    <Card style={{ border: "1px solid #dee2e6", fontSize: 13 }}>
                                        {court.imgBase64 && (
                                            <div style={{ cursor: "pointer" }}
                                                onClick={() => setLightboxImg(court.imgBase64)}
                                                title="Bấm để phóng to">
                                                <img src={court.imgBase64} alt={court.name}
                                                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: "4px 4px 0 0" }} />
                                            </div>
                                        )}
                                        <Card.Body className="py-2 px-3">
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}> {court.name}</div>
                                            <div style={{ color: "#6c757d" }}>
                                                Loại: {COURT_TYPE_LABEL[court.courtType] || court.courtType || "—"}
                                            </div>
                                            {court.description && (
                                                <div style={{ color: "#6c757d", marginTop: 2 }}>{court.description}</div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}

                    <hr />

                    {/* Giấy tờ */}
                    <SectionLabel title="Giấy tờ pháp lý" />
                    <Row className="g-2 mb-3">
                        {[
                            { label: "Giấy phép kinh doanh", url: selectedForm.businessLicenseUrl },
                            { label: "CCCD mặt trước", url: selectedForm.idCardFrontUrl },
                            { label: "CCCD mặt sau", url: selectedForm.idCardBackUrl },
                        ].map(({ label, url }) => (
                            <Col md={4} key={label}>
                                <FieldLabel>{label}</FieldLabel>
                                {url ? (
                                    url.startsWith("data:image") ? (
                                        <img src={url} alt={label}
                                            onClick={() => setLightboxImg(url)}
                                            title="Bấm để phóng to"
                                            style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 6, border: "1px solid #dee2e6", cursor: "pointer" }} />
                                    ) : (
                                        <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Xem file</a>
                                    )
                                ) : (
                                    <span style={{ color: "#aaa", fontSize: 13 }}>Chưa có</span>
                                )}
                            </Col>
                        ))}
                    </Row>

                    <hr />

                    {/* Ngân hàng */}
                    <SectionLabel title="Thông tin ngân hàng" />
                    <Row className="g-2 mb-3">
                        <Col md={4}><FieldLabel>Tên chủ TK</FieldLabel><div>{selectedForm.bankAccountName}</div></Col>
                        <Col md={4}><FieldLabel>Số tài khoản</FieldLabel><div>{selectedForm.bankAccountNo}</div></Col>
                        <Col md={4}><FieldLabel>Ngân hàng</FieldLabel><div>{selectedForm.bankName}</div></Col>
                    </Row>

                    <hr />

                    {/* Ghi chú */}
                    <SectionLabel title="Ghi chú xét duyệt" />
                    <Form.Control
                        as="textarea" rows={3}
                        placeholder={isPending ? "Nhập ghi chú cho owner (bắt buộc khi từ chối)..." : "Không có ghi chú"}
                        value={reviewerNote}
                        onChange={e => setReviewerNote(e.target.value)}
                        disabled={!isPending}
                    />
                    {selectedForm.reviewedAt && (
                        <div style={{ fontSize: 12, color: "#6c757d", marginTop: 6 }}>
                            Xét duyệt lúc: {new Date(selectedForm.reviewedAt).toLocaleString("vi-VN")}
                        </div>
                    )}
                </Modal.Body>

                {isPending ? (
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={onClose}>Đóng</Button>
                        <Button variant="danger" onClick={() => onDecision("rejected")} disabled={!reviewerNote.trim()}>
                            Từ chối
                        </Button>
                        <Button variant="success" onClick={() => onDecision("approved")}>
                            Phê duyệt
                        </Button>
                    </Modal.Footer>
                ) : (
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onClose}>Đóng</Button>
                    </Modal.Footer>
                )}
            </Modal>

            {/* Lightbox */}
            {lightboxImg && (
                <Modal show onHide={() => setLightboxImg(null)} centered size="lg" style={{ zIndex: 1060 }}>
                    <Modal.Body className="p-1 text-center" style={{ background: "#000", borderRadius: 8 }}
                        onClick={() => setLightboxImg(null)}>
                        <img src={lightboxImg} alt="Phóng to"
                            style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }} />
                        <div style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>Bấm vào ảnh để đóng</div>
                    </Modal.Body>
                </Modal>
            )}
        </>
    );
}

// ── FormCard ──────────────────────────────────────────────────────────────────
function FormCard({ form, getOwner, getComplex, onOpen }) {
    const owner = getOwner(form.ownerId);
    const complex = getComplex(form.complexId);
    const badge = STATUS_MAP[form.status] || STATUS_MAP.draft;

    return (
        <Card className="mb-3" style={{ border: "1px solid #dee2e6" }}>
            <Card.Body>
                <Row className="align-items-center">
                    <Col md={4}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{complex?.name || "—"}</div>
                        <div style={{ color: "#6c757d", fontSize: 13 }}>{complex?.address || "—"}</div>
                    </Col>
                    <Col md={3}>
                        <div style={{ fontSize: 13, color: "#6c757d" }}>Chủ sân</div>
                        <div style={{ fontSize: 14 }}>{owner?.fullName || "—"}</div>
                        <div style={{ fontSize: 13, color: "#6c757d" }}>{owner?.email}</div>
                    </Col>
                    <Col md={2}>
                        <div style={{ fontSize: 13, color: "#6c757d" }}>Slot</div>
                        <div style={{ fontSize: 14 }}>{SLOT_LABEL[form.slotType] || form.slotType}</div>
                    </Col>
                    <Col md={2}>
                        <div style={{ fontSize: 13, color: "#6c757d" }}>Ngày nộp</div>
                        <div style={{ fontSize: 13 }}>
                            {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString("vi-VN") : "—"}
                        </div>
                    </Col>
                    <Col md={1} className="text-end">
                        <Badge bg={badge.bg} text={badge.text} className="mb-2 d-block">{badge.label}</Badge>
                        <Button size="sm" variant="outline-primary" onClick={() => onOpen(form)}>Xem</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminRegistration() {
    const {
        registrationForms, setRegistrationForms,
        complexes, setComplexes,
        courts, setCourts,
        users,
    } = useContext(globalContext);

    const [selectedForm, setSelectedForm] = useState(null);
    const [reviewerNote, setReviewerNote] = useState("");
    const [activeTab, setActiveTab] = useState("submitted");
    const [lightboxImg, setLightboxImg] = useState(null);

    const getOwner = id => users.find(u => u.id === id);
    const getComplex = id => complexes.find(c => c.id === id);

    const countByStatus = status => registrationForms.filter(f => f.status === status).length;
    const formsByStatus = status => registrationForms.filter(f => f.status === status);

    const openModal = form => { setSelectedForm(form); setReviewerNote(form.reviewerNote || ""); };
    const closeModal = () => { setSelectedForm(null); setReviewerNote(""); };

    const handleDecision = async (decision) => {
        try {
            // 1. Cập nhật registrationForm
            const updatedForm = {
                ...selectedForm,
                status: decision,
                reviewerNote: reviewerNote.trim() || null,
                reviewedAt: new Date().toISOString(),
            };
            await axios.put(`${BASE}/registrationForms/${selectedForm.id}`, updatedForm);
            setRegistrationForms(prev => prev.map(f => f.id === selectedForm.id ? updatedForm : f));

            // 2. Cập nhật complex
            const complex = getComplex(selectedForm.complexId);
            if (complex) {
                const updatedComplex = {
                    ...complex,
                    status: decision === "approved" ? "active" : "rejected",
                    approvedAt: decision === "approved" ? new Date().toISOString() : null,
                };
                await axios.put(`${BASE}/complexes/${complex.id}`, updatedComplex);
                setComplexes(prev => prev.map(c => c.id === complex.id ? updatedComplex : c));
            }

            // 3. Nếu approved → tạo bản ghi court cho từng sân trong đơn
            if (decision === "approved") {
                const draftCourts = selectedForm.courts || [];
                if (draftCourts.length > 0) {
                    // Dùng Promise.all vì mỗi court có UUID riêng, không lo trùng id
                    const createdCourts = await Promise.all(
                        draftCourts.map(draft =>
                            axios.post(`${BASE}/courts`, {
                                id: crypto.randomUUID(),
                                complexId: selectedForm.complexId,
                                name: draft.name,
                                courtType: draft.courtType,
                                surfaceType: "",
                                status: "active",
                                description: draft.description || "",
                                createdAt: new Date().toISOString(),
                            }).then(r => r.data)
                        )
                    );
                    setCourts(prev => [...prev, ...createdCourts]);
                }
            }

            closeModal();
        } catch (e) {
            console.error(e);
            alert("Cập nhật thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <Container className="py-4">
            {/* Tổng quan */}
            <Row className="g-3 mb-4">
                {[
                    { label: "Chờ duyệt", status: "submitted", color: "#ffc107", text: "#000" },
                    { label: "Đã duyệt", status: "approved", color: "#198754", text: "#fff" },
                    { label: "Từ chối", status: "rejected", color: "#dc3545", text: "#fff" },
                ].map(({ label, status, color, text }) => (
                    <Col md={3} key={status}>
                        <Card style={{ background: color, color: text, cursor: "pointer", border: "none" }}
                            onClick={() => setActiveTab(status)}>
                            <Card.Body className="text-center py-3">
                                <div style={{ fontSize: 28, fontWeight: 700 }}>{countByStatus(status)}</div>
                                <div style={{ fontSize: 14 }}>{label}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                <Col md={3}>
                    <Card style={{ background: "#0d6efd", color: "#fff", border: "none" }}>
                        <Card.Body className="text-center py-3">
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{registrationForms.length}</div>
                            <div style={{ fontSize: 14 }}>Tổng đơn</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Danh sách */}
            <Card>
                <Card.Header><strong>Danh sách đơn đăng ký</strong></Card.Header>
                <Card.Body>
                    <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-3">
                        <Tab eventKey="submitted" title={`Chờ duyệt (${countByStatus("submitted")})`}>
                            {formsByStatus("submitted").length === 0
                                ? <EmptyMessage text="Không có đơn nào đang chờ duyệt" />
                                : formsByStatus("submitted").map(f =>
                                    <FormCard key={f.id} form={f} getOwner={getOwner} getComplex={getComplex} onOpen={openModal} />
                                )}
                        </Tab>
                        <Tab eventKey="approved" title={`Đã duyệt (${countByStatus("approved")})`}>
                            {formsByStatus("approved").length === 0
                                ? <EmptyMessage text="Chưa có đơn nào được duyệt" />
                                : formsByStatus("approved").map(f =>
                                    <FormCard key={f.id} form={f} getOwner={getOwner} getComplex={getComplex} onOpen={openModal} />
                                )}
                        </Tab>
                        <Tab eventKey="rejected" title={`Từ chối (${countByStatus("rejected")})`}>
                            {formsByStatus("rejected").length === 0
                                ? <EmptyMessage text="Chưa có đơn nào bị từ chối" />
                                : formsByStatus("rejected").map(f =>
                                    <FormCard key={f.id} form={f} getOwner={getOwner} getComplex={getComplex} onOpen={openModal} />
                                )}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>

            <DetailModal
                selectedForm={selectedForm}
                reviewerNote={reviewerNote}
                setReviewerNote={setReviewerNote}
                lightboxImg={lightboxImg}
                setLightboxImg={setLightboxImg}
                onClose={closeModal}
                onDecision={handleDecision}
                getOwner={getOwner}
                getComplex={getComplex}
            />
        </Container>
    );
}