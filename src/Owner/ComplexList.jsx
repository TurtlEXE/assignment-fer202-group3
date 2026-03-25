import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ownerService } from "../services/ownerService";
import { ui } from "./components/OwnerUi";

export default function ComplexList() {
  const user = useMemo(() => JSON.parse(localStorage.getItem("pb_user") || "{}"), []);

  const [loading, setLoading] = useState(true);
  const [complexes, setComplexes] = useState([]);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await ownerService.getMyComplexes(user);
      setComplexes(data);
    } catch (err) {
      setError("Không thể tải danh sách khu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <p style={styles.info}>Đang tải danh sách khu...</p>;
  }

  if (error) {
    return <p style={styles.error}>{error}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={styles.title}>Danh sách khu của owner</h2>
        <p style={styles.info}>Chọn khu để vào trang CRUD sân hoặc cấu hình giá.</p>
      </div>

      <div style={styles.grid}>
        {complexes.map((complex) => (
          <div key={complex.id} style={{ ...ui.panel, padding: 16 }} className="ui-lift">
            <h3 style={styles.complexName}>{complex.name}</h3>
            <p style={styles.address}>{complex.address}</p>
            <div style={styles.metaRow}>
              <span style={styles.metaBadge}>Mở cửa: {complex.openTime.slice(0, 5)} - {complex.closeTime.slice(0, 5)}</span>
              <span style={styles.metaBadge}>Giảm giá: {complex.discountRate || 0}%</span>
            </div>
            <div style={styles.actionRow}>
              <Link to={`/dashboard/complex/${complex.id}/courts`} style={styles.linkButton} className="ui-lift">CRUD sân</Link>
              <Link to={`/dashboard/complex/${complex.id}/pricing`} style={styles.linkButtonSecondary} className="ui-lift">Cấu hình giá</Link>
              <Link to={`/dashboard/schedule?complexId=${complex.id}`} style={styles.linkButtonSecondary} className="ui-lift">Xem lịch ngày</Link>
            </div>
          </div>
        ))}
      </div>

      {complexes.length === 0 ? <p style={styles.info}>Owner chưa có khu nào.</p> : null}
    </div>
  );
}

const styles = {
  title: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: 22,
    fontWeight: 800,
  },
  info: {
    margin: "6px 0 0",
    color: "var(--text-muted)",
    fontSize: 14,
  },
  error: {
    margin: 0,
    color: "#ff8f8f",
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 12,
  },
  complexName: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: 18,
    fontWeight: 700,
  },
  address: {
    margin: "8px 0 10px",
    color: "var(--text-muted)",
    fontSize: 13,
    lineHeight: 1.5,
  },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  metaBadge: {
    padding: "4px 8px",
    borderRadius: 8,
    background: "var(--btn-ghost-bg)",
    border: "1px solid var(--btn-ghost-border)",
    color: "var(--text-secondary)",
    fontSize: 12,
    fontWeight: 600,
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  linkButton: {
    textDecoration: "none",
    background: "linear-gradient(135deg,#00c864,#00a0e9)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
  },
  linkButtonSecondary: {
    textDecoration: "none",
    background: "var(--btn-ghost-bg)",
    border: "1px solid var(--btn-ghost-border)",
    color: "var(--btn-ghost-text)",
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
  },
};
