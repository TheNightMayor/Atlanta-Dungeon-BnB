import type { Metadata } from "next";
import { Exo, Orbitron } from "next/font/google";

import Header from '@/components/Header/Header';
import "./globals.css";
import Footer from "@/components/Footer/Footer";
import ThemeProvider from "@/components/ThemeProvider/ThemeProvider";
import { NextAuthProvider } from "@/components/AuthProvider/AuthProvider";
import Toast from "@/components/Toast/Toast";

const exo = Exo({
  subsets: ['latin'],
  variable: "--font-exo",
  weight: ["100","300","500","700","900"],
  style: ["italic","normal"],
});
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: "--font-orbitron",
  weight: ["400","500","700","900"],
  style: ["normal"]
});

export const metadata: Metadata = {
  title: "Atlanta Dungeon BnB",
  description: "A stay suited to your particular tastes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" 
        crossOrigin="anonymous"
        />
      </head>
      <body className={`${exo.variable} ${orbitron.variable} antialiased`}>
        <NextAuthProvider>
        <ThemeProvider>
          <Toast />
        <main className="font-normal">
            <Header />
            {children}
            <Footer />
          </main>
        </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
