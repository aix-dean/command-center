import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

interface WishlistEntry {
  id: string
  user_id: string
  product_id: string
  AppName: string
  created: any
  deleted: boolean
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
}

interface WishlistUsersService {
  fetchUsersForProduct(
    product_id: string,
    appName: string
  ): Promise<User[]>
}

export const wishlistUsersService: WishlistUsersService = {
  async fetchUsersForProduct(product_id: string, appName: string): Promise<User[]> {
    try {
      console.log(`[Wishlist Users Service] Fetching users for product ${product_id} in ${appName}`)
      
      // Query wishlist collection for this product and app (case-insensitive)
      const wishlistQuery = query(
        collection(db, 'wishlist'),
        where("product_id", "==", product_id),
        where("deleted", "==", false)
      )

      const wishlistSnapshot = await getDocs(wishlistQuery)
      
      if (wishlistSnapshot.empty) {
        console.log(`[Wishlist Users Service] No wishlist entries found for product ${product_id}`)
        return []
      }

      // Filter documents by case-insensitive AppName
      const filteredDocs = wishlistSnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.AppName && data.AppName.toLowerCase() === appName.toLowerCase()
      })

      console.log(`[Wishlist Users Service] Found ${filteredDocs.length} wishlist entries for product ${product_id} in ${appName}`)

      if (filteredDocs.length === 0) {
        return []
      }

      // Extract unique user IDs
      const userIds = Array.from(new Set(
        filteredDocs.map(doc => doc.data().user_id)
      ))

      console.log(`[Wishlist Users Service] Found ${userIds.length} unique users for product ${product_id}`)

      // Determine which user collection to query based on app name
      const userCollectionName = appName.toLowerCase() === 'wedflix' ? 'wedflix_users' : 'mallflix_users'
      
      // Fetch user details in parallel
      const userPromises = userIds.map(async (userId) => {
        try {
          const userDoc = await getDoc(doc(db, userCollectionName, userId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            return {
              id: userId,
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              phoneNumber: userData.phoneNumber
            }
          } else {
            console.warn(`[Wishlist Users Service] User ${userId} not found in ${userCollectionName}`)
            return {
              id: userId,
              firstName: undefined,
              lastName: undefined,
              email: undefined,
              phoneNumber: undefined
            }
          }
        } catch (error) {
          console.error(`[Wishlist Users Service] Error fetching user ${userId}:`, error)
          return {
            id: userId,
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            phoneNumber: undefined
          }
        }
      })

      const users = await Promise.all(userPromises)
      
      // Filter out any failed fetches and return valid users
      const validUsers = users.filter(user => user !== null)
      
      console.log(`[Wishlist Users Service] Successfully fetched ${validUsers.length} users for product ${product_id}`)
      
      return validUsers
    } catch (error) {
      console.error(`[Wishlist Users Service] Error fetching users for product ${product_id}:`, error)
      throw error
    }
  }
}