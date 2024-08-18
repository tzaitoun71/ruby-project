'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import Navbar from './components/Navbar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <ConditionalNavbarWrapper>
            <main style={{ marginTop: '64px' }}> 
              {children}
            </main>
          </ConditionalNavbarWrapper>
        </UserProvider>
      </body>
    </html>
  );
}

// Helper component to conditionally render the Navbar
function ConditionalNavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the current path

  const showNavbar = pathname !== "/login"; // Hide Navbar on the sign-in page

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
