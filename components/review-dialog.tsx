"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { Booking } from "@/lib/bookings"
import { CheckCircle, XCircle } from "lucide-react"

interface ReviewDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (booking: Booking) => void
  onReject: (booking: Booking) => void
}

export function ReviewDialog({ booking, open, onOpenChange, onApprove, onReject }: ReviewDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  const handleApprove = async () => {
    if (!booking) return
    setIsProcessing(true)
    await onApprove(booking)
    setIsProcessing(false)
    setShowApproveConfirm(false)
    onOpenChange(false)
  }

  const handleReject = async () => {
    if (!booking) return
    setIsProcessing(true)
    await onReject(booking)
    setIsProcessing(false)
    setShowRejectConfirm(false)
    onOpenChange(false)
  }

  if (!booking) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Booking: {booking.bookingId}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <video src={booking.content} controls className="h-full w-full object-contain" preload="metadata">
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Start Date:</span>
                <span>{booking.start_date?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">End Date:</span>
                <span>{booking.end_date?.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setShowRejectConfirm(true)} disabled={isProcessing}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => setShowApproveConfirm(true)} disabled={isProcessing} className="text-white bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this booking? This action will set the censorship status to approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isProcessing} className="text-white bg-green-600 hover:bg-green-700">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this booking? This action will set the censorship status to rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-destructive text-white"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
