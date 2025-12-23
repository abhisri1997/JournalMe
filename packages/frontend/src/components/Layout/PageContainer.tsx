import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function PageContainer({
  children,
  maxWidth = 640,
}: PageContainerProps) {
  return (
    <main className='mx-auto px-6' style={{ maxWidth }}>
      {children}
    </main>
  );
}
