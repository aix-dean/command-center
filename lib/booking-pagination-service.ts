import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Booking {
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

interface PaginationConfig {
  pageSize: number
  currentPage: number
}

interface BookingPaginationService {
  subscribeToPaginatedBookings(
    filterField: string,
    filterValue: any,
    config: PaginationConfig,
    onData: (bookings: Booking[], totalCount: number) => void,
    onError: (error: Error) => void
  ): () => void
  getTotalCount(filterField: string, filterValue: any): Promise<number>
}

export const bookingPaginationService: BookingPaginationService = {
  subscribeToPaginatedBookings(
    filterField: string,
    filterValue: any,
    config: PaginationConfig,
    onData: (bookings: Booking[], totalCount: number) => void,
    onError: (error: Error) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null
    
    const setupPagination = async () => {
      try {
        // Get total count first
        const totalCount = await this.getTotalCount(filterField, filterValue)
        
        // Set up real-time listener for booking collection
        const collectionPath = 'booking'
        console.log(`[Booking Pagination Service] Querying booking collection: ${collectionPath}`)
        console.log(`[Booking Pagination Service] Filter: ${filterField} == ${filterValue}`)
        
        const q = query(
          collection(db, collectionPath),
          where(filterField, "==", filterValue),
          where("created", ">=", new Date(0)) // Ensure we have a sortable field
        )

        unsubscribe = onSnapshot(q, async (querySnapshot) => {
          console.log(`[Booking Pagination Service] Snapshot received, found`, querySnapshot.size, "booking documents")

          // Convert documents to booking objects
          const allBookings: Booking[] = []
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data()
            allBookings.push({
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

          console.log(`[Booking Pagination Service] Found`, allBookings.length, "bookings")

          // Sort by created date (newest first)
          allBookings.sort((a, b) => {
            const dateA = a.created?.getTime() || 0
            const dateB = b.created?.getTime() || 0
            return dateB - dateA
          })

          // Apply pagination
          const paginatedBookings = applyPagination(allBookings, config)

          onData(paginatedBookings, totalCount)
        }, (error) => {
          console.error(`[Booking Pagination Service] onSnapshot error:`, error)
          onError(error)
        })
      } catch (error) {
        console.error(`[Booking Pagination Service] Error setting up pagination:`, error)
        onError(error as Error)
      }
    }

    setupPagination()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  },

  async getTotalCount(filterField: string, filterValue: any): Promise<number> {
    try {
      const bookingQuery = query(
        collection(db, 'booking'),
        where(filterField, "==", filterValue)
      )

      const bookingSnapshot = await getDocs(bookingQuery)
      
      return bookingSnapshot.size
    } catch (error) {
      console.error(`[Booking Pagination Service] Error getting total count:`, error)
      throw error
    }
  }
}

// Helper function to apply pagination
function applyPagination(items: Booking[], config: PaginationConfig): Booking[] {
  const { pageSize, currentPage } = config
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return items.slice(startIndex, endIndex)
}