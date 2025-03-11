import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/globals.css'
import { BootstrapClient } from './bootstrap'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mirror Match',
  description: 'Learn emotions through play',
  icons: {
    icon: '/globe.svg',
    shortcut: '/globe.svg',
    apple: '/globe.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BootstrapClient />
        {children}
      </body>
    </html>
  )
}
