import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Golf Partner Hub",
  description: "CRM comercial para campo de golf — cuentas, promociones y seguimientos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${fraunces.variable} font-sans`}>{children}</body>
    </html>
  );
}
