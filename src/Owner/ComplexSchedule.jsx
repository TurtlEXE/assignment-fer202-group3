import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ownerService } from "../services/ownerService";
import { ui } from "./components/OwnerUi";
import ModalShell from "./components/ModalShell";

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHour = (time) => (time || "").slice(0, 5);
const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function ComplexSchedule() {
  const [searchParams] = useSearchParams();
  const user = useMemo(() => JSON.parse(localStorage.getItem("pb_user") || "{}"), []);

  const [loadingComplexes, setLoadingComplexes] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [complexes, setComplexes] = useState([]);
  const [selectedComplexId, setSelectedComplexId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => formatDateForInput(new Date()));
  const [scheduleData, setScheduleData] = useState(null);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [updatingBookingStatus, setUpdatingBookingStatus] = useState(false);

  const loadComplexes = useCallback(async () => {
    setLoadingComplexes(true);
    setError("");

    try {
      const myComplexes = await ownerService.getMyComplexes(user);
      setComplexes(myComplexes);

      if (myComplexes.length === 0) {
        setSelectedComplexId("");
        return;
      }

      const queryComplexId = searchParams.get("complexId");
      const hasQueryComplex = myComplexes.some((item) => item.id === queryComplexId);
      setSelectedComplexId(hasQueryComplex ? queryComplexId : myComplexes[0].id);
    } catch (err) {
      setError("Không thể tải danh sách facility.");
    } finally {
      setLoadingComplexes(false);
    }
  }, [searchParams, user]);

  const loadSchedule = useCallback(async () => {
    if (!selectedComplexId || !selectedDate) {
      setScheduleData(null);
      return;
    }

    setLoadingSchedule(true);
    setError("");

    try {
      const data = await ownerService.getComplexScheduleByDate(selectedComplexId, selectedDate);
      setScheduleData(data);
    } catch (err) {
      setError("Không thể tải timeline lịch sân theo ngày.");
      setScheduleData(null);
    } finally {
      setLoadingSchedule(false);
    }
  }, [selectedComplexId, selectedDate]);

  useEffect(() => {
    loadComplexes();
  }, [loadComplexes]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleOpenBookingDetail = async (scheduleItem) => {
    if (!scheduleItem?.bookingItemId) {
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const detail = await ownerService.getBookingDetailByItemId(scheduleItem.bookingItemId);
      if (!detail) {
        setBookingError("Không tìm thấy chi tiết booking cho ô đã chọn.");
        return;
      }

      setSelectedBooking(detail);
    } catch (err) {
      setBookingError("Không thể tải chi tiết booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedBooking?.booking?.id || selectedBooking.booking.status !== "paid") {
      return;
    }

    setUpdatingBookingStatus(true);
    setBookingError("");

    try {
      const updated = await ownerService.updateBookingStatus(selectedBooking.booking.id, "completed");
      setSelectedBooking((prev) => ({ ...prev, booking: { ...prev.booking, ...updated } }));
    } catch (err) {
      setBookingError("Cập nhật trạng thái booking thất bại.");
    } finally {
      setUpdatingBookingStatus(false);
    }
  };

  if (loadingComplexes) {
    return <p style={styles.info}>Đang tải danh sách facility...</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Lịch theo ngày của facility</h2>
          <p style={styles.info}>Xem timeline toàn bộ sân theo dạng ma trận: đỏ là đã đặt, trắng là còn trống.</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/dashboard/complexes" style={styles.linkBtn} className="ui-lift">Danh sách khu</Link>
        </div>
      </div>

      <div style={{ ...ui.panel, padding: 14 }}>
        <div style={styles.filters}>
          <div style={styles.filterItem}>
            <label style={styles.label}>Facility</label>
            <select
              style={ui.input}
              value={selectedComplexId}
              onChange={(event) => setSelectedComplexId(event.target.value)}
              disabled={complexes.length === 0 || loadingSchedule}
            >
              {complexes.length === 0 ? <option value="">Không có facility</option> : null}
              {complexes.map((complex) => (
                <option key={complex.id} value={complex.id}>
                  {complex.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.label}>Ngày</label>
            <input
              style={ui.input}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              disabled={!selectedComplexId || loadingSchedule}
            />
          </div>
        </div>
      </div>

      {error ? <p style={styles.error}>{error}</p> : null}

      {complexes.length === 0 ? <p style={styles.info}>Owner chưa có facility nào.</p> : null}

      {loadingSchedule ? <p style={styles.info}>Đang tải timeline theo ngày...</p> : null}

      {!loadingSchedule && scheduleData ? (
        <div style={{ ...ui.panel, padding: 14, overflowX: "auto" }}>
          <div style={styles.metaRow}>
            <span style={styles.metaBadge}>Facility: {scheduleData.complex.name}</span>
            <span style={styles.metaBadge}>Giờ mở cửa: {formatHour(scheduleData.complex.openTime)} - {formatHour(scheduleData.complex.closeTime)}</span>
            <span style={styles.metaBadge}>Slot type: {scheduleData.complex.slotType || "60min"}</span>
          </div>

          {scheduleData.courts.length === 0 ? (
            <p style={styles.info}>Facility chưa có sân để hiển thị timeline.</p>
          ) : scheduleData.slots.length === 0 ? (
            <p style={styles.info}>Không tìm thấy slot phù hợp trong giờ mở cửa của facility.</p>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, ...styles.stickyColumn }}>Sân / Khung giờ</th>
                    {scheduleData.slots.map((slot) => (
                      <th key={slot.id} style={styles.th}>
                        {formatHour(slot.slotStart)} - {formatHour(slot.slotEnd)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.courts.map((court) => (
                    <tr key={court.id}>
                      <td style={{ ...styles.td, ...styles.stickyColumn }}>
                        <div style={styles.courtName}>{court.name}</div>
                        <div style={styles.courtType}>{court.courtType}</div>
                      </td>
                      {scheduleData.slots.map((slot) => {
                        const slotKey = `${court.id}-${slot.id}`;
                        const isBooked = scheduleData.bookedKeys.has(slotKey);
                        const scheduleItem = scheduleData.bookedScheduleMap[slotKey];

                        return (
                          <td
                            key={slotKey}
                            className={isBooked ? "ui-lift" : undefined}
                            style={{ ...styles.slotCell, ...(isBooked ? styles.booked : styles.empty) }}
                            title={isBooked ? "Đã đặt - bấm để xem chi tiết booking" : "Còn trống"}
                            onClick={isBooked ? () => handleOpenBookingDetail(scheduleItem) : undefined}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.legend}>
                <div style={styles.legendItem}><span style={{ ...styles.dot, ...styles.booked }} />Đã đặt</div>
                <div style={styles.legendItem}><span style={{ ...styles.dot, ...styles.empty }} />Trống</div>
              </div>
            </>
          )}
        </div>
      ) : null}

      {bookingLoading ? <p style={styles.info}>Đang tải chi tiết booking...</p> : null}
      {bookingError ? <p style={styles.error}>{bookingError}</p> : null}

      {selectedBooking ? (
        <ModalShell
          title={`Chi tiết booking ${selectedBooking.booking.bookingCode}`}
          onClose={() => setSelectedBooking(null)}
          maxWidth={700}
          footer={(
            <>
              <button type="button" style={ui.button.secondary} onClick={() => setSelectedBooking(null)} className="ui-lift">Đóng</button>
              <button
                type="button"
                style={ui.button.primary}
                className="ui-lift"
                onClick={handleMarkCompleted}
                disabled={updatingBookingStatus || selectedBooking.booking.status !== "paid"}
              >
                {selectedBooking.booking.status === "paid" ? "Xác nhận đã chơi" : "Đã hoàn thành"}
              </button>
            </>
          )}
        >
          <div style={styles.detailGrid}>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Người đặt</span><strong style={styles.detailValue}>{selectedBooking.customer?.fullName || "Không rõ"}</strong></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Số điện thoại</span><strong style={styles.detailValue}>{selectedBooking.customer?.phone || "-"}</strong></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Sân</span><strong style={styles.detailValue}>{selectedBooking.court?.name || "-"}</strong></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Ngày</span><strong style={styles.detailValue}>{selectedBooking.bookingItem.date}</strong></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Trạng thái</span><strong style={styles.detailValue}>{selectedBooking.booking.status}</strong></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Thanh toán</span><strong style={styles.detailValue}>{selectedBooking.payment?.status || "-"}</strong></div>
          </div>

          <div style={{ ...ui.panel, padding: 12, marginTop: 12 }}>
            <p style={styles.slotTitle}>Các slot đã đặt</p>
            <div style={styles.slotWrap}>
              {selectedBooking.bookedSlots.length === 0
                ? <span style={styles.slotBadge}>Không có dữ liệu slot</span>
                : selectedBooking.bookedSlots.map((slot) => (
                  <span key={slot.id} style={styles.slotBadge}>{formatHour(slot.slotStart)} - {formatHour(slot.slotEnd)}</span>
                ))}
            </div>
          </div>

          <div style={styles.moneyRow}>
            <span>Tổng tiền booking:</span>
            <strong>{formatMoney(selectedBooking.booking.finalAmount)} đ</strong>
          </div>
        </ModalShell>
      ) : null}
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
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: "var(--text-subtle)",
    fontWeight: 600,
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
  headerActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10,
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
    border: "2px solid var(--slot-grid-border)",
  },
  th: {
    textAlign: "center",
    padding: "10px 8px",
    fontSize: 12,
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--slot-grid-border)",
    borderRight: "1px solid var(--slot-grid-border)",
    whiteSpace: "nowrap",
    background: "var(--bg-surface-2)",
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid var(--slot-grid-border)",
    borderRight: "1px solid var(--slot-grid-border)",
    color: "var(--text-secondary)",
  },
  stickyColumn: {
    position: "sticky",
    left: 0,
    background: "var(--bg-surface)",
    minWidth: 155,
    textAlign: "left",
    zIndex: 1,
  },
  courtName: {
    color: "var(--text-primary)",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  courtType: {
    color: "var(--text-subtle)",
    fontSize: 12,
    marginTop: 2,
  },
  slotCell: {
    width: 50,
    minWidth: 50,
    height: 34,
    border: "1px solid var(--slot-grid-border)",
    boxSizing: "border-box",
    cursor: "default",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  booked: {
    background: "var(--slot-booked-bg)",
    cursor: "pointer",
  },
  empty: {
    background: "var(--slot-empty-bg)",
  },
  legend: {
    marginTop: 10,
    display: "flex",
    gap: 18,
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--text-secondary)",
    fontSize: 12,
    fontWeight: 600,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    border: "1px solid rgba(0,0,0,0.2)",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "10px 12px",
    background: "var(--btn-ghost-bg)",
    border: "1px solid var(--btn-ghost-border)",
    borderRadius: 10,
  },
  detailLabel: {
    color: "var(--text-subtle)",
    fontSize: 12,
    fontWeight: 600,
  },
  detailValue: {
    color: "var(--text-primary)",
    fontSize: 14,
    fontWeight: 700,
  },
  slotTitle: {
    margin: "0 0 8px",
    color: "var(--text-secondary)",
    fontSize: 13,
    fontWeight: 700,
  },
  slotWrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  slotBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 20,
    border: "1px solid var(--btn-ghost-border)",
    background: "var(--bg-surface-2)",
    color: "var(--text-secondary)",
    fontSize: 12,
    fontWeight: 700,
  },
  moneyRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid var(--line-soft)",
    color: "var(--text-secondary)",
    fontSize: 14,
  },
};
