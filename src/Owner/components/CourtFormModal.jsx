import React, { useMemo, useState } from "react";
import ModalShell from "./ModalShell";
import { COURT_STATUS, COURT_TYPES, SURFACE_TYPES } from "../constants/ownerConstants";
import { ui } from "./OwnerUi";

const EMPTY_FORM = {
  name: "",
  courtType: "indoor",
  surfaceType: "cushion",
  status: "active",
  description: "",
};

export default function CourtFormModal({ initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [error, setError] = useState("");

  const title = useMemo(() => (initialData ? "Cập nhật sân" : "Thêm sân mới"), [initialData]);

  const handleSave = () => {
    if (!form.name.trim()) {
      setError("Tên sân là bắt buộc.");
      return;
    }

    if (form.name.trim().length < 2) {
      setError("Tên sân phải từ 2 ký tự.");
      return;
    }

    onSubmit(form);
  };

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      footer={(
        <>
          <button type="button" onClick={onClose} style={ui.button.secondary} className="ui-lift">Hủy</button>
          <button type="button" onClick={handleSave} style={ui.button.primary} className="ui-lift">Lưu</button>
        </>
      )}
    >
      <div style={styles.grid}>
        <Field label="Tên sân *">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={ui.input}
            placeholder="Ví dụ: Sân A1"
          />
        </Field>

        <Field label="Loại sân">
          <select value={form.courtType} onChange={(e) => setForm({ ...form, courtType: e.target.value })} style={ui.input}>
            {COURT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Mặt sân">
          <select value={form.surfaceType} onChange={(e) => setForm({ ...form, surfaceType: e.target.value })} style={ui.input}>
            {SURFACE_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Trạng thái">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={ui.input}>
            {COURT_STATUS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </Field>

        <div style={{ gridColumn: "1/-1" }}>
          <Field label="Mô tả">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...ui.input, resize: "vertical" }}
              placeholder="Mô tả ngắn về sân"
            />
          </Field>
        </div>
      </div>

      {error ? <p style={styles.error}>{error}</p> : null}
    </ModalShell>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "1fr 1fr",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 600,
  },
  error: {
    marginTop: 10,
    color: "#ff8f8f",
    fontSize: 13,
  },
};
