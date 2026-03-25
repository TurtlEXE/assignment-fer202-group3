import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourtFormModal from "./components/CourtFormModal";
import DeleteCourtModal from "./components/DeleteCourtModal";
import { ownerService } from "../services/ownerService";
import { statusMap, ui } from "./components/OwnerUi";

export default function CourtList() {
  const { complexId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [complex, setComplex] = useState(null);
  const [courts, setCourts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [complexData, courtData] = await Promise.all([
        ownerService.getComplexById(complexId),
        ownerService.getCourtsByComplex(complexId),
      ]);

      setComplex(complexData);
      setCourts(courtData);
    } catch (err) {
      setError("Không thể tải dữ liệu sân của khu.");
    } finally {
      setLoading(false);
    }
  }, [complexId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const byStatus = statusFilter === "all" || court.status === statusFilter;
      const byText =
        !search ||
        court.name.toLowerCase().includes(search.toLowerCase()) ||
        (court.description || "").toLowerCase().includes(search.toLowerCase());

      return byStatus && byText;
    });
  }, [courts, statusFilter, search]);

  const summary = useMemo(() => {
    return {
      total: courts.length,
      active: courts.filter((item) => item.status === "active").length,
      maintenance: courts.filter((item) => item.status === "maintenance").length,
      deleted: courts.filter((item) => item.status === "deleted").length,
    };
  }, [courts]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const created = await ownerService.createCourt(complexId, payload);
      setCourts((prev) => [created, ...prev]);
      setFormTarget(null);
      setMessage("Thêm sân thành công.");
    } catch (err) {
      setError("Thêm sân thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!formTarget?.id) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await ownerService.updateCourt(formTarget.id, payload);
      setCourts((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setFormTarget(null);
      setMessage("Cập nhật sân thành công.");
    } catch (err) {
      setError("Cập nhật sân thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const result = await ownerService.deleteCourt(deleteTarget.id);

      if (result.mode === "hard") {
        setCourts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setMessage("Sân chưa có người đặt nên đã xóa cứng.");
      } else {
        setCourts((prev) => prev.map((item) => (item.id === deleteTarget.id ? { ...item, status: "deleted" } : item)));
        setMessage("Sân đã từng có người đặt nên đã chuyển trạng thái thành deleted.");
      }

      setDeleteTarget(null);
    } catch (err) {
      setError("Xóa sân thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={styles.info}>Đang tải dữ liệu sân...</p>;
  }

  if (!complex) {
    return <p style={styles.error}>Không tìm thấy khu. Vui lòng quay lại danh sách khu.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>CRUD sân - {complex.name}</h2>
          <p style={styles.info}>Quản lý sân theo khu, dữ liệu dùng API từ json-server.</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/dashboard/complexes" style={styles.linkBtn} className="ui-lift">Danh sách khu</Link>
          <Link to={`/dashboard/complex/${complexId}/pricing`} style={styles.linkBtn} className="ui-lift">Cấu hình giá</Link>
          <button type="button" style={ui.button.primary} className="ui-lift" onClick={() => setFormTarget({})} disabled={saving}>+ Thêm sân</button>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <SummaryCard label="Tổng sân" value={summary.total} color="#00a0e9" />
        <SummaryCard label="Hoạt động" value={summary.active} color="#00c864" />
        <SummaryCard label="Bảo trì" value={summary.maintenance} color="#ffcc00" />
        <SummaryCard label="Đã xóa" value={summary.deleted} color="#ff6b6b" />
      </div>

      <div style={{ ...ui.panel, padding: 14 }}>
        <div style={styles.toolbar}>
          <input style={{ ...ui.input, flex: 1 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mô tả sân" />
          <select style={{ ...ui.input, width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm đóng</option>
            <option value="maintenance">Bảo trì</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </div>

        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Tên sân</th>
              <th style={styles.th}>Loại sân</th>
              <th style={styles.th}>Mặt sân</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Ngày tạo</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourts.map((court, index) => {
              const status = statusMap[court.status] || statusMap.inactive;
              return (
                <tr key={court.id} className="ui-row-hover">
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <div style={{ color: "var(--text-primary)", fontWeight: 700 }}>{court.name}</div>
                    <div style={styles.subtext}>{court.description || "Không có mô tả"}</div>
                  </td>
                  <td style={styles.td}>{court.courtType}</td>
                  <td style={styles.td}>{court.surfaceType}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, color: status.color, background: status.bg }}>{status.label}</span>
                  </td>
                  <td style={styles.td}>{new Date(court.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button type="button" style={styles.editBtn} className="ui-lift" onClick={() => setFormTarget(court)} disabled={saving}>Sửa</button>
                      <button type="button" style={styles.deleteBtn} className="ui-lift" onClick={() => setDeleteTarget(court)} disabled={saving || court.status === "deleted"}>Xóa</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>

        {filteredCourts.length === 0 ? <p style={{ ...styles.info, marginTop: 10 }}>Không có sân nào phù hợp bộ lọc.</p> : null}
      </div>

      {message ? <p style={styles.success}>{message}</p> : null}
      {error ? <p style={styles.error}>{error}</p> : null}

      {formTarget ? (
        <CourtFormModal
          initialData={formTarget.id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSubmit={formTarget.id ? handleUpdate : handleCreate}
        />
      ) : null}

      {deleteTarget ? <DeleteCourtModal court={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} /> : null}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ ...ui.panel, padding: "14px 16px" }}>
      <div style={{ color, fontSize: 24, fontWeight: 900 }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{label}</div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
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
  success: {
    margin: 0,
    color: "#79e7aa",
    fontSize: 14,
  },
  headerActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  linkBtn: {
    textDecoration: "none",
    background: "var(--btn-ghost-bg)",
    border: "1px solid var(--btn-ghost-border)",
    color: "var(--btn-ghost-text)",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  toolbar: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 780,
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    color: "var(--text-subtle)",
    borderBottom: "1px solid var(--line-soft)",
  },
  td: {
    padding: "12px 10px",
    fontSize: 14,
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--line-subtle)",
    verticalAlign: "top",
  },
  subtext: {
    marginTop: 4,
    color: "var(--text-subtle)",
    fontSize: 12,
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  editBtn: {
    padding: "6px 10px",
    border: "1px solid rgba(0,160,233,0.4)",
    background: "rgba(0,160,233,0.15)",
    color: "#00a0e9",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },
  deleteBtn: {
    padding: "6px 10px",
    border: "1px solid rgba(255,107,107,0.4)",
    background: "rgba(255,107,107,0.15)",
    color: "#ff8f8f",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },
};