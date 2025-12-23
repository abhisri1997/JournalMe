import React from "react";

interface FormButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
}

export default function FormButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
}: FormButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return "#999";
    return variant === "primary" ? "#007bff" : "transparent";
  };

  const getBorderColor = () => {
    return variant === "secondary" ? "var(--border)" : "none";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 16px",
        backgroundColor: getBackgroundColor(),
        color: variant === "primary" ? "white" : "var(--text)",
        border: getBorderColor(),
        borderRadius: "4px",
        cursor: disabled ? "default" : "pointer",
        fontSize: 14,
        fontWeight: variant === "primary" ? 500 : 400,
      }}
    >
      {children}
    </button>
  );
}
