import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'
import { DepartmentProvider } from '@/contexts/department-context'
import { SidebarContentComponent } from '@/components/sidebar-content'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <DepartmentProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader className="p-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
              </SidebarHeader>
              <SidebarContent>
                <SidebarContentComponent />
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </DepartmentProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
