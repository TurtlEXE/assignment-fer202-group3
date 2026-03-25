import React from "react";

export default function ModalShell({ title, onClose, children, footer, maxWidth = 620 }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button type="button" onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div>{children}</div>
        {footer ? <div style={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "var(--bg-overlay)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    background: "var(--bg-surface-2)",
    border: "1px solid var(--panel-border)",
    borderRadius: 16,
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: 20,
    fontWeight: 800,
  },
  closeBtn: {
    border: "none",
    background: "var(--btn-ghost-bg)",
    color: "var(--btn-ghost-text)",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
  },
  footer: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
};
