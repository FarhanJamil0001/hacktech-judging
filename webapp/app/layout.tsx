import type { Metadata } from "next";
import { Oxanium, Work_Sans } from "next/font/google";
import "../styles/globals.css";
import { Navbar } from "@/components/Navbar";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oxanium",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HackTech Judging Expo",
  description:
    "Find your project number, judging table, and pitch time for HackTech by Caltech.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oxanium.variable} ${workSans.variable}`}>
      <body className="bg-htech-bg text-htech-text">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>
        <footer className="border-t border-htech-orange-border/40 py-8 text-center text-sm text-htech-text-muted no-print">
          HackTech Judging Expo · built for HackTech by Caltech
        </footer>
      </body>
    </html>
  );
}
