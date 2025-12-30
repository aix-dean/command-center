'use client'

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useDepartment } from '@/contexts/department-context'
import { useAuth } from '@/contexts/auth-context'
import { menuConfig } from '@/lib/menu-config'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SidebarContentComponent() {
  const { department } = useDepartment()
  const { logout } = useAuth()
  const menuItems = menuConfig[department]
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    console.log('Starting logout process')
    try {
      await logout()
      console.log('Logout completed')
      router.push('/login')
      console.log('Navigation to /login initiated')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <SidebarMenu className="px-2 py-4 gap-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <SidebarMenuItem key={item.href} className="flex items-center justify-center">
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.href}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
      <SidebarMenuItem className="flex items-center justify-center mt-8">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}