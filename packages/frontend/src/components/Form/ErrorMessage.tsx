import React from "react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className='rounded-md bg-red-100 p-3 text-red-700 text-sm'
      role='alert'
    >
      {message}
    </div>
  );
}
