'use client'

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { useDepartment } from '@/contexts/department-context'
import { menuConfig } from '@/lib/menu-config'
import Link from 'next/link'

export function SidebarContentComponent() {
  const { department } = useDepartment()
  const menuItems = menuConfig[department]

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild>
            <Link href={item.href}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}