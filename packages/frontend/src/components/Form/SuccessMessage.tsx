import React from "react";

interface SuccessMessageProps {
  message: string;
}

export default function SuccessMessage({ message }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div
      className='rounded-md bg-green-100 p-3 text-green-700 text-sm'
      role='status'
    >
      {message}
    </div>
  );
}
