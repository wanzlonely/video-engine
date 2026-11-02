import React from "react";
import "./globals.css";

export const metadata = {
  title: "Video Compose Dashboard",
  description: "UI compose/preview untuk naskah video engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
