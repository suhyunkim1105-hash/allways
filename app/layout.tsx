import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://allways-cyan.vercel.app"),
  title: {
    default: "AllWays — Accessible travel in Seoul",
    template: "%s",
  },
  description:
    "Barrier-free travel information for Gwanghwamun and Yongsan, Seoul. Steps, slopes, door widths and restrooms at 21 places, all measured on site by our team.",
  applicationName: "AllWays",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "AllWays — Accessible travel in Seoul",
    description:
      "Steps, slopes, door widths and restrooms at 21 places in Seoul, measured on site by our team.",
    type: "website",
    locale: "en_US",
    siteName: "AllWays",
  },
};

export const viewport: Viewport = { themeColor: "#0046FF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-aphont antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:font-bold focus:text-white">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
