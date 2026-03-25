import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ModalShell from "./components/ModalShell";
import PriceRuleFormModal from "./components/PriceRuleFormModal";
import { COURT_TYPES, DAY_TYPES } from "./constants/ownerConstants";
import { ownerService } from "../services/ownerService";
import { ui } from "./components/OwnerUi";

const dayTypeLabel = DAY_TYPES.reduce((acc, item) => {
	acc[item.value] = item.label;
	return acc;
}, {});

export default function PriceConfig() {
	const { complexId } = useParams();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [complex, setComplex] = useState(null);
	const [rules, setRules] = useState([]);
	const [formTarget, setFormTarget] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [filterCourtType, setFilterCourtType] = useState("all");
	const [filterDayType, setFilterDayType] = useState("all");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const loadData = useCallback(async () => {
		setLoading(true);
		setError("");

		try {
			const [complexData, ruleData] = await Promise.all([
				ownerService.getComplexById(complexId),
				ownerService.getPriceRulesByComplex(complexId),
			]);

			setComplex(complexData);
			setRules(ruleData);
		} catch (err) {
			setError("Không thể tải cấu hình giá.");
		} finally {
			setLoading(false);
		}
	}, [complexId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const sortedRules = useMemo(() => {
		const list = [...rules].sort((a, b) => {
			if (a.courtType !== b.courtType) {
				return a.courtType.localeCompare(b.courtType);
			}
			if (a.dayType !== b.dayType) {
				return a.dayType.localeCompare(b.dayType);
			}
			return a.startTime.localeCompare(b.startTime);
		});

		return list.filter((item) => {
			const byCourtType = filterCourtType === "all" || item.courtType === filterCourtType;
			const byDayType = filterDayType === "all" || item.dayType === filterDayType;
			return byCourtType && byDayType;
		});
	}, [rules, filterCourtType, filterDayType]);

	const handleCreate = async (payload) => {
		setSaving(true);
		setMessage("");
		setError("");

		try {
			const created = await ownerService.createPriceRule(complexId, payload);
			setRules((prev) => [...prev, created]);
			setFormTarget(null);
			setMessage("Thêm cấu hình giá thành công.");
		} catch (err) {
			setError("Thêm cấu hình giá thất bại.");
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
			const updated = await ownerService.updatePriceRule(formTarget.id, payload);
			setRules((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
			setFormTarget(null);
			setMessage("Cập nhật cấu hình giá thành công.");
		} catch (err) {
			setError("Cập nhật cấu hình giá thất bại.");
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
			await ownerService.deletePriceRule(deleteTarget.id);
			setRules((prev) => prev.filter((item) => item.id !== deleteTarget.id));
			setDeleteTarget(null);
			setMessage("Đã xóa cấu hình giá.");
		} catch (err) {
			setError("Xóa cấu hình giá thất bại.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <p style={styles.info}>Đang tải cấu hình giá...</p>;
	}

	if (!complex) {
		return <p style={styles.error}>Không tìm thấy khu. Vui lòng quay lại danh sách khu.</p>;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={styles.header}>
				<div>
					<h2 style={styles.title}>Cấu hình giá - {complex.name}</h2>
					<p style={styles.info}>Theo tổ hợp loại sân + loại ngày + khung giờ.</p>
				</div>
				<div style={styles.headerActions}>
					<Link to="/dashboard/complexes" style={styles.linkBtn} className="ui-lift">Danh sách khu</Link>
					<Link to={`/dashboard/complex/${complexId}/courts`} style={styles.linkBtn} className="ui-lift">CRUD sân</Link>
					<button type="button" style={ui.button.primary} className="ui-lift" onClick={() => setFormTarget({})} disabled={saving}>+ Thêm cấu hình</button>
				</div>
			</div>

			<div style={{ ...ui.panel, padding: 14 }}>
				<div style={styles.filterRow}>
					<select style={{ ...ui.input, maxWidth: 220 }} value={filterCourtType} onChange={(e) => setFilterCourtType(e.target.value)}>
						<option value="all">Tất cả loại sân</option>
						{COURT_TYPES.map((item) => (
							<option key={item.value} value={item.value}>{item.label}</option>
						))}
					</select>

					<select style={{ ...ui.input, maxWidth: 220 }} value={filterDayType} onChange={(e) => setFilterDayType(e.target.value)}>
						<option value="all">Tất cả loại ngày</option>
						{DAY_TYPES.map((item) => (
							<option key={item.value} value={item.value}>{item.label}</option>
						))}
					</select>
					<span style={styles.smallText}>Hiển thị {sortedRules.length}/{rules.length} dòng</span>
				</div>
			</div>

			<div style={{ ...ui.panel, padding: 14, overflowX: "auto" }}>
				<table style={styles.table}>
					<thead>
						<tr>
							<th style={styles.th}>#</th>
							<th style={styles.th}>Loại sân</th>
							<th style={styles.th}>Loại ngày</th>
							<th style={styles.th}>Khung giờ</th>
							<th style={styles.th}>Giá/giờ</th>
							<th style={styles.th}>Hiệu lực</th>
							<th style={styles.th}>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{sortedRules.map((rule, index) => (
							<tr key={rule.id} className="ui-row-hover">
								<td style={styles.td}>{index + 1}</td>
								<td style={styles.td}>{rule.courtType}</td>
								<td style={styles.td}>{dayTypeLabel[rule.dayType] || rule.dayType}</td>
								<td style={styles.td}>{rule.startTime.slice(0, 5)} - {rule.endTime.slice(0, 5)}</td>
								<td style={{ ...styles.td, color: "#00c864", fontWeight: 700 }}>{Number(rule.pricePerHour).toLocaleString("vi-VN")} đ</td>
								<td style={styles.td}>{rule.effectiveFrom} - {rule.effectiveTo || "Không thời hạn"}</td>
								<td style={styles.td}>
									<div style={styles.actions}>
										<button type="button" style={styles.editBtn} className="ui-lift" onClick={() => setFormTarget(rule)} disabled={saving}>Sửa</button>
										<button type="button" style={styles.deleteBtn} className="ui-lift" onClick={() => setDeleteTarget(rule)} disabled={saving}>Xóa</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{sortedRules.length === 0 ? <p style={{ ...styles.info, marginTop: 10 }}>Không có cấu hình giá theo bộ lọc.</p> : null}
			</div>

			{message ? <p style={styles.success}>{message}</p> : null}
			{error ? <p style={styles.error}>{error}</p> : null}

			{formTarget ? (
				<PriceRuleFormModal
					initialData={formTarget.id ? formTarget : null}
					rules={rules}
					onClose={() => setFormTarget(null)}
					onSubmit={formTarget.id ? handleUpdate : handleCreate}
				/>
			) : null}

			{deleteTarget ? (
				<ModalShell
					title="Xác nhận xóa cấu hình giá"
					onClose={() => setDeleteTarget(null)}
					maxWidth={460}
					footer={(
						<>
							<button type="button" style={ui.button.secondary} className="ui-lift" onClick={() => setDeleteTarget(null)}>Hủy</button>
							<button type="button" style={ui.button.danger} className="ui-lift" onClick={handleDelete}>Xóa</button>
						</>
					)}
				>
					<p style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>
						Xóa khung giá {deleteTarget.startTime.slice(0, 5)} - {deleteTarget.endTime.slice(0, 5)} ({deleteTarget.courtType}/{deleteTarget.dayType})?
					</p>
					<p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
						Hành động này sẽ xóa vĩnh viễn cấu hình giá khỏi hệ thống.
					</p>
				</ModalShell>
			) : null}
		</div>
	);
}

const styles = {
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
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
	filterRow: {
		display: "flex",
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
	},
	smallText: {
		color: "var(--text-muted)",
		fontSize: 13,
		fontWeight: 600,
	},
	table: {
		width: "100%",
		minWidth: 860,
		borderCollapse: "collapse",
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
