import React from "react";
import ModalShell from "./ModalShell";
import { ui } from "./OwnerUi";

export default function DeleteCourtModal({ court, onClose, onConfirm }) {
  if (!court) {
    return null;
  }

  return (
    <ModalShell
      title="Xác nhận xóa sân"
      onClose={onClose}
      maxWidth={460}
      footer={(
        <>
          <button type="button" onClick={onClose} style={ui.button.secondary} className="ui-lift">Hủy</button>
          <button type="button" onClick={onConfirm} style={ui.button.danger} className="ui-lift">Xóa</button>
        </>
      )}
    >
      <p style={styles.text}>Bạn đang xóa sân <strong>{court.name}</strong>.</p>
      <p style={styles.subtext}>
        Nếu sân chưa có lịch đặt, hệ thống sẽ xóa cứng. Nếu sân đã có lịch đặt,
        hệ thống sẽ đổi trạng thái sang <strong>deleted</strong> để giữ lịch sử dữ liệu.
      </p>
    </ModalShell>
  );
}

const styles = {
  text: {
    margin: "0 0 8px",
    color: "var(--text-primary)",
    fontSize: 15,
  },
  subtext: {
    margin: 0,
    color: "var(--text-muted)",
    lineHeight: 1.5,
    fontSize: 14,
  },
};
