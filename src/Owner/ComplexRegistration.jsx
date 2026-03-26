import axios from "axios";
import { useContext, useRef, useState } from "react";
import {
    Alert, Badge, Button, Card, Col, Container,
    Form, Modal, Row, Spinner
} from "react-bootstrap";
import { globalContext } from "../GlobalContextProvider";

const BASE = "http://localhost:9999";

const STATUS_MAP = {
    pending: { bg: "warning", text: "dark", label: "Chờ duyệt" },
    active: { bg: "success", text: "white", label: "Đang hoạt động" },
    locked: { bg: "secondary", text: "white", label: "Đã khóa" },
    rejected: { bg: "danger", text: "white", label: "Bị từ chối" },
};

const SLOT_LABEL = {
    "30min": "30 phút/slot",
    "60min": "1 tiếng/slot",
    "120min": "2 tiếng/slot",
};

const COURT_TYPE_LABEL = {
    indoor: "Trong nhà",
    outdoor: "Ngoài trời",
};

const initForm = {
    complexName: "", address: "", phone: "",
    openTime: "06:00", closeTime: "22:00", description: "",
    businessLicenseUrl: "", idCardFrontUrl: "", idCardBackUrl: "",
    bankAccountName: "", bankAccountNo: "", bankName: "", slotType: "",
};

