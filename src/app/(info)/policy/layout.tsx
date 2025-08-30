// src/app/policy/layout.tsx
import React from "react";

// This layout is now handled by the parent (info) layout.
// We keep this file to demonstrate the structure, but it's empty.
export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
