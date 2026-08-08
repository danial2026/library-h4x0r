import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { SplashScreen } from "@/components/ui/SplashScreen";

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Library",
  description: "A curated library of technical books and references.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
