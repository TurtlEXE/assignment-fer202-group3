export const ui = {
  panel: {
    background: "var(--panel-bg)",
    border: "1px solid var(--panel-border)",
    borderRadius: 14,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    borderRadius: 10,
    color: "var(--input-text)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    primary: {
      padding: "10px 16px",
      background: "linear-gradient(135deg,#00c864,#00a0e9)",
      border: "none",
      borderRadius: 10,
      color: "#fff",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
    },
    secondary: {
      padding: "10px 16px",
      background: "var(--btn-ghost-bg)",
      border: "1px solid var(--btn-ghost-border)",
      borderRadius: 10,
      color: "var(--btn-ghost-text)",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
    },
    danger: {
      padding: "10px 16px",
      background: "rgba(255,86,86,0.2)",
      border: "1px solid rgba(255,86,86,0.35)",
      borderRadius: 10,
      color: "#ff8f8f",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
    },
  },
};

export const statusMap = {
  active: { label: "Hoạt động", color: "#00c864", bg: "rgba(0,200,100,0.15)" },
  inactive: { label: "Tạm đóng", color: "#ffcc00", bg: "rgba(255,204,0,0.15)" },
  maintenance: { label: "Bảo trì", color: "#00a0e9", bg: "rgba(0,160,233,0.15)" },
  deleted: { label: "Đã xóa", color: "#ff6b6b", bg: "rgba(255,107,107,0.15)" },
};
