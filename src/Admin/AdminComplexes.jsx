import { useContext, useState } from "react";
import { globalContext } from "../GlobalContextProvider";

const STATUS_CONF = {
  active: { label: "Hoạt động", color: "#00c864", bg: "rgba(0,200,100,0.12)" },
  locked: { label: "Đã khóa",   color: "#ff6b6b", bg: "rgba(255,107,107,0.12)" },
};

export default function AdminComplexes() {
  const { complexes: rawComplexes, setComplexes, users, bookings, payments } = useContext(globalContext);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lockReason, setLockReason] = useState("");
  const [lockError, setLockError] = useState("");

  // Enrich complexes với owner info + doanh thu thực
  const complexes = rawComplexes.map(c => {
    const owner = users.find(u => u.id === c.ownerId) || {};
    const cBookings = bookings.filter(b => b.complexId === c.id);
    const revenue = payments
      .filter(p => cBookings.some(b => b.id === p.bookingId) && p.status === "success")
      .reduce((s, p) => s + p.amount, 0);
    return {
      ...c,
      ownerName: owner.fullName || "—",
      ownerEmail: owner.email || "—",
      bookingCount: cBookings.length,
      revenue,
      lockReason: c.lockReason || "",
    };
  });

  const filtered = complexes.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.ownerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openLock   = (c) => { setSelected(c); setLockReason(""); setLockError(""); setModal("lock"); };
  const openUnlock = (c) => { setSelected(c); setModal("unlock"); };
  const openView   = (c) => { setSelected(c); setModal("view"); };

  const handleLock = async () => {
    if (!lockReason.trim()) { setLockError("Vui lòng nhập lý do khóa."); return; }
    
    try {
      // Cập nhật status trong database
      await fetch(`http://localhost:9999/complexes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "locked", lockReason }),
      });

      // Gửi thông báo cho owner
      const owner = users.find(u => u.id === selected.ownerId);
      if (owner) {
        await fetch("http://localhost:9999/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            senderId: "9ed8d1d1-ae9d-43fd-a9bc-2e4ecd8a2890",
            recipientId: owner.id,
            type: "system",
            title: `Khu "${selected.name}" đã bị khóa`,
            content: `Lý do: ${lockReason}. Vui lòng liên hệ Admin để được hỗ trợ.`,
            isRead: false,
            readAt: null,
            createdAt: new Date().toISOString(),
          }),
        });
      }

      // Cập nhật state local
      setComplexes(rawComplexes.map(c =>
        c.id === selected.id ? { ...c, status: "locked", lockReason } : c
      ));
      setModal(null);
    } catch (err) {
      console.error("Lock error:", err);
      alert("Có lỗi xảy ra khi khóa khu. Vui lòng thử lại.");
    }
  };

  const handleUnlock = async () => {
    try {
      // Cập nhật status trong database
      await fetch(`http://localhost:9999/complexes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", lockReason: "" }),
      });

      // Gửi thông báo cho owner
      const owner = users.find(u => u.id === selected.ownerId);
      if (owner) {
        await fetch("http://localhost:9999/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            senderId: "9ed8d1d1-ae9d-43fd-a9bc-2e4ecd8a2890",
            recipientId: owner.id,
            type: "system",
            title: `Khu "${selected.name}" đã được mở khóa`,
            content: `Chúc mừng! Khu của bạn đã được mở khóa và có thể hoạt động trở lại. Khách hàng có thể tìm kiếm và đặt sân ngay bây giờ.`,
            isRead: false,
            readAt: null,
            createdAt: new Date().toISOString(),
          }),
        });
      }

      // Cập nhật state local
      setComplexes(rawComplexes.map(c =>
        c.id === selected.id ? { ...c, status: "active", lockReason: "" } : c
      ));
      setModal(null);
    } catch (err) {
      console.error("Unlock error:", err);
      alert("Có lỗi xảy ra khi mở khóa khu. Vui lòng thử lại.");
    }
  };

  const summary = {
    total:  complexes.length,
    active: complexes.filter(c => c.status === "active").length,
    locked: complexes.filter(c => c.status === "locked").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          { label: "Tổng số khu", value: summary.total,  icon: "🏟️", color: "#00a0e9" },
          { label: "Đang hoạt động", value: summary.active, icon: "✅", color: "#00c864" },
          { label: "Đang bị khóa", value: summary.locked, icon: "🔒", color: "#ff6b6b" },
        ].map(card => (
          <div key={card.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên khu, chủ sân..."
            style={{ width: "100%", padding: "11px 14px 11px 42px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "active", "locked"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: "9px 14px", border: "1px solid", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: filterStatus === s ? "rgba(0,200,100,0.15)" : "rgba(255,255,255,0.04)",
                borderColor: filterStatus === s ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.1)",
                color: filterStatus === s ? "#00c864" : "rgba(255,255,255,0.6)" }}>
              {s === "all" ? "Tất cả" : STATUS_CONF[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Tên khu", "Chủ sân", "Địa chỉ", "Doanh thu", "Chiết khấu", "Trạng thái", "Thao tác"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const st = STATUS_CONF[c.status] || STATUS_CONF.active;
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{c.bookingCount} lượt đặt</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, color: "#fff" }}>{c.ownerName}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.ownerEmail}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.6)", maxWidth: 200 }}>{c.address}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#00c864", whiteSpace: "nowrap" }}>
                    {c.revenue.toLocaleString("vi-VN")}đ
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.discountRate > 0 ? "#ffcc00" : "rgba(255,255,255,0.4)" }}>
                      {c.discountRate > 0 ? `${c.discountRate}%` : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: st.color, background: st.bg }}>
                      {c.status === "locked" ? "🔒 " : "✅ "}{st.label}
                    </span>
                    {c.status === "locked" && c.lockReason && (
                      <div style={{ fontSize: 11, color: "#ff6b6b", marginTop: 4, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.lockReason}>
                        {c.lockReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openView(c)} style={S.actBtn("rgba(0,160,233,0.15)", "rgba(0,160,233,0.35)", "#00a0e9")} title="Xem">👁</button>
                      {c.status !== "locked"
                        ? <button onClick={() => openLock(c)} style={S.actBtn("rgba(255,107,107,0.15)", "rgba(255,107,107,0.35)", "#ff6b6b")} title="Khóa">🔒</button>
                        : <button onClick={() => openUnlock(c)} style={S.actBtn("rgba(0,200,100,0.15)", "rgba(0,200,100,0.35)", "#00c864")} title="Mở khóa">🔓</button>
                      }
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p>Không tìm thấy khu nào</p>
          </div>
        )}
      </div>

      {/* MODAL: VIEW */}
      {modal === "view" && selected && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📋 Chi tiết khu</h3>
              <button onClick={() => setModal(null)} style={S.closeBtn}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Tên khu", selected.name],
                ["Chủ sân", selected.ownerName],
                ["Email", selected.ownerEmail],
                ["Địa chỉ", selected.address],
                ["Điện thoại", selected.phone || "—"],
                ["Doanh thu", `${selected.revenue.toLocaleString("vi-VN")}đ`],
                ["Lượt đặt", `${selected.bookingCount} lần`],
                ["Chiết khấu", selected.discountRate > 0 ? `${selected.discountRate}%` : "Không có"],
                ["Trạng thái", STATUS_CONF[selected.status]?.label || selected.status],
                ["Giờ mở cửa", `${selected.openTime || "—"} – ${selected.closeTime || "—"}`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", wordBreak: "break-all" }}>{v}</div>
                </div>
              ))}
            </div>
            {selected.status === "locked" && selected.lockReason && (
              <div style={{ marginTop: 12, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#ff6b6b", marginBottom: 4 }}>LÝ DO KHÓA</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{selected.lockReason}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {selected.status !== "locked"
                ? <button onClick={() => { setModal(null); setTimeout(() => openLock(selected), 50); }}
                    style={{ flex: 1, padding: "11px", background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 12, color: "#ff6b6b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    🔒 Khóa khu này
                  </button>
                : <button onClick={() => { setModal(null); setTimeout(() => openUnlock(selected), 50); }}
                    style={{ flex: 1, padding: "11px", background: "rgba(0,200,100,0.12)", border: "1px solid rgba(0,200,100,0.25)", borderRadius: 12, color: "#00c864", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    🔓 Mở khóa khu này
                  </button>
              }
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOCK */}
      {modal === "lock" && selected && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={{ ...S.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>Khóa khu này?</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>
                <strong style={{ color: "#fff" }}>{selected.name}</strong> sẽ bị ẩn khỏi tìm kiếm và không nhận booking mới.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Lý do khóa *</label>
              <textarea value={lockReason} onChange={e => { setLockReason(e.target.value); setLockError(""); }}
                placeholder="Nhập lý do khóa khu (sẽ được gửi thông báo đến Owner)..."
                rows={3}
                style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.06)", border: `1px solid ${lockError ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 12, color: "#fff", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              {lockError && <span style={{ fontSize: 12, color: "#ff6b6b" }}>{lockError}</span>}
            </div>
            <div style={{ background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
              📧 Thông báo sẽ được gửi tự động đến <strong style={{ color: "#ffcc00" }}>{selected.ownerEmail}</strong>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button onClick={handleLock} style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg,#ff4444,#ff2255)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                🔒 Xác nhận khóa & Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UNLOCK */}
      {modal === "unlock" && selected && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={{ ...S.modal, maxWidth: 420, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔓</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>Mở khóa khu này?</h3>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginBottom: 12 }}>
              <strong style={{ color: "#fff" }}>{selected.name}</strong> sẽ hoạt động trở lại và nhận booking mới.
            </p>
            {selected.lockReason && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>LÝ DO ĐÃ KHÓA TRƯỚC ĐÓ</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{selected.lockReason}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button onClick={handleUnlock} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#00c864,#00a0e9)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                🔓 Mở khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  actBtn: (bg, border, color) => ({ padding: "6px 10px", background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, cursor: "pointer" }),
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: "#141826", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "28px 30px", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" },
  closeBtn: { background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 16 },
};
