import { useContext, useState, useMemo } from "react";
import { globalContext } from "../GlobalContextProvider";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const PERIODS = [
  { key: "7d", label: "7 ngày qua" },
  { key: "30d", label: "30 ngày qua" },
  { key: "3m", label: "3 tháng qua" },
  { key: "all", label: "Tất cả" },
];

const STATUS_MAP = {
  completed: { label: "Hoàn thành", color: "#00c864" },
  paid:      { label: "Đã thanh toán", color: "#00a0e9" },
  cancelled: { label: "Đã hủy", color: "#ff6b6b" },
  pending:   { label: "Chờ xử lý", color: "#ffcc00" },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px" }}>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "3px 0", fontSize: 13, color: p.fill || "#fff" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function AdminStats() {
  const { users, complexes, bookings, payments } = useContext(globalContext);
  const [period, setPeriod] = useState("all");

  // ── Lọc theo period ──
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff = null;
    if (period === "7d")  cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (period === "30d") cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (period === "3m")  cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const filterByDate = (list, dateField) => {
      if (!cutoff) return list;
      return list.filter(item => new Date(item[dateField]) >= cutoff);
    };

    return {
      bookings: filterByDate(bookings, "createdAt"),
      payments: filterByDate(payments.filter(p => p.status === "success"), "paidAt"),
      users:    filterByDate(users.filter(u => u.role === "customer"), "createdAt"),
    };
  }, [period, bookings, payments, users]);

  // ── 1. Tổng doanh thu ──
  const totalRevenue = filteredData.payments.reduce((s, p) => s + p.amount, 0);

  // ── 2. Số booking theo trạng thái ──
  const bookingsByStatus = Object.keys(STATUS_MAP).map(status => ({
    status,
    label: STATUS_MAP[status].label,
    color: STATUS_MAP[status].color,
    count: filteredData.bookings.filter(b => b.status === status).length,
  }));

  // ── 3. Top khu theo doanh thu ──
  const complexRevMap = {};
  filteredData.bookings.forEach(b => {
    if (b.status === "cancelled") return;
    if (!complexRevMap[b.complexId]) complexRevMap[b.complexId] = { revenue: 0, bookings: 0 };
    complexRevMap[b.complexId].revenue += b.finalAmount || 0;
    complexRevMap[b.complexId].bookings += 1;
  });
  const topComplexes = complexes
    .map(c => ({
      ...c,
      revenue: complexRevMap[c.id]?.revenue || 0,
      bookingCount: complexRevMap[c.id]?.bookings || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ── 4. Số user mới (customer) ──
  const newCustomers = filteredData.users.length;

  // ── 5. Tỷ lệ hủy ──
  const totalBookings = filteredData.bookings.length;
  const cancelledCount = filteredData.bookings.filter(b => b.status === "cancelled").length;
  const cancelRate = totalBookings > 0 ? ((cancelledCount / totalBookings) * 100).toFixed(1) : "0.0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header + Period filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>📊 Thống kê toàn hệ thống</h2>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Tổng quan hoạt động nền tảng · Lọc theo kỳ
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{ padding: "8px 16px", border: "1px solid", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: period === p.key ? "rgba(0,200,100,0.15)" : "rgba(255,255,255,0.04)",
                borderColor: period === p.key ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.1)",
                color: period === p.key ? "#00c864" : "rgba(255,255,255,0.6)" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Tổng doanh thu */}
      <div style={S.section}>
        <h3 style={S.sectionH}>💰 Tổng doanh thu</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#00c864" }}>
            {totalRevenue.toLocaleString("vi-VN")}đ
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            từ {filteredData.payments.length} giao dịch thành công
          </div>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Tổng số khu đang hoạt động: <strong style={{ color: "#00a0e9" }}>{complexes.filter(c => c.status === "active").length}</strong>
        </div>
      </div>

      {/* 2. Số booking theo trạng thái */}
      <div style={S.section}>
        <h3 style={S.sectionH}>📅 Số booking theo trạng thái</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
          {bookingsByStatus.map(s => (
            <div key={s.status} style={{ background: `${s.color}11`, border: `1px solid ${s.color}33`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.count}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bookingsByStatus} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Số lượng" radius={[8, 8, 0, 0]}>
              {bookingsByStatus.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Top khu */}
      <div style={S.section}>
        <h3 style={S.sectionH}>🏆 Top 10 khu theo doanh thu</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["#", "Tên khu", "Địa chỉ", "Doanh thu", "Lượt đặt", "Chiết khấu"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topComplexes.length > 0 ? topComplexes.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: 16 }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#fff" }}>{c.name}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "rgba(255,255,255,0.5)", maxWidth: 250 }}>
                    {c.address}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#00c864", whiteSpace: "nowrap" }}>
                    {c.revenue.toLocaleString("vi-VN")}đ
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
                    {c.bookingCount}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: c.discountRate > 0 ? "#ffcc00" : "rgba(255,255,255,0.3)" }}>
                    {c.discountRate > 0 ? `${c.discountRate}%` : "—"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Số user mới + 5. Tỷ lệ hủy */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* User mới */}
        <div style={S.section}>
          <h3 style={S.sectionH}>👥 Số user mới (Khách hàng)</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#ffcc00" }}>{newCustomers}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>khách hàng mới</div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Tổng khách hàng: <strong style={{ color: "#ffcc00" }}>{users.filter(u => u.role === "customer").length}</strong>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Tổng owner: <strong style={{ color: "#00a0e9" }}>{users.filter(u => u.role === "owner").length}</strong>
          </div>
        </div>

        {/* Tỷ lệ hủy */}
        <div style={S.section}>
          <h3 style={S.sectionH}>❌ Tỷ lệ hủy booking</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#ff6b6b" }}>{cancelRate}%</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>tỷ lệ hủy</div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Đã hủy: <strong style={{ color: "#ff6b6b" }}>{cancelledCount}</strong> / {totalBookings} booking
          </div>
          <div style={{ marginTop: 16, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${cancelRate}%`, height: "100%", background: "linear-gradient(90deg, #ff6b6b, #ff4444)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Summary footer */}
      <div style={{ background: "rgba(0,200,100,0.06)", border: "1px solid rgba(0,200,100,0.15)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📌</span>
        <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
          Dữ liệu được lọc theo kỳ <strong style={{ color: "#00c864" }}>{PERIODS.find(p => p.key === period)?.label}</strong>.
          Tổng cộng: <strong>{totalBookings}</strong> booking, <strong>{totalRevenue.toLocaleString("vi-VN")}đ</strong> doanh thu,
          <strong> {newCustomers}</strong> khách hàng mới.
        </div>
      </div>
    </div>
  );
}

const S = {
  section: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "24px 26px" },
  sectionH: { fontSize: 16, fontWeight: 700, margin: "0 0 18px", color: "#fff", display: "flex", alignItems: "center", gap: 10 },
};
