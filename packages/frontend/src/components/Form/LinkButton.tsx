import React from "react";

interface LinkButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export default function LinkButton({ children, onClick }: LinkButtonProps) {
  return (
    <button
      onClick={onClick}
      className='bg-transparent text-[var(--primary,#007bff)] underline cursor-pointer p-0 border-0'
    >
      {children}
    </button>
  );
}
