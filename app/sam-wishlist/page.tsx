"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WishlistList from "@/components/wishlist-list"

export default function SAMWishlist() {
  return (
    <SidebarInset>
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">Wishlist Management</h1>
          </div>

          <Tabs defaultValue="wedflix" className="space-y-4">
            <TabsList>
              <TabsTrigger value="wedflix">Wedflix</TabsTrigger>
              <TabsTrigger value="mallflix">Mallflix</TabsTrigger>
            </TabsList>

            <TabsContent value="wedflix">
              <WishlistList
                appName="Wedflix"
                title="Wedflix Wishlist"
              />
            </TabsContent>

            <TabsContent value="mallflix">
              <WishlistList
                appName="Mallflix"
                title="Mallflix Wishlist"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </SidebarInset>
  )
}