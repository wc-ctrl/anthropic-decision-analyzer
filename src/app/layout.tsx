import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claudeswitz v1.3",
  description: "AI-powered decision analysis platform for strategic planning and consequence analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
