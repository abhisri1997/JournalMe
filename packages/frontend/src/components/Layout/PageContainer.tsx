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
    <main style={{ padding: 24, maxWidth, margin: "0 auto" }}>{children}</main>
  );
}
