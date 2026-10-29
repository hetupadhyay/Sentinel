import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sentinel: check if a message is a scam",
  description: "Paste any message. Sentinel shows you what's wrong with it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--panel)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontFamily: "inherit",
              fontSize: "13px",
            },
            success: {
              iconTheme: { primary: "var(--risk-safe)", secondary: "var(--panel)" },
            },
            error: {
              iconTheme: { primary: "var(--risk-critical)", secondary: "var(--panel)" },
            },
          }}
        />
      </body>
    </html>
  );
}
