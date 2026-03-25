import { useContext, useState } from "react";
import { globalContext } from "../GlobalContextProvider";

const PROVINCES = ["TP.HCM", "Hà Nội", "Đà Nẵng"];

const TYPE_CONF = {
  policy:  { label: "Chính sách", color: "#00a0e9", bg: "rgba(0,160,233,0.12)", icon: "📋" },
  system:  { label: "Hệ thống",   color: "#ffcc00", bg: "rgba(255,204,0,0.12)",  icon: "⚙️" },
  warning: { label: "Cảnh báo",   color: "#ff6b6b", bg: "rgba(255,107,107,0.12)", icon: "⚠️" },
  promo:   { label: "Khuyến mãi", color: "#00c864", bg: "rgba(0,200,100,0.12)",  icon: "🎁" },
};

const RECIPIENT_MODES = [
  { key: "all",      label: "Tất cả owner" },
  { key: "province", label: "Theo tỉnh/thành" },
  { key: "select",   label: "Chọn lọc" },
];

export default function AdminNotify() {
  const { users, complexes, notifications, setNotifications } = useContext(globalContext);

  // Lấy owners từ context, enrich với tên khu
  const OWNERS = users
    .filter(u => u.role === "owner")
    .map(u => {
      const complex = complexes.find(c => c.ownerId === u.id);
      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        complex: complex?.name || "—",
        province: "TP.HCM", // provinceCode có thể map sau
      };
    });

  // Lấy lịch sử từ notifications (chỉ những thông báo do admin gửi)
  const adminId = "9ed8d1d1-ae9d-43fd-a9bc-2e4ecd8a2890";
  const history = notifications
    .filter(n => n.senderId === adminId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20) // Lấy 20 thông báo gần nhất
    .map(n => {
      const recipient = users.find(u => u.id === n.recipientId);
      return {
        id: n.id,
        title: n.title,
        content: n.content,
        recipients: recipient?.fullName || "—",
        recipientCount: 1,
        sentAt: new Date(n.createdAt).toLocaleString("vi-VN"),
        type: n.type,
      };
    });

  // Group notifications by title+content để hiển thị gộp
  const groupedHistory = [];
  const seen = new Set();
  history.forEach(h => {
    const key = `${h.title}|${h.content}`;
    if (!seen.has(key)) {
      seen.add(key);
      const similar = history.filter(x => `${x.title}|${x.content}` === key);
      groupedHistory.push({
        ...h,
        recipients: similar.length > 1 ? `${similar.length} owner` : h.recipients,
        recipientCount: similar.length,
      });
    }
  });

  const [form, setForm] = useState({ title: "", content: "", type: "policy", recipientMode: "all", province: "TP.HCM", selectedOwners: [] });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề.";
    if (!form.content.trim()) e.content = "Vui lòng nhập nội dung.";
    if (form.recipientMode === "select" && form.selectedOwners.length === 0) e.recipients = "Vui lòng chọn ít nhất 1 owner.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getRecipients = () => {
    if (form.recipientMode === "all") return OWNERS;
    if (form.recipientMode === "province") return OWNERS.filter(o => o.province === form.province);
    return OWNERS.filter(o => form.selectedOwners.includes(o.id));
  };

  const toggleOwner = (id) => {
    setForm(f => ({
      ...f,
      selectedOwners: f.selectedOwners.includes(id)
        ? f.selectedOwners.filter(x => x !== id)
        : [...f.selectedOwners, id],
    }));
    setErrors(e => ({ ...e, recipients: "" }));
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    const recipients = getRecipients();
    
    try {
      // Gửi thông báo cho từng owner
      const adminId = "9ed8d1d1-ae9d-43fd-a9bc-2e4ecd8a2890";
      const newNotifications = [];
      
      for (const owner of recipients) {
        const notif = {
          id: crypto.randomUUID(),
          senderId: adminId,
          recipientId: owner.id,
          type: form.type,
          title: form.title,
          content: form.content,
          isRead: false,
          readAt: null,
          createdAt: new Date().toISOString(),
        };
        
        await fetch("http://localhost:9999/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notif),
        });
        
        newNotifications.push(notif);
      }
      
      // Cập nhật context để UI refresh
      setNotifications([...notifications, ...newNotifications]);
      
      setForm({ title: "", content: "", type: "policy", recipientMode: "all", province: "TP.HCM", selectedOwners: [] });
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
    } catch (err) {
      console.error("Send notification error:", err);
      alert("Có lỗi xảy ra khi gửi thông báo. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const recipients = getRecipients();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>📣 Gửi thông báo cho Owner</h2>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Soạn và gửi thông báo đến chủ khu</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        {/* LEFT: Compose */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={S.card}>
            <h4 style={S.cardH}>✍️ Soạn thông báo</h4>

            {/* Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <label style={S.lbl}>Loại thông báo</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(TYPE_CONF).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(f => ({ ...f, type: k }))}
                    style={{ padding: "7px 14px", border: "1px solid", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: form.type === k ? v.bg : "rgba(255,255,255,0.04)",
                      borderColor: form.type === k ? v.color + "66" : "rgba(255,255,255,0.1)",
                      color: form.type === k ? v.color : "rgba(255,255,255,0.5)" }}>
                    {v.icon} {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <label style={S.lbl}>Tiêu đề *</label>
              <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: "" })); }}
                placeholder="Nhập tiêu đề thông báo..."
                style={{ ...S.inp, ...(errors.title ? { borderColor: "rgba(255,80,80,0.5)" } : {}) }} />
              {errors.title && <span style={{ fontSize: 12, color: "#ff6b6b" }}>{errors.title}</span>}
            </div>

            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
              <label style={S.lbl}>Nội dung *</label>
              <textarea value={form.content} onChange={e => { setForm(f => ({ ...f, content: e.target.value })); setErrors(er => ({ ...er, content: "" })); }}
                placeholder="Nhập nội dung thông báo chi tiết..."
                rows={5}
                style={{ ...S.inp, resize: "none", fontFamily: "inherit", ...(errors.content ? { borderColor: "rgba(255,80,80,0.5)" } : {}) }} />
              {errors.content && <span style={{ fontSize: 12, color: "#ff6b6b" }}>{errors.content}</span>}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>{form.content.length} ký tự</div>
            </div>
          </div>

          {/* Recipients */}
          <div style={S.card}>
            <h4 style={S.cardH}>👥 Người nhận</h4>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {RECIPIENT_MODES.map(m => (
                <button key={m.key} onClick={() => setForm(f => ({ ...f, recipientMode: m.key, selectedOwners: [] }))}
                  style={{ padding: "8px 16px", border: "1px solid", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: form.recipientMode === m.key ? "rgba(0,200,100,0.15)" : "rgba(255,255,255,0.04)",
                    borderColor: form.recipientMode === m.key ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.1)",
                    color: form.recipientMode === m.key ? "#00c864" : "rgba(255,255,255,0.6)" }}>
                  {m.label}
                </button>
              ))}
            </div>

            {form.recipientMode === "province" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                <label style={S.lbl}>Chọn tỉnh/thành</label>
                <select value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} style={S.inp}>
                  {PROVINCES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            )}

            {form.recipientMode === "select" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                <label style={S.lbl}>Chọn owner</label>
                {OWNERS.map(o => (
                  <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: form.selectedOwners.includes(o.id) ? "rgba(0,200,100,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.selectedOwners.includes(o.id) ? "rgba(0,200,100,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.selectedOwners.includes(o.id)} onChange={() => toggleOwner(o.id)} style={{ accentColor: "#00c864", width: 16, height: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{o.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{o.complex}</div>
                    </div>
                  </label>
                ))}
                {errors.recipients && <span style={{ fontSize: 12, color: "#ff6b6b" }}>{errors.recipients}</span>}
              </div>
            )}

            <div style={{ background: "rgba(0,200,100,0.06)", border: "1px solid rgba(0,200,100,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              📬 Sẽ gửi đến <strong style={{ color: "#00c864" }}>{recipients.length} owner</strong>
              {recipients.length > 0 && form.recipientMode !== "all" && (
                <span style={{ color: "rgba(255,255,255,0.45)" }}> ({recipients.map(o => o.name).join(", ")})</span>
              )}
            </div>
          </div>

          {sentSuccess && (
            <div style={{ background: "rgba(0,200,100,0.1)", border: "1px solid rgba(0,200,100,0.3)", borderRadius: 12, padding: "14px 18px", fontSize: 14, color: "#00c864", fontWeight: 600 }}>
              ✅ Thông báo đã được gửi thành công đến {recipients.length} owner!
            </div>
          )}

          <button onClick={handleSend} disabled={sending}
            style={{ width: "100%", padding: "14px", background: sending ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#00c864,#00a0e9)", border: "none", borderRadius: 16, color: sending ? "rgba(255,255,255,0.4)" : "#fff", fontSize: 16, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", boxShadow: sending ? "none" : "0 8px 24px rgba(0,200,100,0.35)" }}>
            {sending ? "⟳ Đang gửi..." : `📣 Gửi thông báo đến ${recipients.length} owner`}
          </button>
        </div>

        {/* RIGHT: History */}
        <div style={S.card}>
          <h4 style={S.cardH}>📜 Lịch sử gửi</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {groupedHistory.length > 0 ? groupedHistory.map(n => {
              const tc = TYPE_CONF[n.type] || TYPE_CONF.policy;
              return (
                <div key={n.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{tc.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{n.content}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: tc.color, background: tc.bg }}>
                      {tc.label}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      👥 {n.recipientCount} · {n.sentAt}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <p style={{ margin: 0, fontSize: 13 }}>Chưa có lịch sử gửi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "20px 22px" },
  cardH: { fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#fff" },
  lbl: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" },
  inp: { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" },
};
