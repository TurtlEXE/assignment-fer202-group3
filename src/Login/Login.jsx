import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { globalContext } from "../GlobalContextProvider";

const Login = () => {
  const { users, setCurrentUser } = useContext(globalContext);

  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const matched = users.find(
        (acc) =>
          acc.email === form.email.trim().toLowerCase() &&
          acc.passwordHash === form.password &&
          acc.role === form.role
      );

      if (!matched) {
        setLoading(false);
        const emailExists = users.find(
          (acc) => acc.email === form.email.trim().toLowerCase()
        );
        if (!emailExists) {
          setError("Email không tồn tại trong hệ thống.");
        } else {
          setError("Sai mật khẩu hoặc sai loại tài khoản.");
        }
        return;
      }

      // Build user object
      const userData = {
        id:        matched.id,
        fullName:  matched.fullName,
        email:     matched.email,
        phone:     matched.phone,
        role:      matched.role,
        avatarUrl: matched.avatarUrl,
        status:    matched.status,
      };

      // Set vào global context
      setCurrentUser(userData);

      // Lưu vào localStorage để giữ session khi reload
      localStorage.setItem("pb_token", `mock_token_${matched.id}_${Date.now()}`);
      localStorage.setItem("pb_user", JSON.stringify(userData));

      setLoading(false);

      if (matched.role === "owner") {
        navigate("/dashboard");
      } else if (matched.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }, 1000);
  };

  return (
    <div style={S.page}>
      <div style={S.bgBlob1} /><div style={S.bgBlob2} /><div style={S.bgBlob3} />
      <div style={S.wrap}>
        {/* LEFT PANEL */}
        <div style={S.left}>
          <div style={S.logo}>
            <div style={S.logoIcon}>🏓</div>
            <span style={S.logoTxt}>PickleZone</span>
          </div>
          <h1 style={S.heroH}>
            Đặt sân<br />
            <span style={S.heroGreen}>Pickleball</span><br />
            dễ dàng hơn bao giờ hết
          </h1>
          <p style={S.heroP}>
            Hệ thống quản lý & đặt sân hiện đại — tìm kiếm, đặt lịch và trải nghiệm thể thao đỉnh cao chỉ trong vài cú click.
          </p>
          <div style={S.statsRow}>
            {[["120+", "Sân hoạt động"], ["8,500+", "Lượt đặt sân"], ["15", "Khu vực"]].map(([n, l], i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={S.statDiv} />}
                <div style={S.statItem}>
                  <span style={S.statN}>{n}</span>
                  <span style={S.statL}>{l}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          {[["🏅", "Thi đấu chuyên nghiệp"], ["⚡", "Đặt sân tức thì"], ["🎯", "Đánh giá uy tín"]].map(([ic, tx], i) => (
            <div key={i} style={S.badge}>
              <span style={{ fontSize: 20 }}>{ic}</span>
              <span style={S.badgeTxt}>{tx}</span>
            </div>
          ))}
        </div>

        {/* RIGHT CARD */}
        <div style={S.card}>
          <h2 style={S.cardH}>Chào mừng trở lại 👋</h2>
          <p style={S.cardSub}>Đăng nhập để tiếp tục</p>
          <div style={S.tabs}>
            {[{ v: "customer", l: "🙋 Khách hàng" }, { v: "owner", l: "🛠 Owner" }, { v: "admin", l: "👑 Admin" }].map(t => (
              <button key={t.v} onClick={() => setForm({ ...form, role: t.v })}
                style={{ ...S.tab, ...(form.role === t.v ? S.tabActive : {}) }}>
                {t.l}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={S.form}>
            {error && <div style={S.errBox}>{error}</div>}
            <div style={S.fg}>
              <label style={S.lbl}>Email</label>
              <div style={S.iw}>
                <span style={S.ii}>✉️</span>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="your@email.com" style={S.inp} />
              </div>
            </div>
            <div style={S.fg}>
              <label style={S.lbl}>Mật khẩu</label>
              <div style={S.iw}>
                <span style={S.ii}>🔒</span>
                <input type={showPass ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} placeholder="••••••••" style={S.inp} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={S.eye}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link to="/forgot-password" style={S.forgot}>Quên mật khẩu?</Link>
            </div>
            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? "⟳ Đang đăng nhập..." : "Đăng nhập →"}
            </button>
          </form>
          <div style={S.divRow}>
            <div style={S.divLine} /><span style={S.divTxt}>hoặc</span><div style={S.divLine} />
          </div>
          <button style={S.gBtn}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G"
              style={{ width: 20, height: 20, marginRight: 10 }} />
            Đăng nhập với Google
          </button>
          <p style={S.regP}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={S.regL}>Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#0a0e1a 0%,#0d1b2a 50%,#091520 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',system-ui,sans-serif", position: "relative", overflow: "hidden", padding: "20px" },
  bgBlob1: { position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,200,100,0.08) 0%,transparent 70%)", top: -200, left: -100, pointerEvents: "none" },
  bgBlob2: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,120,255,0.1) 0%,transparent 70%)", bottom: -100, right: -50, pointerEvents: "none" },
  bgBlob3: { position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,180,0,0.07) 0%,transparent 70%)", top: "40%", left: "40%", pointerEvents: "none" },
  wrap: { display: "flex", maxWidth: 960, width: "100%", gap: 40, alignItems: "center", zIndex: 1 },
  left: { flex: 1, color: "#fff", display: "flex", flexDirection: "column", gap: 20 },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 28, background: "linear-gradient(135deg,#00c864,#00a0e9)", borderRadius: 12, width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,200,100,0.3)" },
  logoTxt: { fontSize: 22, fontWeight: 800, background: "linear-gradient(90deg,#00c864,#00a0e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroH: { fontSize: 38, fontWeight: 900, lineHeight: 1.15, margin: 0, letterSpacing: "-1px" },
  heroGreen: { background: "linear-gradient(90deg,#00c864,#00d4aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroP: { fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0, maxWidth: 360 },
  statsRow: { display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.08)" },
  statItem: { display: "flex", flexDirection: "column", gap: 2 },
  statN: { fontSize: 20, fontWeight: 800, color: "#00c864" },
  statL: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  statDiv: { width: 1, height: 36, background: "rgba(255,255,255,0.1)" },
  badge: { display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)" },
  badgeTxt: { fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 500 },
  card: { width: 400, flexShrink: 0, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", borderRadius: 24, padding: "32px 28px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" },
  cardH: { fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px" },
  cardSub: { fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 20px" },
  tabs: { display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 12 },
  tab: { flex: 1, padding: "10px 0", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, background: "transparent", color: "rgba(255,255,255,0.5)" },
  tabActive: { background: "linear-gradient(135deg,#00c864,#00a0e9)", color: "#fff", boxShadow: "0 4px 12px rgba(0,200,100,0.3)" },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  errBox: { background: "rgba(255,60,60,0.15)", border: "1px solid rgba(255,60,60,0.3)", borderRadius: 10, padding: "10px 14px", color: "#ff6b6b", fontSize: 13 },
  fg: { display: "flex", flexDirection: "column", gap: 6 },
  lbl: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" },
  iw: { position: "relative", display: "flex", alignItems: "center" },
  ii: { position: "absolute", left: 14, fontSize: 15, pointerEvents: "none" },
  inp: { width: "100%", padding: "12px 14px 12px 42px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" },
  eye: { position: "absolute", right: 14, background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: 0 },
  forgot: { fontSize: 13, color: "#00c864", textDecoration: "none", fontWeight: 500 },
  btn: { width: "100%", padding: "13px", background: "linear-gradient(135deg,#00c864,#00a0e9)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,200,100,0.35)", marginTop: 4 },
  divRow: { display: "flex", alignItems: "center", gap: 12, margin: "18px 0" },
  divLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.1)" },
  divTxt: { fontSize: 12, color: "rgba(255,255,255,0.35)" },
  gBtn: { width: "100%", padding: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  regP: { textAlign: "center", marginTop: 18, fontSize: 14, color: "rgba(255,255,255,0.4)" },
  regL: { color: "#00c864", textDecoration: "none", fontWeight: 700 },
};

export default Login;