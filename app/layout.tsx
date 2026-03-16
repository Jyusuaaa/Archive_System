import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script' // Import the Next.js Script component

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArchivePro | Records Management",
  description: "National Archives Standards System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* Replace your manual <head><script> with this */}
        <Script 
          src="https://cdn.tailwindcss.com" 
          strategy="beforeInteractive" 
        />
        <main className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </main>
      </body>
    </html>
  );
}