import type { Metadata } from "next";
import { Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const grotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-text" });

export const metadata: Metadata = {
  title: "Sentinel: check if a message is a scam",
  description: "Paste a job offer, text, email, link or news story. Sentinel marks the exact words that look like fraud and tells you what to do next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${grotesk.variable} ${serif.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--panel)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-grotesk), sans-serif",
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