const initCourtForm = { name: "", courtType: "", description: "", imgBase64: "" };

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export default function ComplexRegistration() {
    const {
        currentUser,
        complexes, setComplexes,
        registrationForms, setRegistrationForms,
        courts, courtDraft, setCourtDraft,
    } = useContext(globalContext);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(initForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [showPending, setShowPending] = useState(false);

    const [showCourtForm, setShowCourtForm] = useState(false);
    const [courtForm, setCourtForm] = useState(initCourtForm);
    const [editCourtId, setEditCourtId] = useState(null);
    const [courtErrors, setCourtErrors] = useState({});
    const [courtImgPreview, setCourtImgPreview] = useState("");

    const licenseRef = useRef();
    const idFrontRef = useRef();
    const idBackRef = useRef();
    const courtImgRef = useRef();

    const ownerComplexes = complexes.filter(c => c.ownerId === currentUser?.id);
    const activeComplexes = ownerComplexes.filter(c => c.status === "active");
    const pendingComplexes = ownerComplexes.filter(c => c.status !== "active");

    const getRegForm = (cid) => registrationForms
        .filter(f => f.complexId === cid)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

    const getCourtCount = (cid) => {
        const fromCourts = courts.filter(c => c.complexId === cid).length;
        if (fromCourts > 0) return fromCourts;
        const regForm = registrationForms.find(f => f.complexId === cid);
        return regForm?.courts?.length ?? 0;
    };

    const setField = (key) => (e) => {
        setForm(p => ({ ...p, [key]: e.target.value }));
        setFieldErrors(p => ({ ...p, [key]: "" }));
    };
    const setCourtField = (key) => (e) => {
        setCourtForm(p => ({ ...p, [key]: e.target.value }));
        setCourtErrors(p => ({ ...p, [key]: "" }));
    };

    const validate = () => {
        const f = form;
        const errs = {};
        if (!f.complexName.trim()) errs.complexName = "Vui lòng nhập tên khu.";
        if (!f.address.trim()) errs.address = "Vui lòng nhập địa chỉ.";
        if (!f.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại.";
        else if (!/^\d{10}$/.test(f.phone.trim())) errs.phone = "Số điện thoại phải gồm đúng 10 chữ số.";
        if (!f.slotType) errs.slotType = "Vui lòng chọn loại slot.";
        if (!f.businessLicenseUrl) errs.businessLicenseUrl = "Vui lòng tải lên giấy phép kinh doanh.";
        if (!f.idCardFrontUrl) errs.idCardFrontUrl = "Vui lòng tải lên CCCD mặt trước.";
        if (!f.idCardBackUrl) errs.idCardBackUrl = "Vui lòng tải lên CCCD mặt sau.";
        if (!f.bankAccountName.trim()) errs.bankAccountName = "Vui lòng nhập tên chủ tài khoản.";
        if (!f.bankAccountNo.trim()) errs.bankAccountNo = "Vui lòng nhập số tài khoản.";
        if (!f.bankName.trim()) errs.bankName = "Vui lòng nhập tên ngân hàng.";
        if ((courtDraft || []).length === 0) errs.courts = "Vui lòng thêm ít nhất một sân.";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateCourt = () => {
        const errs = {};
        if (!courtForm.name.trim()) errs.name = "Vui lòng nhập tên sân.";
        if (!courtForm.courtType) errs.courtType = "Vui lòng chọn loại sân.";
        if (!courtForm.imgBase64) errs.imgBase64 = "Vui lòng tải lên hình ảnh sân.";
        setCourtErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleFileChange = (key) => async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const b64 = await fileToBase64(file);
        setForm(p => ({ ...p, [key]: b64 }));
        setFieldErrors(p => ({ ...p, [key]: "" }));
    };

    const handleCourtImgChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const b64 = await fileToBase64(file);
        setCourtForm(p => ({ ...p, imgBase64: b64 }));
        setCourtImgPreview(b64);
        setCourtErrors(p => ({ ...p, imgBase64: "" }));
    };

    const handleAddCourt = () => {
        setEditCourtId(null); setCourtForm(initCourtForm);
        setCourtImgPreview(""); setCourtErrors({}); setShowCourtForm(true);
        if (courtImgRef.current) courtImgRef.current.value = "";
    };

    const handleEditCourt = (court) => {
        setEditCourtId(court.id);
        setCourtForm({ name: court.name, courtType: court.courtType, description: court.description, imgBase64: court.imgBase64 });
        setCourtImgPreview(court.imgBase64); setCourtErrors({}); setShowCourtForm(true);
    };

    const handleSaveCourt = () => {
        if (!validateCourt()) return;
        if (editCourtId) {
            setCourtDraft(p => p.map(c => c.id === editCourtId ? { ...c, ...courtForm } : c));
        } else {
            setCourtDraft(p => [...(p || []), { id: crypto.randomUUID(), ...courtForm }]);
        }
        setFieldErrors(p => ({ ...p, courts: "" }));
        setShowCourtForm(false); setCourtForm(initCourtForm);
        setCourtImgPreview(""); setEditCourtId(null);
        if (courtImgRef.current) courtImgRef.current.value = "";
    };

    const handleCancelCourt = () => {
        setShowCourtForm(false); setCourtForm(initCourtForm);
        setCourtImgPreview(""); setEditCourtId(null); setCourtErrors({});
        if (courtImgRef.current) courtImgRef.current.value = "";
    };

    const handleDeleteCourt = (id) => {
        setCourtDraft(p => p.filter(c => c.id !== id));
        if (editCourtId === id) handleCancelCourt();
    };

    const handleOpenModal = () => {
        setForm(initForm); setFieldErrors({}); setSubmitError("");
        setSuccess(false); setShowCourtForm(false);
        setCourtForm(initCourtForm); setCourtDraft([]);
        [licenseRef, idFrontRef, idBackRef, courtImgRef].forEach(r => { if (r.current) r.current.value = ""; });
        setShowModal(true);
    };
    const handleCloseModal = () => { if (!loading) setShowModal(false); };

    const handleSubmit = async () => {
        setSubmitError("");
        if (!validate()) return;
        setLoading(true);
        try {
            const newComplex = {
                id: crypto.randomUUID(),
                ownerId: currentUser.id,
                name: form.complexName.trim(),
                slug: form.complexName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                description: form.description.trim(),
                address: form.address.trim(),
                provinceCode: "", districtCode: "", lat: null, lng: null,
                phone: form.phone.trim(),
                openTime: form.openTime + ":00",
                closeTime: form.closeTime + ":00",
                status: "pending",
                discountRate: 10,
                slotType: form.slotType,
                approvedBy: null,
                approvedAt: null,
                createdAt: new Date().toISOString(),
            };
            const resComplex = await axios.post(`${BASE}/complexes`, newComplex);
            setComplexes(p => [...p, resComplex.data]);

            const newRegForm = {
                id: crypto.randomUUID(),
                ownerId: currentUser.id,
                complexId: resComplex.data.id,
                businessLicenseUrl: form.businessLicenseUrl,
                idCardFrontUrl: form.idCardFrontUrl,
                idCardBackUrl: form.idCardBackUrl,
                bankAccountName: form.bankAccountName.trim(),
                bankAccountNo: form.bankAccountNo.trim(),
                bankName: form.bankName.trim(),
                status: "submitted",
                reviewerNote: null,
                submittedAt: new Date().toISOString(),
                reviewedAt: null,
                slotType: form.slotType,
                courts: (courtDraft || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    courtType: c.courtType,
                    description: c.description,
                    imgBase64: c.imgBase64,
                })),
            };
            const resForm = await axios.post(`${BASE}/registrationForms`, newRegForm);
            setRegistrationForms(p => [...p, resForm.data]);
            setCourtDraft([]);
            setSuccess(true);
        } catch {
            setSubmitError("Gửi đơn thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const SectionLabel = ({ number, title }) => (
        <div style={{ fontWeight: 600, color: "#0d6efd", borderBottom: "1px solid #dee2e6", paddingBottom: 6, marginBottom: 12 }}>
            {number}. {title}
        </div>
    );

    const ComplexCard = ({ complex }) => {
        const badge = STATUS_MAP[complex.status] || { bg: "secondary", text: "white", label: complex.status };
        const regForm = getRegForm(complex.id);
        const count = getCourtCount(complex.id);
        return (
            <Col md={6} lg={4}>
                <Card className="h-100" style={{ border: "1px solid #dee2e6" }}>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div style={{ fontWeight: 700, fontSize: 15, flex: 1, marginRight: 8 }}>{complex.name}</div>
                            <Badge bg={badge.bg} text={badge.text} style={{ whiteSpace: "nowrap" }}>{badge.label}</Badge>
                        </div>
                        <div style={{ color: "#6c757d", fontSize: 13, marginBottom: 12 }}>📍 {complex.address || "—"}</div>
                        <Row className="g-1" style={{ fontSize: 13 }}>
                            <Col xs={6}><span style={{ color: "#6c757d" }}>Giờ: </span>{complex.openTime?.slice(0, 5)} – {complex.closeTime?.slice(0, 5)}</Col>
                            <Col xs={6}><span style={{ color: "#6c757d" }}>Số sân: </span><strong>{count}</strong></Col>
                            <Col xs={6}><span style={{ color: "#6c757d" }}>Slot: </span>{SLOT_LABEL[complex.slotType] || "—"}</Col>
                            <Col xs={6}><span style={{ color: "#6c757d" }}>Chiết khấu: </span>{complex.discountRate ?? 0}%</Col>
                        </Row>
                        {complex.status === "rejected" && (
                            <div style={{ marginTop: 10, background: "#fff3cd", borderRadius: 6, padding: "6px 10px", fontSize: 12 }}>
                                <strong>Lý do từ chối:</strong>{" "}
                                {regForm?.reviewerNote || "Không có ghi chú từ Admin."}
                            </div>
                        )}
                    </Card.Body>
                    <Card.Footer style={{ background: "transparent", fontSize: 12, color: "#adb5bd" }}>
                        Ngày đăng ký: {regForm?.submittedAt ? new Date(regForm.submittedAt).toLocaleDateString("vi-VN") : "—"}
                    </Card.Footer>
                </Card>
            </Col>
        );
    };

    return (
        <Container className="py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 style={{ margin: 0, fontWeight: 700 }}>Khu pickleball của tôi</h5>
                    <div style={{ color: "#6c757d", fontSize: 13, marginTop: 2 }}>
                        {activeComplexes.length > 0
                            ? `${activeComplexes.length} khu đang hoạt động`
                            : "Chưa có khu nào được duyệt"}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    {pendingComplexes.length > 0 && (
                        <Button
                            variant={showPending ? "secondary" : "outline-secondary"}
                            onClick={() => setShowPending(p => !p)}
                        >
                            {showPending ? "Ẩn" : "Xem"} khu chờ duyệt/từ chối
                            <Badge bg="warning" text="dark" className="ms-2">{pendingComplexes.length}</Badge>
                        </Button>
                    )}
                    <Button variant="primary" onClick={handleOpenModal}>+ Đăng ký khu mới</Button>
                </div>
            </div>

            {activeComplexes.length === 0 ? (
                <Card body style={{ textAlign: "center", color: "#6c757d", padding: "48px 20px" }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>🏓</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Chưa có khu nào đang hoạt động</div>
                    <div style={{ fontSize: 13, marginBottom: 16 }}>Đăng ký khu pickleball để bắt đầu nhận đặt sân</div>
                    <Button variant="primary" onClick={handleOpenModal}>+ Đăng ký khu đầu tiên</Button>
                </Card>
            ) : (
                <Row className="g-3">{activeComplexes.map(c => <ComplexCard key={c.id} complex={c} />)}</Row>
            )}

            {showPending && pendingComplexes.length > 0 && (
                <div className="mt-4">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#6c757d", whiteSpace: "nowrap" }}>
                            Khu đang chờ duyệt / bị từ chối
                        </span>
                        <div style={{ flex: 1, height: 1, background: "#dee2e6" }} />
                    </div>
                    <Row className="g-3">{pendingComplexes.map(c => <ComplexCard key={c.id} complex={c} />)}</Row>
                </div>
            )}

            <Modal show={showModal} onHide={handleCloseModal} size="lg" scrollable>
                <Modal.Header closeButton style={{ background: "#0d6efd", color: "white" }}>
                    <Modal.Title style={{ fontSize: 17 }}>Đăng ký khu Pickleball mới</Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-4">
                    {success ? (
                        <Alert variant="success" className="mb-0">
                            ✅ Gửi đơn thành công! Admin sẽ xem xét và phản hồi sớm nhất.
                            <div className="mt-2">
                                <Button size="sm" variant="outline-success" onClick={handleCloseModal}>Đóng</Button>
                            </div>
                        </Alert>
                    ) : (
                        <>
                            {submitError && <Alert variant="danger">{submitError}</Alert>}

                            <SectionLabel number={1} title="Thông tin khu pickleball" />
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <Form.Label>Tên khu <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="text" placeholder="VD: Khu Pickleball Lan Anh"
                                        value={form.complexName} onChange={setField("complexName")}
                                        isInvalid={!!fieldErrors.complexName} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.complexName}</Form.Control.Feedback>
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Số điện thoại <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="text" placeholder="VD: 0901234567" maxLength={10}
                                        value={form.phone} onChange={setField("phone")}
                                        isInvalid={!!fieldErrors.phone} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.phone}</Form.Control.Feedback>
                                </Col>
                                <Col md={12}>
                                    <Form.Label>Địa chỉ <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="text" placeholder="VD: 10 Đ. Trần Phú, P. Mộ Lao, Hà Đông, Hà Nội"
                                        value={form.address} onChange={setField("address")}
                                        isInvalid={!!fieldErrors.address} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.address}</Form.Control.Feedback>
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Giờ mở cửa</Form.Label>
                                    <Form.Control type="time" value={form.openTime} onChange={setField("openTime")} />
                                    <Form.Text className="text-muted">Chỉ hỗ trợ quản lý trong khung giờ này</Form.Text>
                                </Col>


                                <Col md={3}>
                                    <Form.Label>Giờ đóng cửa</Form.Label>
                                    <Form.Control type="time" value={form.closeTime} onChange={setField("closeTime")} />
                                </Col>

                                <Col md={6}>
                                    <Form.Label>Loại slot <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Select value={form.slotType} onChange={setField("slotType")}
                                        isInvalid={!!fieldErrors.slotType}>
                                        <option value="">-- Chọn loại slot --</option>
                                        <option value="30min">30 phút / slot</option>
                                        <option value="60min">1 tiếng / slot</option>
                                        <option value="120min">2 tiếng / slot</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{fieldErrors.slotType}</Form.Control.Feedback>
                                    <Form.Text className="text-muted">Áp dụng thống nhất cho tất cả sân trong khu</Form.Text>
                                </Col>
                                <Col md={12}>
                                    <Form.Label>Mô tả khu</Form.Label>
                                    <Form.Control as="textarea" rows={2} placeholder="Mô tả ngắn về khu pickleball của bạn..."
                                        value={form.description} onChange={setField("description")} />
                                </Col>

                                <Col md={12}>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Form.Label className="mb-0">
                                            Thông tin sân <span style={{ color: "red" }}>*</span>
                                        </Form.Label>
                                        <Button size="sm" variant="outline-primary" onClick={handleAddCourt} disabled={showCourtForm}>
                                            + Thêm sân
                                        </Button>
                                    </div>

                                    {(courtDraft || []).length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                            {courtDraft.map(court => (
                                                <div key={court.id} className="d-flex align-items-center gap-1"
                                                    style={{
                                                        border: editCourtId === court.id ? "2px solid #0d6efd" : "1px solid #dee2e6",
                                                        borderRadius: 6,
                                                        background: editCourtId === court.id ? "#e7f1ff" : "#f8f9fa",
                                                        padding: "4px 10px",
                                                    }}>
                                                    <Button variant="link" size="sm"
                                                        style={{ padding: 0, textDecoration: "none", color: "#212529", fontSize: 13 }}
                                                        onClick={() => handleEditCourt(court)}>
                                                        {court.name}
                                                        
                                                    </Button>
                                                    <Button variant="link" size="sm"
                                                        style={{ padding: "0 0 0 4px", color: "#dc3545", fontSize: 15, lineHeight: 1 }}
                                                        onClick={() => handleDeleteCourt(court.id)}>×</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {fieldErrors.courts && (
                                        <div style={{ color: "#dc3545", fontSize: 13, marginBottom: 6 }}>{fieldErrors.courts}</div>
                                    )}

                                    {showCourtForm && (
                                        <div style={{ border: "1px solid #0d6efd", borderRadius: 8, padding: 16, background: "#f0f6ff", marginTop: 4 }}>
                                            <div style={{ fontWeight: 600, marginBottom: 10, color: "#0d6efd", fontSize: 14 }}>
                                                {editCourtId ? "Chỉnh sửa thông tin sân" : "Thêm sân mới"}
                                            </div>
                                            <Row className="g-2">
                                                <Col md={6}>
                                                    <Form.Label style={{ fontSize: 13 }}>Tên sân <span style={{ color: "red" }}>*</span></Form.Label>
                                                    <Form.Control size="sm" type="text" placeholder="VD: Sân A1"
                                                        value={courtForm.name} onChange={setCourtField("name")}
                                                        isInvalid={!!courtErrors.name} />
                                                    <Form.Control.Feedback type="invalid">{courtErrors.name}</Form.Control.Feedback>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label style={{ fontSize: 13 }}>Loại sân <span style={{ color: "red" }}>*</span></Form.Label>
                                                    <Form.Select size="sm" value={courtForm.courtType} onChange={setCourtField("courtType")}
                                                        isInvalid={!!courtErrors.courtType}>
                                                        <option value="">-- Chọn loại --</option>
                                                        <option value="indoor">Trong nhà</option>
                                                        <option value="outdoor">Ngoài trời</option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">{courtErrors.courtType}</Form.Control.Feedback>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Label style={{ fontSize: 13 }}>Mô tả sân</Form.Label>
                                                    <Form.Control size="sm" as="textarea" rows={2} placeholder="Mô tả thêm về sân..."
                                                        value={courtForm.description} onChange={setCourtField("description")} />
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Label style={{ fontSize: 13 }}>Hình ảnh sân <span style={{ color: "red" }}>*</span></Form.Label>
                                                    <Form.Control size="sm" type="file" accept="image/*"
                                                        ref={courtImgRef} onChange={handleCourtImgChange}
                                                        isInvalid={!!courtErrors.imgBase64} />
                                                    <Form.Control.Feedback type="invalid">{courtErrors.imgBase64}</Form.Control.Feedback>
                                                    {courtImgPreview && (
                                                        <img src={courtImgPreview} alt="preview"
                                                            style={{ marginTop: 8, width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 6, border: "1px solid #dee2e6" }} />
                                                    )}
                                                </Col>
                                            </Row>
                                            <div className="d-flex gap-2 mt-3">
                                                <Button size="sm" variant="primary" onClick={handleSaveCourt}>
                                                    {editCourtId ? "Cập nhật" : "Lưu sân"}
                                                </Button>
                                                <Button size="sm" variant="outline-secondary" onClick={handleCancelCourt}>Hủy</Button>
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            <SectionLabel number={2} title="Giấy tờ pháp lý" />
                            <Row className="g-3 mb-4">
                                <Col md={12}>
                                    <Form.Label>Giấy phép kinh doanh <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="file" accept="image/*" ref={licenseRef}
                                        onChange={handleFileChange("businessLicenseUrl")}
                                        isInvalid={!!fieldErrors.businessLicenseUrl} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.businessLicenseUrl}</Form.Control.Feedback>
                                    {form.businessLicenseUrl && (
                                        <img src={form.businessLicenseUrl} alt="preview"
                                            style={{ marginTop: 6, maxHeight: 120, borderRadius: 6, border: "1px solid #dee2e6" }} />
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>CCCD mặt trước <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="file" accept="image/*" ref={idFrontRef}
                                        onChange={handleFileChange("idCardFrontUrl")}
                                        isInvalid={!!fieldErrors.idCardFrontUrl} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.idCardFrontUrl}</Form.Control.Feedback>
                                    {form.idCardFrontUrl && (
                                        <img src={form.idCardFrontUrl} alt="preview"
                                            style={{ marginTop: 6, maxHeight: 100, borderRadius: 6, border: "1px solid #dee2e6" }} />
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>CCCD mặt sau <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="file" accept="image/*" ref={idBackRef}
                                        onChange={handleFileChange("idCardBackUrl")}
                                        isInvalid={!!fieldErrors.idCardBackUrl} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.idCardBackUrl}</Form.Control.Feedback>
                                    {form.idCardBackUrl && (
                                        <img src={form.idCardBackUrl} alt="preview"
                                            style={{ marginTop: 6, maxHeight: 100, borderRadius: 6, border: "1px solid #dee2e6" }} />
                                    )}
                                </Col>
                            </Row>

                            <SectionLabel number={3} title="Thông tin ngân hàng nhận thanh toán" />
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Label>Tên chủ tài khoản <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="text" placeholder="VD: TRAN THI LAN"
                                        value={form.bankAccountName} onChange={setField("bankAccountName")}
                                        isInvalid={!!fieldErrors.bankAccountName} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.bankAccountName}</Form.Control.Feedback>
                                </Col>
                                <Col md={4}>
                                    <Form.Label>Số tài khoản <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="text" placeholder="VD: 0021000123456"
                                        value={form.bankAccountNo} onChange={setField("bankAccountNo")}
                                        isInvalid={!!fieldErrors.bankAccountNo} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.bankAccountNo}</Form.Control.Feedback>
                                </Col>
                                <Col md={4}>
                                    <Form.Label>Tên ngân hàng <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="text" placeholder="VD: Vietcombank"
                                        value={form.bankName} onChange={setField("bankName")}
                                        isInvalid={!!fieldErrors.bankName} />
                                    <Form.Control.Feedback type="invalid">{fieldErrors.bankName}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>

                {!success && (
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseModal} disabled={loading}>Hủy</Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: 130 }}>
                            {loading ? <Spinner size="sm" /> : "Gửi đơn"}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
}