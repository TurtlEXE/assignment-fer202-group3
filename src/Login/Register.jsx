import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const steps = ["Thông tin cơ bản", "Bảo mật", "Xác nhận"];
const BASE = "http://localhost:9999";
const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    passwordHash: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    agree: false,
    role: "customer",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
      if (!form.email.trim()) e.email = "Vui lòng nhập email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Email không hợp lệ";
      if (!form.phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
      else if (!/^0\d{9}$/.test(form.phone))
        e.phone = "Số điện thoại không hợp lệ (vd: 0901234567)";
    }
    if (step === 1) {
      if (!form.passwordHash) e.passwordHash = "Vui lòng nhập mật khẩu";
      else if (form.passwordHash.length < 6)
        e.passwordHash = "Mật khẩu tối thiểu 6 ký tự";
      if (!form.confirmPassword)
        e.confirmPassword = "Vui lòng xác nhận mật khẩu";
      else if (form.passwordHash !== form.confirmPassword)
        e.confirmPassword = "Mật khẩu không khớp";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!form.agree) {
      setErrors({ agree: "Vui lòng đồng ý với điều khoản" });
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      try {
        const result = await axios.post(`${BASE}/users`, form);
        console.log("🚀 ========= form:", form);
        console.log("🚀 ========= result:", result);
      } catch (error) {
        console.log("🚀 ========= error:", error);
      }
      navigate("/login");
    }, 1500);
  };

  const pwStr = () => {
    const p = form.passwordHash;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strL = ["", "Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
  const strC = ["", "#ff4444", "#ff8800", "#ffcc00", "#00c864", "#00c864"];
  const str = pwStr();

  // ── helper để tính style cho step circle ──
  const getStepCircleStyle = (i) => {
    if (i < step) return { ...S.sc, ...S.sDone };
    if (i === step) return { ...S.sc, ...S.sActive };
    return S.sc;
  };

  return (
    <div style={S.page}>
      <div style={S.b1} />
      <div style={S.b2} />
      <div style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <Link to="/login" style={S.backBtn}>
            ← Quay lại đăng nhập
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🏓</span>
            <span style={S.logoTxt}>PickleZone</span>
          </div>
        </div>

        <div style={S.card}>
          {/* ─── LEFT ─── */}
          <div style={S.cardLeft}>
            <h2 style={S.cardH}>Tạo tài khoản mới</h2>
            <p style={S.cardSub}>Tham gia cộng đồng pickleball ngay hôm nay</p>

            {/* Stepper — ĐÃ SỬA */}
            <div style={S.stepper}>
              {steps.map((s, i) => (
                <React.Fragment key={i}>
                  <div style={S.stepItem}>
                    <div style={getStepCircleStyle(i)}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span
                      style={{
                        ...S.sl,
                        color:
                          i === step
                            ? "#00c864"
                            : i < step
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {s}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        ...S.sLine,
                        background:
                          i < step ? "#00c864" : "rgba(255,255,255,0.1)",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── STEP 0 ── */}
            {step === 0 && (
              <div style={S.sc0}>
                <FF label="Họ và tên *" icon="👤" err={errors.fullName}>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    style={{ ...S.inp, ...(errors.fullName ? S.inpE : {}) }}
                  />
                </FF>
                <FF label="Email *" icon="✉️" err={errors.email}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    style={{ ...S.inp, ...(errors.email ? S.inpE : {}) }}
                  />
                </FF>
                <FF label="Số điện thoại *" icon="📱" err={errors.phone}>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    style={{ ...S.inp, ...(errors.phone ? S.inpE : {}) }}
                  />
                </FF>
                <div style={S.twoCol}>
                  <FF label="Ngày sinh" icon="🎂">
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      style={S.inp}
                    />
                  </FF>
                  <FF label="Giới tính" icon="⚥">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      style={S.inp}
                    >
                      <option value="">Chọn...</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </FF>
                </div>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div style={S.sc0}>
                <FF label="Mật khẩu *" icon="🔒" err={errors.passwordHash}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      name="passwordHash"
                      value={form.passwordHash}
                      onChange={handleChange}
                      placeholder="Tối thiểu 6 ký tự"
                      style={{
                        ...S.inp,
                        paddingLeft: 42,
                        paddingRight: 44,
                        ...(errors.passwordHash ? S.inpE : {}),
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 15,
                      }}
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {form.passwordHash && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      <div style={{ display: "flex", gap: 3, flex: 1 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              background:
                                i <= str ? strC[str] : "rgba(255,255,255,0.1)",
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: strC[str] }}>
                        {strL[str]}
                      </span>
                    </div>
                  )}
                </FF>
                <FF
                  label="Xác nhận mật khẩu *"
                  icon="🔑"
                  err={errors.confirmPassword}
                >
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    style={{
                      ...S.inp,
                      ...(errors.confirmPassword ? S.inpE : {}),
                    }}
                  />
                  {form.confirmPassword &&
                    form.passwordHash === form.confirmPassword && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#00c864",
                          marginTop: 4,
                          display: "block",
                        }}
                      >
                        ✓ Mật khẩu khớp
                      </span>
                    )}
                </FF>
                <div style={S.tips}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      margin: "0 0 8px",
                    }}
                  >
                    💡 Gợi ý mật khẩu mạnh:
                  </p>
                  {[
                    "Ít nhất 8 ký tự",
                    "Kết hợp chữ hoa & thường",
                    "Bao gồm số và ký tự đặc biệt",
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: 4,
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <span style={{ color: "#00c864" }}>•</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div style={S.sc0}>
                <div style={S.confirmCard}>
                  <div style={S.confirmAvatar}>
                    {form.fullName ? form.fullName[0].toUpperCase() : "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    {[
                      ["Họ tên", form.fullName],
                      ["Email", form.email],
                      ["Điện thoại", form.phone],
                      ...(form.dob ? [["Ngày sinh", form.dob]] : []),
                      ...(form.gender
                        ? [
                            [
                              "Giới tính",
                              { male: "Nam", female: "Nữ", other: "Khác" }[
                                form.gender
                              ],
                            ],
                          ]
                        : []),
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{ display: "flex", gap: 10, marginBottom: 7 }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            width: 80,
                            flexShrink: 0,
                          }}
                        >
                          {k}
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            color: "#fff",
                            fontWeight: 500,
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      style={{
                        marginRight: 10,
                        marginTop: 2,
                        accentColor: "#00c864",
                      }}
                    />
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      Tôi đồng ý với{" "}
                      <a
                        href="#"
                        style={{ color: "#00c864", textDecoration: "none" }}
                      >
                        Điều khoản dịch vụ
                      </a>{" "}
                      và{" "}
                      <a
                        href="#"
                        style={{ color: "#00c864", textDecoration: "none" }}
                      >
                        Chính sách bảo mật
                      </a>
                    </span>
                  </label>
                  {errors.agree && (
                    <p style={{ fontSize: 12, color: "#ff6b6b", marginTop: 4 }}>
                      {errors.agree}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Nav Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={S.backStepBtn}
                >
                  ← Quay lại
                </button>
              )}
              {step < 2 ? (
                <button type="button" onClick={handleNext} style={S.nextBtn}>
                  Tiếp theo →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={S.nextBtn}
                  disabled={loading}
                >
                  {loading ? "⟳ Đang tạo tài khoản..." : "🎉 Hoàn tất đăng ký"}
                </button>
              )}
            </div>
          </div>

          {/* ─── RIGHT ─── ĐÃ SỬA closing tags */}
          <div style={S.cardRight}>
            <div style={S.promoCard}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🏆</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 12px",
                }}
              >
                Ưu đãi thành viên mới
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {[
                  "Miễn phí 1 buổi đặt sân đầu tiên",
                  "Giảm 15% cho 5 lần đặt tiếp theo",
                  "Ưu tiên đặt sân giờ cao điểm",
                  "Tích điểm đổi quà hấp dẫn",
                  "Thông báo khuyến mãi độc quyền",
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.75)",
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#00c864",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial — ĐÃ SỬA */}
            <div style={S.testCard}>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  margin: "0 0 14px",
                }}
              >
                "PickleZone giúp tôi đặt sân nhanh chóng và tiện lợi. Không còn
                phải gọi điện nhiều lần nữa!"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#00c864,#00a0e9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  M
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    Nguyễn Minh Tuấn
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    Thành viên từ 2023
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Field component helper
const FF = ({ label, icon, err, children }) => {
  const child = React.Children.toArray(children)[0];

  // Nếu children là input/select thì auto thêm paddingLeft
  const clonedChild =
    React.isValidElement(child) &&
    ["input", "select", "textarea"].includes(child.type)
      ? React.cloneElement(child, {
          style: {
            ...child.props.style,
            paddingLeft: 42,
          },
        })
      : child;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        {/* icon */}
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 15,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {icon}
        </span>

        {clonedChild}
      </div>

      {err && <span style={{ fontSize: 12, color: "#ff6b6b" }}>{err}</span>}
    </div>
  );
};

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0a0e1a 0%,#0d1b2a 50%,#091520 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  b1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(0,200,100,0.07) 0%,transparent 70%)",
    top: -150,
    right: 100,
    pointerEvents: "none",
  },
  b2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(0,120,255,0.08) 0%,transparent 70%)",
    bottom: -100,
    left: -50,
    pointerEvents: "none",
  },
  container: {
    maxWidth: 1000,
    width: "100%",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "4px 0",
  },
  backBtn: {
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
  },
  logoTxt: {
    fontSize: 20,
    fontWeight: 800,
    background: "linear-gradient(90deg,#00c864,#00a0e9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  card: {
    display: "flex",
    gap: 32,
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: "34px 30px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  cardLeft: { flex: 1 },
  cardRight: {
    width: 270,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  cardH: { fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px" },
  cardSub: { fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 22px" },
  stepper: {
    display: "flex",
    alignItems: "center",
    marginBottom: 26,
    flexWrap: "nowrap",
  },
  stepItem: { display: "flex", alignItems: "center", gap: 8 },
  // base circle — sDone và sActive sẽ override qua getStepCircleStyle()
  sc: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.3)",
    border: "2px solid rgba(255,255,255,0.1)",
    flexShrink: 0,
  },
  sDone: {
    background: "rgba(0,200,100,0.2)",
    color: "#00c864",
    border: "2px solid #00c864",
  },
  sActive: {
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    color: "#fff",
    border: "none",
    boxShadow: "0 0 16px rgba(0,200,100,0.4)",
  },
  sl: { fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  sLine: {
    width: 30,
    height: 2,
    margin: "0 6px",
    borderRadius: 1,
    flexShrink: 0,
  },
  sc0: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 },
  inp: {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  inpE: { borderColor: "rgba(255,80,80,0.5)" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  tips: {
    background: "rgba(0,200,100,0.06)",
    border: "1px solid rgba(0,200,100,0.15)",
    borderRadius: 12,
    padding: "14px 16px",
  },
  confirmCard: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  confirmAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  backStepBtn: {
    padding: "12px 18px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  nextBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    border: "none",
    borderRadius: 14,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0,200,100,0.3)",
  },
  promoCard: {
    background: "rgba(0,200,100,0.08)",
    border: "1px solid rgba(0,200,100,0.2)",
    borderRadius: 16,
    padding: 18,
  },
  testCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
  },
};

export default Register;
