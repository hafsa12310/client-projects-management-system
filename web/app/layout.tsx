import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Project Dashboard",
  description: "Client Project Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
