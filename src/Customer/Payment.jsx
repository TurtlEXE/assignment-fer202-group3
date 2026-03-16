// src/customer/Payment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ── Mock booking data (sẽ nhận qua location.state từ Booking.jsx) ──
const MOCK_BOOKING = {
  bookingId: "BK" + Math.floor(Math.random() * 900000 + 100000),
  courtName: "PicklePark Quận 7",
  courtAddress: "45 Nguyễn Thị Thập, Quận 7, TP.HCM",
  courtImage: "⚡",
  date: "03/01/2025",
  startTime: "18:00",
  hours: 2,
  courtNum: 3,
  players: 4,
  pricePerHour: 150000,
  discount: 22500,
  total: 277500,
  promoCode: "PICKLE10",
};

const BANK_INFO = {
  bankName: "Vietcombank",
  accountNumber: "1234567890",
  accountName: "CONG TY TNHH PICKLEZONE",
  branch: "Chi nhánh TP.HCM",
};

const COUNTDOWN_SECONDS = 15 * 60; // 15 phút

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking || MOCK_BOOKING;

  const [status, setStatus] = useState("pending"); // pending | verifying | success | failed | expired
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [copied, setCopied] = useState("");
  const [activeTab, setActiveTab] = useState("qr"); // qr | manual
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending") return;
    if (countdown <= 0) { setStatus("expired"); return; }
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown, status]);

  // Simulate payment verification after 8s (demo)
  useEffect(() => {
    if (status !== "verifying") return;
    const t = setTimeout(() => setStatus("success"), 3000);
    return () => clearTimeout(t);
  }, [status]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const handleSimulatePayment = () => {
    setStatus("verifying");
  };

  const urgencyColor = countdown < 60 ? "#ff4444" : countdown < 180 ? "#ff8800" : "#00c864";
  const urgencyBg = countdown < 60
    ? "rgba(255,68,68,0.12)"
    : countdown < 180
      ? "rgba(255,136,0,0.12)"
      : "rgba(0,200,100,0.12)";

  // QR code URL (VietQR standard)
  const qrAmount = booking.total;
  const qrContent = encodeURIComponent(`Thanh toan dat san ${booking.bookingId}`);
  const qrUrl = `https://img.vietqr.io/image/VCB-${BANK_INFO.accountNumber}-compact2.png?amount=${qrAmount}&addInfo=${qrContent}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  // ── SUCCESS SCREEN ──
  if (status === "success") {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={S.resultCard}>
          <div style={S.successRing}>
            <div style={S.successIcon}>✓</div>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
            Thanh toán thành công!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "0 0 28px" }}>
            Giao dịch đã được xác nhận. Chúc bạn chơi vui!
          </p>

          <div style={S.successSummary}>
            <div style={S.successRow}>
              <span style={S.sKey}>Mã đặt sân</span>
              <span style={{ ...S.sVal, color: "#00c864", fontFamily: "monospace", fontWeight: 800 }}>
                #{booking.bookingId}
              </span>
            </div>
            <div style={S.successRow}>
              <span style={S.sKey}>Sân</span>
              <span style={S.sVal}>{booking.courtName}</span>
            </div>
            <div style={S.successRow}>
              <span style={S.sKey}>Ngày chơi</span>
              <span style={S.sVal}>{booking.date} lúc {booking.startTime}</span>
            </div>
            <div style={S.successRow}>
              <span style={S.sKey}>Thời gian</span>
              <span style={S.sVal}>{booking.hours} giờ</span>
            </div>
            <div style={{ ...S.successRow, borderBottom: "none", paddingTop: 14 }}>
              <span style={{ ...S.sKey, fontWeight: 700, color: "#fff", fontSize: 15 }}>Đã thanh toán</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#00c864" }}>
                {booking.total.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <div style={{ background: "rgba(0,200,100,0.06)", border: "1px solid rgba(0,200,100,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
            📱 Biên lai thanh toán đã được gửi về email và SMS của bạn.
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/")} style={S.outlineBtn}>
              ← Về trang chủ
            </button>
            <button
              onClick={() => navigate("/")}
              style={S.primaryBtn}
            >
              Xem lịch đặt của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── EXPIRED SCREEN ──
  if (status === "expired") {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={S.resultCard}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏰</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
            Phiên thanh toán hết hạn
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
            Mã QR đã hết hiệu lực sau 15 phút.<br />
            Vui lòng quay lại đặt sân và thực hiện thanh toán mới.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/")} style={S.outlineBtn}>← Về trang chủ</button>
            <button onClick={() => navigate(-1)} style={S.primaryBtn}>🔄 Đặt lại</button>
          </div>
        </div>
      </div>
    );
  }

  // ── FAILED SCREEN ──
  if (status === "failed") {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={S.resultCard}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
            Thanh toán thất bại
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 28px" }}>
            Giao dịch không thành công. Vui lòng thử lại.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/")} style={S.outlineBtn}>← Hủy</button>
            <button onClick={() => setStatus("pending")} style={S.primaryBtn}>🔄 Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN PAYMENT SCREEN ──
  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navWrap}>
          <button
            onClick={() => setShowConfirmCancel(true)}
            style={S.backBtn}
          >
            ← Quay lại
          </button>
          <div style={S.logo}>
            <span style={{ fontSize: 22 }}>🏓</span>
            <span style={S.logoTxt}>PickleZone</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Bước 3/3: Thanh toán
          </div>
        </div>
      </nav>

      {/* COUNTDOWN BANNER */}
      <div style={{ ...S.countdownBanner, background: urgencyBg, borderColor: `${urgencyColor}33` }}>
        <span style={{ fontSize: 16 }}>{countdown < 60 ? "🚨" : countdown < 180 ? "⚠️" : "⏳"}</span>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
          Mã QR có hiệu lực trong
        </span>
        <span style={{
          fontSize: 22, fontWeight: 900, color: urgencyColor,
          fontFamily: "monospace", letterSpacing: 2,
          textShadow: countdown < 60 ? `0 0 12px ${urgencyColor}` : "none",
        }}>
          {formatTime(countdown)}
        </span>
        {countdown < 180 && (
          <span style={{ fontSize: 13, color: urgencyColor, fontWeight: 600 }}>
            {countdown < 60 ? "Sắp hết giờ!" : "Hãy thanh toán sớm"}
          </span>
        )}
      </div>

      <div style={S.mainGrid}>
        {/* ── LEFT: QR & Instructions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Tab switcher */}
          <div style={S.tabWrap}>
            {[{ v: "qr", l: "📱 Quét mã QR" }, { v: "manual", l: "🏦 Chuyển khoản thủ công" }].map(t => (
              <button key={t.v} onClick={() => setActiveTab(t.v)}
                style={{ ...S.tabBtn, ...(activeTab === t.v ? S.tabBtnActive : {}) }}>
                {t.l}
              </button>
            ))}
          </div>

          {/* ── QR TAB ── */}
          {activeTab === "qr" && (
            <div style={S.qrCard}>
              <div style={S.qrHeader}>
                <div style={S.bankLogoWrap}>
                  <span style={{ fontSize: 22 }}>🏦</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                      {BANK_INFO.bankName}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      Thanh toán qua VietQR
                    </div>
                  </div>
                </div>
                <div style={S.vietqrBadge}>VietQR</div>
              </div>

              {/* QR Code */}
              <div style={S.qrWrap}>
                {status === "verifying" ? (
                  <div style={S.verifyingWrap}>
                    <div style={S.spinner} />
                    <p style={{ color: "#00c864", fontWeight: 700, fontSize: 15, margin: "16px 0 4px" }}>
                      Đang xác nhận...
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>
                      Vui lòng chờ trong giây lát
                    </p>
                  </div>
                ) : (
                  <>
                    <img
                      src={qrUrl}
                      alt="QR thanh toán"
                      style={S.qrImg}
                      onError={e => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    {/* Fallback QR placeholder nếu VietQR không load */}
                    <div style={{ ...S.qrFallback, display: "none" }}>
                      <div style={S.qrFallbackInner}>
                        <div style={S.qrGrid}>
                          {Array.from({ length: 81 }).map((_, i) => (
                            <div key={i} style={{
                              width: 8, height: 8, borderRadius: 1,
                              background: Math.random() > 0.5 ? "#00c864" : "transparent",
                            }} />
                          ))}
                        </div>
                        <div style={S.qrLogo}>🏓</div>
                      </div>
                    </div>
                  </>
                )}
                {status !== "verifying" && (
                  <div style={S.qrAmountTag}>
                    {booking.total.toLocaleString("vi-VN")}đ
                  </div>
                )}
              </div>

              {/* Transfer info chips */}
              <div style={S.infoChips}>
                {[
                  { label: "Ngân hàng", value: BANK_INFO.bankName },
                  { label: "Số tài khoản", value: BANK_INFO.accountNumber, copyKey: "account" },
                  { label: "Chủ TK", value: BANK_INFO.accountName },
                  {
                    label: "Nội dung CK", value: `Thanh toan dat san ${booking.bookingId}`,
                    copyKey: "content", highlight: true
                  },
                  { label: "Số tiền", value: `${booking.total.toLocaleString("vi-VN")}đ`, copyKey: "amount", highlight: true },
                ].map(({ label, value, copyKey, highlight }) => (
                  <div key={label} style={{ ...S.infoChip, ...(highlight ? S.infoChipHL : {}) }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{
                        fontSize: 13, fontWeight: highlight ? 700 : 500,
                        color: highlight ? "#00c864" : "#fff",
                        wordBreak: "break-all",
                      }}>
                        {value}
                      </div>
                    </div>
                    {copyKey && (
                      <button
                        onClick={() => handleCopy(value, copyKey)}
                        style={{
                          ...S.copyBtn,
                          background: copied === copyKey ? "rgba(0,200,100,0.2)" : "rgba(255,255,255,0.07)",
                          borderColor: copied === copyKey ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.1)",
                          color: copied === copyKey ? "#00c864" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {copied === copyKey ? "✓ Đã sao chép" : "📋 Sao chép"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div style={S.instructionBox}>
                <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  📖 Hướng dẫn thanh toán:
                </p>
                {[
                  "Mở app ngân hàng hoặc ví điện tử (MoMo, ZaloPay...)",
                  "Chọn chức năng \"Quét mã QR\" hoặc \"Chuyển tiền QR\"",
                  "Quét mã QR bên trên — thông tin sẽ tự điền",
                  "Kiểm tra số tiền và nội dung chuyển khoản",
                  "Xác nhận thanh toán và chờ xác nhận từ hệ thống",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      background: "linear-gradient(135deg,#00c864,#00a0e9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff",
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Supported apps */}
              <div style={S.appRow}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Hỗ trợ:</span>
                {["💳 VCB Digibank", "🟣 MoMo", "🔵 ZaloPay", "🟠 VNPay", "🟢 TPBank"].map(app => (
                  <span key={app} style={S.appChip}>{app}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── MANUAL TAB ── */}
          {activeTab === "manual" && (
            <div style={S.qrCard}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 18px", color: "#fff" }}>
                🏦 Thông tin chuyển khoản thủ công
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Ngân hàng", value: BANK_INFO.bankName, icon: "🏦" },
                  { label: "Số tài khoản", value: BANK_INFO.accountNumber, icon: "💳", copyKey: "acc2" },
                  { label: "Tên chủ tài khoản", value: BANK_INFO.accountName, icon: "👤" },
                  { label: "Chi nhánh", value: BANK_INFO.branch, icon: "📍" },
                  {
                    label: "Số tiền chuyển",
                    value: `${booking.total.toLocaleString("vi-VN")} VNĐ`,
                    icon: "💰", copyKey: "amt2", highlight: true
                  },
                  {
                    label: "Nội dung chuyển khoản",
                    value: `Thanh toan dat san ${booking.bookingId}`,
                    icon: "📝", copyKey: "msg2", highlight: true
                  },
                ].map(({ label, value, icon, copyKey, highlight }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: highlight ? "rgba(0,200,100,0.06)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${highlight ? "rgba(0,200,100,0.2)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 14,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>{label}</div>
                      <div style={{
                        fontSize: 14, fontWeight: highlight ? 700 : 500,
                        color: highlight ? "#00c864" : "#fff",
                        wordBreak: "break-all", lineHeight: 1.4
                      }}>
                        {value}
                      </div>
                    </div>
                    {copyKey && (
                      <button
                        onClick={() => handleCopy(value, copyKey)}
                        style={{
                          ...S.copyBtn, flexShrink: 0,
                          background: copied === copyKey ? "rgba(0,200,100,0.2)" : "rgba(255,255,255,0.07)",
                          borderColor: copied === copyKey ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.1)",
                          color: copied === copyKey ? "#00c864" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {copied === copyKey ? "✓" : "📋"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ ...S.instructionBox, marginTop: 18 }}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  ⚠️ Lưu ý quan trọng:
                </p>
                {[
                  "Nhập CHÍNH XÁC nội dung chuyển khoản để hệ thống tự xác nhận",
                  "Giao dịch được xác nhận trong vòng 1–5 phút",
                  "Không chuyển sai số tiền — hệ thống sẽ không tự khớp",
                  "Liên hệ hotline 1800 0000 nếu có sự cố",
                ].map((note, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                    <span style={{ color: "#ffcc00", flexShrink: 0 }}>•</span>{note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simulate button (demo only) */}
          {status === "pending" && (
            <button onClick={handleSimulatePayment} style={S.simulateBtn}>
              ✅ Tôi đã chuyển khoản — Xác nhận thanh toán
            </button>
          )}
          {status === "verifying" && (
            <div style={S.verifyingBar}>
              <div style={S.verifyingBarFill} />
              <span style={{ fontSize: 13, color: "#00c864", fontWeight: 600, position: "relative" }}>
                Đang xác nhận giao dịch...
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Booking summary */}
          <div style={S.summaryCard}>
            <div style={S.summaryHeader}>
              <span style={{ fontSize: 36 }}>{booking.courtImage}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
                  {booking.courtName}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  📍 {booking.courtAddress}
                </p>
              </div>
            </div>
            <div style={S.summaryDivider} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                ["📅 Ngày", booking.date],
                ["🕐 Giờ bắt đầu", booking.startTime],
                ["⏱ Thời gian", `${booking.hours} giờ`],
                ["🏸 Sân số", `Sân số ${booking.courtNum}`],
                ["👥 Số người", `${booking.players} người`],
              ].map(([k, v]) => (
                <div key={k} style={S.summaryRow}>
                  <span style={S.sKey}>{k}</span>
                  <span style={S.sVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div style={S.summaryCard}>
            <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>💰 Chi tiết thanh toán</h4>
            <div style={S.summaryRow}>
              <span style={S.sKey}>
                {booking.pricePerHour.toLocaleString("vi-VN")}đ × {booking.hours}h
              </span>
              <span style={S.sVal}>
                {(booking.pricePerHour * booking.hours).toLocaleString("vi-VN")}đ
              </span>
            </div>
            {booking.discount > 0 && (
              <div style={S.summaryRow}>
                <span style={{ ...S.sKey, color: "#00c864" }}>
                  🎁 Giảm giá ({booking.promoCode})
                </span>
                <span style={{ ...S.sVal, color: "#00c864", fontWeight: 700 }}>
                  -{booking.discount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
            <div style={S.summaryDivider} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Tổng thanh toán</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#00c864" }}>
                {booking.total.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          {/* Booking ID */}
          <div style={S.bookingIdCard}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
              MÃ ĐẶT SÂN
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#00c864", fontFamily: "monospace", letterSpacing: 2 }}>
                #{booking.bookingId}
              </span>
              <button
                onClick={() => handleCopy(`#${booking.bookingId}`, "bid")}
                style={{
                  ...S.copyBtn,
                  background: copied === "bid" ? "rgba(0,200,100,0.2)" : "rgba(255,255,255,0.07)",
                  borderColor: copied === "bid" ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.12)",
                  color: copied === "bid" ? "#00c864" : "rgba(255,255,255,0.55)",
                }}
              >
                {copied === "bid" ? "✓ Đã sao chép" : "📋 Sao chép"}
              </button>
            </div>
          </div>

          {/* Security note */}
          <div style={S.securityNote}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Giao dịch được bảo mật bởi tiêu chuẩn mã hóa SSL 256-bit. Thông tin thanh toán của bạn hoàn toàn an toàn.
            </p>
          </div>

          {/* Hotline */}
          <div style={S.hotlineCard}>
            <span style={{ fontSize: 20 }}>📞</span>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>
                Hỗ trợ thanh toán 24/7
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#00c864" }}>1800 0000</div>
            </div>
          </div>
        </div>
      </div>

      {/* CANCEL CONFIRM MODAL */}
      {showConfirmCancel && (
        <div style={S.overlay} onClick={() => setShowConfirmCancel(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 14, textAlign: "center" }}>⚠️</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>
              Hủy thanh toán?
            </h3>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textAlign: "center", margin: "0 0 24px", lineHeight: 1.6 }}>
              Đơn đặt sân <strong style={{ color: "#fff" }}>#{booking.bookingId}</strong> sẽ bị hủy
              nếu bạn rời trang này mà chưa thanh toán.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowConfirmCancel(false)} style={{ ...S.outlineBtn, flex: 1 }}>
                Tiếp tục thanh toán
              </button>
              <button
                onClick={() => navigate("/")}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#ff4444,#ff2255)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Hủy đặt sân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#0a0e1a",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#fff",
  },
  nav: {
    background: "rgba(10,14,26,0.96)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky", top: 0, zIndex: 100,
  },
  navWrap: {
    maxWidth: 1200, margin: "0 auto", padding: "0 24px",
    height: 62, display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "rgba(255,255,255,0.7)",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoTxt: {
    fontSize: 20, fontWeight: 800,
    background: "linear-gradient(90deg,#00c864,#00a0e9)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  countdownBanner: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 12, padding: "12px 24px",
    border: "1px solid transparent",
    borderTop: "none", borderLeft: "none", borderRight: "none",
    borderBottomWidth: 1, borderBottomStyle: "solid",
  },
  mainGrid: {
    maxWidth: 1100, margin: "0 auto",
    padding: "28px 24px 48px",
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: 24,
  },
  tabWrap: {
    display: "flex", gap: 6,
    background: "rgba(255,255,255,0.04)",
    padding: 4, borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  tabBtn: {
    flex: 1, padding: "10px 16px",
    background: "transparent", border: "none",
    borderRadius: 11, cursor: "pointer",
    fontSize: 14, fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(0,200,100,0.3)",
  },
  qrCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 20, padding: "24px",
  },
  qrHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  bankLogoWrap: {
    display: "flex", alignItems: "center", gap: 12,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12, padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  vietqrBadge: {
    background: "linear-gradient(135deg,#e60026,#c8001e)",
    color: "#fff", fontWeight: 800, fontSize: 13,
    padding: "5px 12px", borderRadius: 8,
    letterSpacing: 1,
  },
  qrWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 0,
    background: "#fff", borderRadius: 20,
    padding: 20, marginBottom: 20,
    position: "relative",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  qrImg: {
    width: 220, height: 220,
    borderRadius: 12,
  },
  qrFallback: {
    width: 220, height: 220, borderRadius: 12,
    background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qrFallbackInner: {
    position: "relative",
    display: "flex", flexWrap: "wrap",
    width: 180, gap: 2,
  },
  qrGrid: {
    display: "flex", flexWrap: "wrap", gap: 1,
    width: 160,
  },
  qrLogo: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    fontSize: 28,
    background: "#fff", padding: 4, borderRadius: 8,
  },
  qrAmountTag: {
    marginTop: 10,
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    color: "#fff", fontWeight: 800, fontSize: 16,
    padding: "6px 20px", borderRadius: 20,
    boxShadow: "0 4px 14px rgba(0,200,100,0.35)",
  },
  infoChips: {
    display: "flex", flexDirection: "column", gap: 8, marginBottom: 18,
  },
  infoChip: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
  },
  infoChipHL: {
    background: "rgba(0,200,100,0.06)",
    border: "1px solid rgba(0,200,100,0.2)",
  },
  copyBtn: {
    padding: "6px 12px", borderRadius: 8,
    border: "1px solid", cursor: "pointer",
    fontSize: 12, fontWeight: 600,
    whiteSpace: "nowrap", transition: "all 0.2s",
    flexShrink: 0,
  },
  instructionBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "16px 18px",
    marginBottom: 16,
  },
  appRow: {
    display: "flex", alignItems: "center",
    gap: 8, flexWrap: "wrap",
  },
  appChip: {
    padding: "4px 10px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20, fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  simulateBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    border: "none", borderRadius: 16,
    color: "#fff", fontSize: 16, fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 28px rgba(0,200,100,0.4)",
  },
  verifyingBar: {
    position: "relative", overflow: "hidden",
    width: "100%", padding: "15px",
    background: "rgba(0,200,100,0.08)",
    border: "1px solid rgba(0,200,100,0.25)",
    borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  verifyingBarFill: {
    position: "absolute", top: 0, left: 0, height: "100%",
    width: "60%",
    background: "linear-gradient(90deg,rgba(0,200,100,0.15),transparent)",
    animation: "slide 1.5s ease-in-out infinite",
  },
  verifyingWrap: {
    width: 220, height: 220,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  spinner: {
    width: 48, height: 48,
    border: "4px solid rgba(0,200,100,0.2)",
    borderTop: "4px solid #00c864",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  // Right panel
  summaryCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 18, padding: "20px 22px",
  },
  summaryHeader: {
    display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16,
  },
  summaryDivider: {
    height: 1, background: "rgba(255,255,255,0.07)", margin: "12px 0",
  },
  summaryRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  sKey: { fontSize: 13, color: "rgba(255,255,255,0.45)" },
  sVal: { fontSize: 13, color: "#fff", fontWeight: 500, textAlign: "right" },
  bookingIdCard: {
    background: "rgba(0,200,100,0.06)",
    border: "1px solid rgba(0,200,100,0.18)",
    borderRadius: 16, padding: "16px 18px",
  },
  securityNote: {
    display: "flex", gap: 12, alignItems: "flex-start",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "14px 16px",
  },
  hotlineCard: {
    display: "flex", gap: 14, alignItems: "center",
    background: "rgba(0,200,100,0.05)",
    border: "1px solid rgba(0,200,100,0.15)",
    borderRadius: 14, padding: "14px 18px",
  },
  // Result screens
  resultCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 24, padding: "48px 40px",
    maxWidth: 480, width: "100%",
    textAlign: "center",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  successRing: {
    width: 80, height: 80, borderRadius: "50%",
    background: "rgba(0,200,100,0.12)",
    border: "3px solid #00c864",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 0 32px rgba(0,200,100,0.3)",
  },
  successIcon: {
    fontSize: 36, color: "#00c864", fontWeight: 900,
  },
  successSummary: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "16px 20px",
    marginBottom: 20, textAlign: "left",
  },
  successRow: {
    display: "flex", justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  primaryBtn: {
    flex: 1, padding: "12px",
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    border: "none", borderRadius: 12,
    color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,200,100,0.3)",
  },
  outlineBtn: {
    flex: 1, padding: "12px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, color: "rgba(255,255,255,0.75)",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  // Modal
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: "#141826",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20, padding: "32px 30px",
    width: "100%", maxWidth: 440,
    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
  },
};