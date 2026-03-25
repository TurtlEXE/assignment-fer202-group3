import React, { useMemo, useState } from "react";
import ModalShell from "./ModalShell";
import { COURT_TYPES, DAY_TYPES } from "../constants/ownerConstants";
import { ui } from "./OwnerUi";

const EMPTY = {
  courtType: "indoor",
  dayType: "weekday",
  startTime: "06:00:00",
  endTime: "07:00:00",
  pricePerHour: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
};

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const isOverlap = (aStart, aEnd, bStart, bEnd) => {
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
};

export default function PriceRuleFormModal({ initialData, rules, onClose, onSubmit }) {
  const [form, setForm] = useState(initialData || EMPTY);
  const [error, setError] = useState("");

  const title = useMemo(() => (initialData ? "Cập nhật cấu hình giá" : "Thêm cấu hình giá"), [initialData]);

  const validate = () => {
    const start = toMinutes(form.startTime);
    const end = toMinutes(form.endTime);

    if (start >= end) {
      return "Khung giờ không hợp lệ.";
    }

    if (!form.pricePerHour || Number(form.pricePerHour) <= 0) {
      return "Giá tiền phải lớn hơn 0.";
    }

    const duplicated = rules.find((item) => {
      if (initialData && item.id === initialData.id) {
        return false;
      }

      if (item.courtType !== form.courtType || item.dayType !== form.dayType) {
        return false;
      }

      return isOverlap(start, end, toMinutes(item.startTime), toMinutes(item.endTime));
    });

    if (duplicated) {
      return "Khung giờ bị trùng với cấu hình giá khác.";
    }

    return "";
  };

  const handleSave = () => {
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }

    onSubmit({
      ...form,
      pricePerHour: Number(form.pricePerHour),
    });
  };

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      maxWidth={680}
      footer={(
        <>
          <button type="button" onClick={onClose} style={ui.button.secondary} className="ui-lift">Hủy</button>
          <button type="button" onClick={handleSave} style={ui.button.primary} className="ui-lift">Lưu</button>
        </>
      )}
    >
      <div style={styles.grid}>
        <Field label="Loại sân">
          <select value={form.courtType} onChange={(e) => setForm({ ...form, courtType: e.target.value })} style={ui.input}>
            {COURT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Loại ngày">
          <select value={form.dayType} onChange={(e) => setForm({ ...form, dayType: e.target.value })} style={ui.input}>
            {DAY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Giờ bắt đầu">
          <input
            type="time"
            value={form.startTime.slice(0, 5)}
            onChange={(e) => setForm({ ...form, startTime: `${e.target.value}:00` })}
            style={ui.input}
          />
        </Field>

        <Field label="Giờ kết thúc">
          <input
            type="time"
            value={form.endTime.slice(0, 5)}
            onChange={(e) => setForm({ ...form, endTime: `${e.target.value}:00` })}
            style={ui.input}
          />
        </Field>

        <Field label="Giá/giờ (VNĐ)">
          <input
            type="number"
            value={form.pricePerHour}
            onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
            style={ui.input}
            placeholder="Ví dụ: 150000"
          />
        </Field>

        <Field label="Hiệu lực từ ngày">
          <input
            type="date"
            value={form.effectiveFrom}
            onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
            style={ui.input}
          />
        </Field>

        <div style={{ gridColumn: "1/-1" }}>
          <Field label="Hiệu lực đến ngày (có thể để trống)">
            <input
              type="date"
              value={form.effectiveTo || ""}
              onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
              style={ui.input}
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
