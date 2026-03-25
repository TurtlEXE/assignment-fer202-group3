import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { globalContext } from "../GlobalContextProvider";

const BASE = "http://localhost:9999";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { users, setUsers } = useContext(globalContext);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("checkEmail");
  const [candidateUser, setCandidateUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const checkEmail = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email của bạn.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không hợp lệ.");
      return;
    }

    const found = users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      setError("Email không tồn tại trong hệ thống.");
      return;
    }

    setCandidateUser(found);
    setMode("resetPassword");
    setSuccess("Email hợp lệ. Bạn có thể nhập mật khẩu mới ngay dưới đây.");
  };

  const resetPassword = async () => {
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.patch(`${BASE}/users/${candidateUser.id}`, {
        passwordHash: newPassword,
      });

      const updatedUsers = users.map((u) =>
        u.id === candidateUser.id ? { ...u, passwordHash: newPassword } : u,
      );
      setUsers(updatedUsers);

      setSuccess("Đổi mật khẩu thành công. Vui lòng dùng mật khẩu mới đăng nhập.");
      setMode("done");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Không thể cập nhật mật khẩu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "checkEmail") {
      checkEmail();
      return;
    }
    if (mode === "resetPassword") {
      resetPassword();
      return;
    }
    if (mode === "done") {
      navigate("/login");
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h2 style={S.cardH}>Quên mật khẩu</h2>
        <p style={S.cardSub}>
          Nhập email bạn đã đăng ký, chúng tôi sẽ gửi đường dẫn để bạn đặt lại mật khẩu.
        </p>
        <form onSubmit={handleSubmit} style={S.form}>
          {error && <div style={S.errBox}>{error}</div>}
          {success && <div style={S.successBox}>{success}</div>}

          <label style={S.lbl}>Email</label>
          <div style={S.iw}>
            <span style={S.ii}>✉️</span>
            <input
              type="email"
              name="email"
              value={email}
              disabled={mode !== "checkEmail"}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={S.inp}
            />
          </div>

          {mode === "resetPassword" && (
            <>
              <label style={S.lbl}>Mật khẩu mới</label>
              <div style={S.iw}>
                <span style={S.ii}>🔒</span>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  style={S.inp}
                />
              </div>
              <label style={S.lbl}>Xác nhận mật khẩu</label>
              <div style={S.iw}>
                <span style={S.ii}>🔒</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  style={S.inp}
                />
              </div>
            </>
          )}

          <button type="submit" style={S.btn} disabled={loading}>
            {loading
              ? "⟳ Đang xử lý..."
              : mode === "checkEmail"
              ? "Kiểm tra email"
              : mode === "resetPassword"
              ? "Cập nhật mật khẩu"
              : "Hoàn tất"}
          </button>

          {mode === "resetPassword" && (
            <button
              type="button"
              style={{ ...S.btn, background: "rgba(255,255,255,0.15)", color: "#fff" }}
              onClick={() => {
                setMode("checkEmail");
                setCandidateUser(null);
                setNewPassword("");
                setConfirmPassword("");
                setSuccess("");
                setError("");
              }}
            >
              Quay lại nhập email
            </button>
          )}
        </form>

        <div style={S.bottomLine}>
          <span>
            Quay về <Link to="/login" style={S.link}>Đăng nhập</Link>
          </span>
          <span>
            Chưa có tài khoản? <Link to="/register" style={S.link}>Đăng ký</Link>
          </span>
        </div>

        <button style={S.backBtn} onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
      </div>
    </div>
  );
};

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0a0e1a 0%,#0d1b2a 50%,#091520 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    padding: 24,
  },
  card: {
    width: 380,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    color: "#fff",
    padding: 26,
    textAlign: "center",
  },
  cardH: {
    margin: "0 0 12px",
    fontSize: 26,
    fontWeight: 700,
  },
  cardSub: {
    margin: "0 0 20px",
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  lbl: {
    textAlign: "left",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
    fontWeight: 600,
  },
  iw: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  ii: {
    marginRight: 8,
  },
  inp: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#fff",
    outline: "none",
    fontSize: 14,
    padding: "4px 0",
  },
  btn: {
    marginTop: 4,
    background: "linear-gradient(135deg,#00c864,#0098ec)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    padding: "10px 14px",
    cursor: "pointer",
  },
  errBox: {
    background: "rgba(255,78,78,0.2)",
    border: "1px solid rgba(255,78,78,0.5)",
    color: "#ffb4b4",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
  },
  successBox: {
    background: "rgba(0,200,100,0.2)",
    border: "1px solid rgba(0,200,100,0.5)",
    color: "#b4ffd4",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
  },
  bottomLine: {
    marginTop: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  link: {
    color: "#00ccff",
    fontWeight: 600,
    textDecoration: "none",
  },
  backBtn: {
    marginTop: 16,
    background: "none",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default ForgotPassword;
