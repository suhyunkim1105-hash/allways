import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AllWays — Accessible travel in Seoul",
  description: "Real, on-site surveyed accessibility info for travelers with reduced mobility. Gwanghwamun & Yongsan, Seoul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-aphont">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
