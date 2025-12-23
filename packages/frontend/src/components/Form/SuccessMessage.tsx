import React from "react";

interface SuccessMessageProps {
  message: string;
}

export default function SuccessMessage({ message }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div
      style={{
        padding: 12,
        backgroundColor: "#efe",
        color: "#3c3",
        borderRadius: "4px",
        fontSize: 14,
      }}
      role='status'
    >
      {message}
    </div>
  );
}
