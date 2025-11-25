"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Booking } from "@/lib/bookings"

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (booking: Omit<Booking, "id" | "createdAt">) => Promise<void>
  booking?: Booking
  mode: "create" | "edit"
}

export function BookingDialog({ open, onOpenChange, onSave, booking, mode }: BookingDialogProps) {
  const [bookingId, setBookingId] = useState(booking?.bookingId || "")
  const [startDate, setStartDate] = useState(booking?.startDate || "")
  const [endDate, setEndDate] = useState(booking?.endDate || "")
  const [content, setContent] = useState(booking?.content || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await onSave({ bookingId, startDate, endDate, content })
    setLoading(false)
    onOpenChange(false)
    // Reset form
    setBookingId("")
    setStartDate("")
    setEndDate("")
    setContent("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Booking" : "Edit Booking"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new booking to the system." : "Update the booking details."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bookingId">Booking ID</Label>
            <Input
              id="bookingId"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="BK-001"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Input
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conference Room A - Team Meeting"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
