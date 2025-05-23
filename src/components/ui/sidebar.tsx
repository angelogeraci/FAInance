'use client'

import { Home, CreditCard, BarChart, Users, Building2, Settings, Euro, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const menu = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Trésorerie', href: '/tresorerie', icon: CreditCard },
  { label: 'Coûts', href: '/couts', icon: Euro },
  { label: 'Revenus', href: '/revenus', icon: BarChart },
  { label: 'Utilisateurs', href: '/utilisateurs', icon: Users },
  { label: 'Sociétés', href: '/societes', icon: Building2 },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
]

export function Sidebar({ className, onCollapse }: { className?: string, onCollapse?: (collapsed: boolean) => void }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  function handleCollapse() {
    setCollapsed(c => {
      const next = !c
      onCollapse?.(next)
      return next
    })
  }

  return (
    <aside className={cn(
      'h-screen bg-white border-r flex flex-col py-6 px-4 fixed top-0 left-0 z-30 transition-all duration-300',
      collapsed ? 'w-20' : 'w-64',
      className
    )}>
      <div className={'mb-8 flex items-center px-2 relative'}>
        <span className={'font-bold text-xl tracking-tight transition-all duration-300 text-center ' + (collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto')}>FAInance</span>
        <button
          className={'rounded p-1 hover:bg-muted transition-colors ml-2 flex-shrink-0 ' + (collapsed ? 'absolute right-2 top-1/2 -translate-y-1/2 z-10' : '')}
          onClick={handleCollapse}
          title={collapsed ? 'Déplier' : 'Réduire'}
          style={{ minWidth: 0 }}
        >
          {collapsed ? (
            <ChevronRight className='w-5 h-5' />
          ) : (
            <ChevronLeft className='w-5 h-5' />
          )}
        </button>
      </div>
      <nav className='flex-1'>
        <ul className='space-y-2'>
          {menu.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md transition-all font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed ? 'justify-center items-center h-10 w-10 mx-auto gap-0 px-0' : 'gap-3',
                  pathname === href ? 'bg-primary/10 text-primary font-bold' : ''
                )}
                style={{ minWidth: 0 }}
              >
                <Icon className='w-5 h-5' />
                <span className={'transition-all duration-300 ' + (collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto')}>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={'mt-8 text-xs text-muted-foreground px-2 transition-all duration-300 ' + (collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto')}>
        &copy; {new Date().getFullYear()} FAInance
      </div>
    </aside>
  )
} 