import React from "react";

interface SuccessMessageProps {
  message: string;
}

export default function SuccessMessage({ message }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div
      className='rounded-md bg-[var(--success)]/10 p-3 text-[var(--success)] text-sm'
      role='status'
    >
      {message}
    </div>
  );
}
