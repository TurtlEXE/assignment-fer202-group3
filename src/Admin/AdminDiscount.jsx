import { useContext, useState } from "react";
import { globalContext } from "../GlobalContextProvider";

export default function AdminDiscount() {
  const { complexes: rawComplexes, setComplexes, users, bookings, payments } = useContext(globalContext);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [newRate, setNewRate] = useState("");
  const [rateError, setRateError] = useState("");

  // Enrich với owner + doanh thu thực + số sân (random 3-10)
  const complexes = rawComplexes.map(c => {
    const owner = users.find(u => u.id === c.ownerId) || {};
    const cBookings = bookings.filter(b => b.complexId === c.id && b.status !== "cancelled");
    const revenue = payments
      .filter(p => cBookings.some(b => b.id === p.bookingId) && p.status === "success")
      .reduce((s, p) => s + p.amount, 0);
    
    return {
      ...c,
      ownerName: owner.fullName || "—",
      ownerEmail: owner.email || "—",
      bookingCount: cBookings.length,
      courtCount: Math.floor(Math.random() * 8) + 3,
      revenue,
    };
  });

  const filtered = complexes.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.address.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const summary = {
    total: complexes.length,
    locked: complexes.filter(c => c.status === "locked").length,
    avgRate: complexes.length > 0 
      ? (complexes.reduce((s, c) => s + (c.discountRate || 0), 0) / complexes.length).toFixed(1)
      : "0.0",
  };

  const openEdit = (c) => {
    setSelected(c);
    setNewRate(String(c.discountRate ?? 0));
    setRateError("");
    setModal("edit");
  };

  const handleSave = async () => {
    const val = Number(newRate);
    if (isNaN(val) || val < 0 || val > 100) { 
      setRateError("Chiết khấu phải từ 0 đến 100%."); 
      return; 
    }
    
    try {
      await fetch(`http://localhost:9999/complexes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountRate: val }),
      });
      
      setComplexes(rawComplexes.map(c => c.id === selected.id ? { ...c, discountRate: val } : c));
      setModal(null);
    } catch (err) {
      console.error("Save error:", err);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const getDiscountColor = (rate) => {
    if (rate === 0) return { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.05)" };
    if (rate <= 3) return { color: "#00c864", bg: "rgba(0,200,100,0.15)" };
    if (rate <= 7) return { color: "#ffcc00", bg: "rgba(255,204,0,0.15)" };
    return { color: "#ff8800", bg: "rgba(255,136,0,0.15)" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header + Summary */}
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>🏷️ Chiết khấu</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
          Admin / Chiết khấu
        </p>
        
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,160,233,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🏟️
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Tổng số khu</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#00a0e9" }}>{summary.total}</div>
            </div>
          </div>
          
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,200,100,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🔒
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Có chiết khấu</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#00c864" }}>{complexes.filter(c => c.discountRate > 0).length}</div>
            </div>
          </div>
          
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,204,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              📊
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Chiết khấu TB</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffcc00" }}>{summary.avgRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên khu, khu vực..."
          style={{ width: "100%", padding: "11px 14px 11px 42px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["STT", "TÊN KHU", "KHU VỰC", "SỐ SÂN", "BOOKING", "CHIẾT KHẤU HIỆN TẠI", "THAO TÁC"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => {
              const discStyle = getDiscountColor(c.discountRate || 0);
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{c.name}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    {c.address.split(",").slice(-2).join(",")}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
                    {c.courtCount} sân
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
                    {c.bookingCount}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Progress bar */}
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden", minWidth: 80 }}>
                        <div style={{ width: `${Math.min((c.discountRate || 0) * 10, 100)}%`, height: "100%", background: discStyle.color, borderRadius: 3, transition: "width 0.3s" }} />
                      </div>
                      {/* Percentage */}
                      <span style={{ fontSize: 14, fontWeight: 700, color: discStyle.color, minWidth: 40, textAlign: "right" }}>
                        {c.discountRate || 0}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={() => openEdit(c)} 
                      style={{ padding: "7px 16px", background: "rgba(255,204,0,0.12)", border: "1px solid rgba(255,204,0,0.25)", borderRadius: 10, color: "#ffcc00", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      ✏️ Điều chỉnh
                    </button>
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

      {/* MODAL: EDIT */}
      {modal === "edit" && selected && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={{ ...S.modal, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🏷️ Điều chỉnh chiết khấu</h3>
              <button onClick={() => setModal(null)} style={S.closeBtn}>✕</button>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {selected.courtCount} sân · {selected.bookingCount} booking
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Chiết khấu mới (%) *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="number" min="0" max="100" value={newRate}
                  onChange={e => { setNewRate(e.target.value); setRateError(""); }}
                  placeholder="0 – 100"
                  style={{ flex: 1, padding: "12px 14px", background: "rgba(255,255,255,0.06)", border: `1px solid ${rateError ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 700, outline: "none" }} />
                <span style={{ fontSize: 22, fontWeight: 900, color: "#ffcc00" }}>%</span>
              </div>
              {rateError && <span style={{ fontSize: 12, color: "#ff6b6b" }}>{rateError}</span>}
            </div>
            
            <input type="range" min="0" max="30" value={Number(newRate) || 0}
              onChange={e => setNewRate(e.target.value)}
              style={{ width: "100%", accentColor: "#ffcc00", marginBottom: 20 }} />
            
            <div style={{ background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                💡 Chiết khấu sẽ áp dụng cho tất cả booking mới từ thời điểm lưu
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setModal(null)} 
                style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Hủy
              </button>
              <button onClick={handleSave} 
                style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg,#ffcc00,#ff8800)", border: "none", borderRadius: 12, color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                💾 Lưu & Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: "#141826", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "28px 30px", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" },
  closeBtn: { background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 16 },
};
