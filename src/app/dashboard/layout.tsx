import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './dashboard.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
})

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hiryze Mission Control',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${display.variable} ${inter.className} hmc-root`}>{children}</div>
}
