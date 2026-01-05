import React from "react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className='rounded-md bg-[var(--error)]/10 p-3 text-[var(--error)] text-sm'
      role='alert'
    >
      {message}
    </div>
  );
}
