import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Sentinel | Predictive Crowd Management & Bottleneck Early-Warning System",
  description: "Real-time pedestrian tracking, velocity-vector movement calculation, and sub-second predictive congestion forecasting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
