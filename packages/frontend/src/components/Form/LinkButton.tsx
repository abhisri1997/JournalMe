import React from "react";

interface LinkButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export default function LinkButton({ children, onClick }: LinkButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: "var(--primary, #007bff)",
        cursor: "pointer",
        textDecoration: "underline",
        padding: 0,
        font: "inherit",
      }}
    >
      {children}
    </button>
  );
}
