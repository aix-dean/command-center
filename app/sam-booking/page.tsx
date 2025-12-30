"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import BookingCensorshipList from "@/components/booking-censorship-list"

export default function SAMDepartment() {

  return (
    <SidebarInset>
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">SAM Department</h1>
          </div>

          <BookingCensorshipList
                   filterField="for_censorship"
                   filterValue={0}
                   title="Booking Censorship"
                 />
        </div>
      </main>
    </SidebarInset>
  )
}