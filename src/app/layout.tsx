import './globals.css'
import type { ReactNode } from 'react'
import { Sidebar } from '@/components/ui/sidebar'
import { useState } from 'react'
import ClientLayout from './ClientLayout'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-muted">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
