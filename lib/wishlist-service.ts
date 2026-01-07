import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface WishlistEntry {
  id: string
  user_id: string
  product_id: string
  AppName: string
  created: any
  deleted: boolean
}

interface Product {
  id: string
  name: string
  image: string
  priority: number
  location?: string
}

interface GroupedWishlistItem {
  product_id: string
  userCount: number
  product: Product | null
}

interface WishlistService {
  subscribeToWishlist(
    appName: string,
    onData: (items: GroupedWishlistItem[]) => void,
    onError: (error: Error) => void
  ): () => void
}

export const wishlistService: WishlistService = {
  subscribeToWishlist(appName: string, onData: (items: GroupedWishlistItem[]) => void, onError: (error: Error) => void) {
    // Set up real-time listener for wishlist collection
    const collectionPath = 'wishlist'
    console.log(`[Wishlist Service] Querying wishlist collection: ${collectionPath}`)
    console.log(`[Wishlist Service] Filter: AppName == ${appName} (case-insensitive), deleted == false`)
    
    const q = query(
      collection(db, collectionPath),
      where("deleted", "==", false)
    )

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log(`[Wishlist Service] Snapshot received, found`, querySnapshot.size, "wishlist documents")

      // Filter documents by case-insensitive AppName
      const filteredDocs = querySnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.AppName && data.AppName.toLowerCase() === appName.toLowerCase()
      })

      console.log(`[Wishlist Service] After filtering by AppName, found`, filteredDocs.length, "documents")

      // Group by product_id and count unique users
      const groupedData = new Map<string, Set<string>>()
      
      filteredDocs.forEach((docSnapshot) => {
        const data = docSnapshot.data() as WishlistEntry
        if (!groupedData.has(data.product_id)) {
          groupedData.set(data.product_id, new Set())
        }
        groupedData.get(data.product_id)!.add(data.user_id)
      })

      // Convert to array with user counts
      const groupedArray: GroupedWishlistItem[] = Array.from(groupedData.entries()).map(([product_id, userSet]) => ({
        product_id,
        userCount: userSet.size,
        product: null
      }))

      console.log(`[Wishlist Service] Grouped into`, groupedArray.length, "unique products")

      // Fetch product details for each unique product_id
      const itemsWithProducts = await fetchProductDetails(groupedArray)

      // Sort by user count (descending) - most popular first
      itemsWithProducts.sort((a, b) => {
        return b.userCount - a.userCount
      })

      onData(itemsWithProducts)
    }, (error) => {
      console.error(`[Wishlist Service] onSnapshot error:`, error)
      onError(error)
    })

    return unsubscribe
  }
}

// Helper function to fetch product details
async function fetchProductDetails(items: GroupedWishlistItem[]): Promise<GroupedWishlistItem[]> {
  try {
    // Use a simple cache for this session
    const productCache = new Map<string, Product>()
    
    // Identify which products need to be fetched
    const productIdsToFetch = items
      .filter(item => !productCache.has(item.product_id))
      .map(item => item.product_id)

    if (productIdsToFetch.length === 0) {
      // All products are cached, just update the items
      return items.map(item => ({
        ...item,
        product: productCache.get(item.product_id) || null
      }))
    }

    console.log(`[Wishlist Service] Fetching details for`, productIdsToFetch.length, "products")

    // Fetch product details in parallel
    const productPromises = productIdsToFetch.map(async (productId) => {
      const productDoc = await getDoc(doc(db, "products", productId))
      if (productDoc.exists()) {
        const productData = productDoc.data()
        const product: Product = {
          id: productId,
          name: productData.name || "Unknown Product",
          image: productData.media[0].url || "/placeholder.jpg",
          priority: productData.priority || 0,
          location: productData.specs_rental.location || "Unknown Location"
        }
        return { productId, product }
      }
      return { productId, product: null }
    })

    const productResults = await Promise.all(productPromises)

    // Update cache with new products
    productResults.forEach(({ productId, product }) => {
      if (product) {
        productCache.set(productId, product)
      }
    })

    // Update items with product details
    return items.map(item => ({
      ...item,
      product: productCache.get(item.product_id) || null
    }))
  } catch (error) {
    console.error(`[Wishlist Service] Error fetching product details:`, error)
    throw error
  }
}