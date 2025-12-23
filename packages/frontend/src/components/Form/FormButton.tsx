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
  const baseClasses =
    "rounded-md px-4 py-2 text-sm font-medium transition-colors";
  const variantClasses =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border border-[var(--border)] bg-transparent text-[var(--text)]";
  const disabledClasses = disabled
    ? "cursor-not-allowed opacity-60 hover:bg-blue-600"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
    >
      {children}
    </button>
  );
}
