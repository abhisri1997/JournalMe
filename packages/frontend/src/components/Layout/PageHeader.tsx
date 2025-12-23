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
    <div className='mb-6 flex items-center justify-between'>
      <h1 className='m-0 text-2xl font-semibold'>{title}</h1>
      {backButton && (
        <button
          onClick={() => navigate(backButton.to)}
          className='rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--text)] text-sm'
        >
          {backButton.label}
        </button>
      )}
    </div>
  );
}
