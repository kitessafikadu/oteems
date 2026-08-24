import type { Metadata } from "next";

import { neueHaas } from "./fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "oteems",
  description: "Employee Management System for OTech Engineering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={neueHaas.variable}>{children}</body>
    </html>
  );
}
