"use client"

import { SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'
import { DepartmentProvider } from '@/contexts/department-context'
import { SidebarContentComponent } from '@/components/sidebar-content'
import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  const shouldShowSidebar = user && !['/login', '/register'].includes(pathname)

  return (
    <DepartmentProvider>
      <SidebarProvider>
        {shouldShowSidebar && (
          <Sidebar>
            <SidebarHeader className="p-4">
              <h2 className="text-lg font-semibold">Navigation</h2>
            </SidebarHeader>
            <SidebarContent>
              <SidebarContentComponent />
            </SidebarContent>
          </Sidebar>
        )}
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DepartmentProvider>
  )
}

export { AppLayout }