import { getFirestoreDb } from "./firebase"
import { collection, getDocs, query, orderBy, where, updateDoc, doc } from "firebase/firestore"

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

const BOOKINGS_COLLECTION = "booking"

// Get all bookings
export async function getBookings(): Promise<Booking[]> {
  try {
    if (typeof window === "undefined") {
      console.log("[v0] getBookings called on server side, returning empty array")
      return []
    }

    console.log("[v0] Getting Firestore database...")
    const db = getFirestoreDb()

    console.log("[v0] Creating query for bookings...")
    const q = query(collection(db, BOOKINGS_COLLECTION), where("for_censorship", "==", 0), orderBy("created", "desc"))

    console.log("[v0] Executing query...")
    const querySnapshot = await getDocs(q)
    const bookings: Booking[] = []
    console.log("[v0] Total documents found:", querySnapshot.size)

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data()
      console.log("[v0] Document:", { id: docSnapshot.id, data })
      bookings.push({
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

    console.log("[v0] Successfully fetched bookings:", bookings.length)
    return bookings
  } catch (error) {
    console.error("[v0] Error in getBookings:", error)
    return []
  }
}

// Approve a booking
export async function approveBooking(bookingId: string): Promise<void> {
  console.log("[v0] Approving booking:", bookingId)
  const db = getFirestoreDb()
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    for_censorship: 1,
    for_screening: 0,
  })
}

// Reject a booking
export async function rejectBooking(bookingId: string): Promise<void> {
  console.log("[v0] Rejecting booking:", bookingId)
  const db = getFirestoreDb()
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    for_censorship: 2,
  })
}
