import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GitHub Agent — AI Repository Analysis",
  description: "Detect bugs, vulnerabilities, architectural issues, and code quality problems automatically in any public GitHub repository.",
  keywords: ["github", "code analysis", "ai", "bug detection", "security", "code review"],
  openGraph: {
    title: "GitHub Agent — AI Repository Analysis",
    description: "Detect bugs, vulnerabilities, and code quality problems automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect fill='%236366f1' width='24' height='24' rx='6'/><path d='M13 10V3L4 14h7v7l9-11h-7z' fill='white'/></svg>" />
      </head>
      <body className="antialiased" style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
