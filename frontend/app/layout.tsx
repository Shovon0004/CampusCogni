import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { LenisProvider } from "@/components/lenis-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CampusCogni - Campus Recruitment Platform",
  description: "Streamline campus recruitment with modern tools",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <LenisProvider />
          {children}
        </Providers>
      </body>
    </html>
  )
}
