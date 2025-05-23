"use client"
import { useState } from 'react'
import { Sidebar } from '@/components/ui/sidebar'
import type { ReactNode } from 'react'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <div className="flex">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div className={"flex-1 min-h-screen transition-all duration-300 " + (sidebarCollapsed ? 'ml-20' : 'ml-64')}>
        {children}
      </div>
    </div>
  )
} 