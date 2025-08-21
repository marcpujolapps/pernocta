import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Pernocta.cat - Tots els allotjaments legals de Catalunya",
  description:
    "Troba tots els allotjaments legals de Catalunya: cases rurals, apartaments turístics, hotels, càmpings i més. Verificats oficialment.",
  generator: "Pernocta.cat",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ca" className={dmSans.variable}>
      <body>{children}</body>
    </html>
  )
}
