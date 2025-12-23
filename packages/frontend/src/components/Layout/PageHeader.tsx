import React from "react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  backButton?: {
    label: string;
    to: string;
  };
}

export default function PageHeader({ title, backButton }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1 style={{ margin: 0 }}>{title}</h1>
      {backButton && (
        <button
          onClick={() => navigate(backButton.to)}
          style={{
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: "0.9rem",
          }}
        >
          {backButton.label}
        </button>
      )}
    </div>
  );
}
