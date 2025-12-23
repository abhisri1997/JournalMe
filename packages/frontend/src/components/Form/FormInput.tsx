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
        <label htmlFor={id} className='mb-1 block'>
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
        className={`w-full rounded-md border border-[var(--border)] px-3 py-2 text-[var(--text)] ${
          disabled
            ? "bg-[var(--card)] cursor-not-allowed opacity-60"
            : "bg-[var(--bg)] cursor-text"
        }`}
      />
      {helperText && (
        <small className='mt-1 block text-[var(--text-light)]'>
          {helperText}
        </small>
      )}
    </div>
  );
}
