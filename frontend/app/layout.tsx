import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Provider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ // Add this block
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Optional: 'swap' ensures text is visible during font loading
});

export const metadata: Metadata = {
  title: "EChat",
  description: "EChat | Chating Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}  ${inter.variable}antialiased`}
      >
       <Providers>{children}</Providers>
      </body>
    </html>
  );
}
