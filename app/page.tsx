"use client"

import { useEffect, useState, useRef } from "react"
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  getFirestore,
  collection,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
  onSnapshot,
  type Firestore,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset } from "@/components/ui/sidebar"
import { getFilenameFromUrl } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ReviewDialog } from "@/components/review-dialog"

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

export default function CommandCenter() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const dbRef = useRef<Firestore | null>(null)
  const firstLoadRef = useRef(true)
  const { toast } = useToast()

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

  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        // Validate environment variables
        const requiredEnvVars = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        }

        console.log("[v0] Checking environment variables...")
        const missingVars = Object.entries(requiredEnvVars)
          .filter(([_, value]) => !value)
          .map(([key]) => key)

        if (missingVars.length > 0) {
          console.error("[v0] Missing environment variables:", missingVars)
          toast({
            title: "Configuration Error",
            description: `Missing Firebase environment variables: ${missingVars.join(", ")}. Please add them in the Vars section.`,
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        console.log("[v0] All environment variables present")
        console.log("[v0] Starting Firebase initialization...")

        // Add a small delay to ensure browser environment is fully ready
        await new Promise((resolve) => setTimeout(resolve, 100))

        const firebaseConfig = {
          apiKey: requiredEnvVars.apiKey!,
          authDomain: requiredEnvVars.authDomain!,
          projectId: requiredEnvVars.projectId!,
          storageBucket: requiredEnvVars.storageBucket!,
          messagingSenderId: requiredEnvVars.messagingSenderId!,
          appId: requiredEnvVars.appId!,
        }

        // Initialize Firebase
        let app: FirebaseApp
        if (getApps().length === 0) {
          console.log("[v0] Creating new Firebase app...")
          app = initializeApp(firebaseConfig)
          console.log("[v0] Firebase app created")
        } else {
          console.log("[v0] Using existing Firebase app")
          app = getApps()[0]
        }

        // Add another delay before getting Firestore
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Get Firestore instance
        console.log("[v0] Getting Firestore instance...")
        dbRef.current = getFirestore(app)
        console.log("[v0] Firestore instance obtained")

        // Set up real-time listener for bookings
        const q = query(
          collection(dbRef.current, "booking"),
          where("for_censorship", "==", 0),
          orderBy("created", "desc"),
        )

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log("[v0] Snapshot received, found", querySnapshot.size, "documents")

          const fetchedBookings: Booking[] = []
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data()
            fetchedBookings.push({
              id: docSnapshot.id,
              bookingId: data.reservation_id || docSnapshot.id,
              start_date: data.start_date?.toDate(),
              end_date: data.end_date?.toDate(),
              content: data.url,
              created: data.created?.toDate(),
              for_censorship: data.for_censorship,
              total_cost: data.total_cost,
              status: data.status,
            })
          })

          setBookings(fetchedBookings)
          setLoading(false)

          // Handle real-time changes (skip on first load)
          console.log("[v0] firstLoadRef.current:", firstLoadRef.current)
          if (!firstLoadRef.current) {
            console.log("[v0] Processing docChanges...")
            querySnapshot.docChanges().forEach((change) => {
              const bookingData = change.doc.data()
              const bookingId = bookingData.reservation_id || change.doc.id

              console.log("[v0] Document change:", change.type, "for booking:", bookingId)

              if (change.type === 'added') {
                console.log("[v0] Showing toast for new booking")
                toast({
                  title: "New Booking Received",
                  description: `Booking ${bookingId} is ready for review.`,
                })
                playNotificationSound()
              } else if (change.type === 'modified') {
                console.log("[v0] Showing toast for updated booking")
                toast({
                  title: "Booking Updated",
                  description: `Booking ${bookingId} has been updated.`,
                })
              }
            })
          } else {
            console.log("[v0] First load, skipping notifications")
            firstLoadRef.current = false
          }
        })

        return unsubscribe
      } catch (error) {
        console.error("[v0] Initialization error:", error)
        toast({
          title: "Firebase Error",
          description: error instanceof Error ? error.message : "Failed to initialize Firebase",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    initializeAndFetch()
  }, [])


  const handleApprove = async (booking: Booking) => {
    if (!dbRef.current || !booking.id) return

    try {
      console.log("[v0] Approving booking:", booking.id)
      await updateDoc(doc(dbRef.current, "booking", booking.id), {
        for_censorship: 1,
        for_screening: 0,
      })
      toast({
        title: "Booking Approved",
        description: `Booking ${booking.bookingId} has been approved.`,
      })
    } catch (error) {
      console.error("[v0] Error approving booking:", error)
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (booking: Booking) => {
    if (!dbRef.current || !booking.id) return

    try {
      console.log("[v0] Rejecting booking:", booking.id)
      await updateDoc(doc(dbRef.current, "booking", booking.id), {
        for_censorship: 2,
      })
      toast({
        title: "Booking Rejected",
        description: `Booking ${booking.bookingId} has been rejected.`,
      })
    } catch (error) {
      console.error("[v0] Error rejecting booking:", error)
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
    <SidebarInset>
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">Command Center</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Censorship</CardTitle>
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
              )}
            </CardContent>
          </Card>
        </div>

        <ReviewDialog
          booking={reviewingBooking}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </main>
    </SidebarInset>
  )
}
