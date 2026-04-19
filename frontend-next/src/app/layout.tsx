import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SENTINEL — Fraud Detection Engine",
  description: "Advanced AI-powered fraud, phishing, and impersonation detection platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased font-sans`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--panel)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-inter), sans-serif",
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
