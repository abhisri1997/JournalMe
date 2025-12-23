import React from "react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      style={{
        padding: 12,
        backgroundColor: "#fee",
        color: "#c33",
        borderRadius: "4px",
        fontSize: 14,
      }}
      role='alert'
    >
      {message}
    </div>
  );
}
