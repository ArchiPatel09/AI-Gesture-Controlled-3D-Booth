import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Photo Booth",
  description: "Arrange your photos in beautiful 3D shapes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a1a] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}