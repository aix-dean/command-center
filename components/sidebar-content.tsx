'use client'

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { useDepartment } from '@/contexts/department-context'
import { menuConfig } from '@/lib/menu-config'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarContentComponent() {
  const { department } = useDepartment()
  const menuItems = menuConfig[department]
  const pathname = usePathname()

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
    </SidebarMenu>
  )
}