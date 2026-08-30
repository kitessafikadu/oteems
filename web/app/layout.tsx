import type { Metadata } from "next";
import { neueHaas } from "./fonts";
import "./globals.css";
import { UserProvider } from "@/components/user-provider";

export const metadata: Metadata = {
  title: "OTEEMS",
  description: "Employee Management System for OTech Engineering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={neueHaas.variable}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
