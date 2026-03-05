import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: "3D Photo Booth",
  description: "Arrange your photos in beautiful 3D shapes with gesture controls",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: prevents mismatch warning when browser
    // extensions (like Grammarly) modify the <body> tag before React hydrates
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body suppressHydrationWarning>
        {/* ThemeProvider wraps everything so any component can access theme */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}