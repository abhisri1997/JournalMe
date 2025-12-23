import React from "react";

interface FormInputProps {
  id?: string;
  name?: string;
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
  autocomplete?: string;
  inputMode?:
    | "text"
    | "email"
    | "numeric"
    | "decimal"
    | "tel"
    | "search"
    | "url"
    | "none";
}

export default function FormInput({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  helperText,
  autocomplete,
  inputMode,
}: FormInputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} style={{ display: "block", marginBottom: 4 }}>
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autocomplete}
        inputMode={inputMode}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          backgroundColor: disabled ? "var(--card)" : "var(--bg)",
          color: "var(--text)",
          boxSizing: "border-box",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {helperText && (
        <small
          style={{
            display: "block",
            marginTop: 4,
            color: "var(--text-light)",
          }}
        >
          {helperText}
        </small>
      )}
    </div>
  );
}
