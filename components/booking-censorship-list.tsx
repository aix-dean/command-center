"use client"

import { useEffect, useState, useRef } from "react"
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getFilenameFromUrl } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ReviewDialog } from "@/components/review-dialog"
import { PaginationControls } from "@/components/pagination-controls"
import { bookingPaginationService } from "@/lib/booking-pagination-service"

export interface Booking {
  id?: string
  bookingId: string
  start_date: Date
  end_date: Date
  content: string
  total_cost: number
  created?: Date
  for_censorship?: number
  status?: string
}

interface BookingCensorshipListProps {
  filterField: string
  filterValue: any
  title: string
}

export default function BookingCensorshipList({ filterField, filterValue, title }: BookingCensorshipListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const firstLoadRef = useRef(true)
  const { toast } = useToast()

  const pageSize = 10

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn("Could not play notification sound:", error)
    }
  }

  const updatePagination = (newPage: number) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    setLoading(true)
    
    const unsubscribe = bookingPaginationService.subscribeToPaginatedBookings(
      filterField,
      filterValue,
      {
        pageSize,
        currentPage
      },
      (paginatedBookings, total) => {
        setBookings(paginatedBookings)
        setTotalCount(total)
        setTotalPages(Math.ceil(total / pageSize))
        setLoading(false)

        // Handle real-time changes (skip on first load)
        if (!firstLoadRef.current) {
          console.log(`[${title}] Processing docChanges...`)
          // Note: For pagination, we might want to refresh the current page
          // or handle new bookings differently to maintain pagination state
        } else {
          console.log(`[${title}] First load, skipping notifications`)
          firstLoadRef.current = false
        }
      },
      (error) => {
        console.error(`[${title}] onSnapshot error:`, error)
        if (error.message.includes('unavailable')) {
          toast({
            title: "Connection Issue",
            description: "You're currently offline. Changes will sync when connection is restored.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error Loading Bookings",
            description: "Failed to load bookings. Please try refreshing the page.",
            variant: "destructive",
          })
        }
        setLoading(false)
      }
    )

    return unsubscribe
  }, [filterField, filterValue, title, toast, currentPage])

  const handleApprove = async (booking: Booking) => {
    if (!booking.id) return

    try {
      console.log(`[${title}] Approving booking:`, booking.id)
      const docPath = `booking/${booking.id}`
      await updateDoc(doc(db, docPath), {
        for_censorship: 1,
        for_screening: 0,
      })
      toast({
        title: "Booking Approved",
        description: `Booking ${booking.bookingId} has been approved.`,
      })
    } catch (error) {
      console.error(`[${title}] Error approving booking:`, error)
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (booking: Booking) => {
    if (!booking.id) return

    try {
      console.log(`[${title}] Rejecting booking:`, booking.id)
      const docPath = `booking/${booking.id}`
      await updateDoc(doc(db, docPath), {
        for_censorship: 2,
      })
      toast({
        title: "Booking Rejected",
        description: `Booking ${booking.bookingId} has been rejected.`,
      })
    } catch (error) {
      console.error(`[${title}] Error rejecting booking:`, error)
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive",
      })
    }
  }

  const handleReviewClick = (booking: Booking) => {
    setReviewingBooking(booking)
    setReviewDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">
            {totalCount} booking{totalCount !== 1 ? 's' : ''} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No bookings found for review.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Booking ID</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="min-w-[200px]">Content</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.bookingId}</TableCell>
                      <TableCell>{booking.start_date?.toLocaleDateString()}</TableCell>
                      <TableCell>{booking.end_date?.toLocaleDateString()}</TableCell>
                      <TableCell className="truncate max-w-xs" title={booking.content}>
                        {getFilenameFromUrl(booking.content)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleReviewClick(booking)}>Review</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={updatePagination}
              isLoading={loading}
            />
          </>
        )}
      </CardContent>

      <ReviewDialog
        booking={reviewingBooking}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Card>
  )
}