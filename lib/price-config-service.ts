import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc, type Firestore, limit, startAfter, endBefore, QueryDocumentSnapshot, getDocs } from "firebase/firestore"
import { getFirestoreDb } from "./firebase"

export interface PriceConfiguration {
  id?: string
  regularPrice: number
  premiumPrice: number
  created: Date
  userId: string
  userEmail: string
}

export interface PaginationResult {
  configurations: PriceConfiguration[]
  hasMore: boolean
  lastVisible?: QueryDocumentSnapshot
  firstVisible?: QueryDocumentSnapshot
}

export class PriceConfigService {
  private db: Firestore

  constructor() {
    this.db = getFirestoreDb()
  }

  // Get all price configurations
  async getAll(): Promise<PriceConfiguration[]> {
    const q = query(
      collection(this.db, 'price-configurations'),
      orderBy("created", "desc")
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const configurations: PriceConfiguration[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        configurations.push({
          id: doc.id,
          regularPrice: data.regularPrice || 15,
          premiumPrice: data.premiumPrice || 30,
          created: data.created?.toDate(),
          userId: data.userId || '',
          userEmail: data.userEmail || ''
        })
      })
      
      // If no configurations exist, create default ones
      if (configurations.length === 0) {
        this.createDefaultConfigurations()
      }
      
      return configurations
    })

    return new Promise((resolve) => {
      const unsubscribeWrapper = () => {
        const result: PriceConfiguration[] = []
        unsubscribe()
        resolve(result)
        return result
      }
      unsubscribeWrapper()
    })
  }

  // Get paginated price configurations
  async getPaginated(page: number, pageSize: number = 10): Promise<PaginationResult> {
    const q = query(
      collection(this.db, 'price-configurations'),
      orderBy("created", "desc"),
      limit(pageSize)
    )

    const querySnapshot = await getDocs(q)
    const configurations: PriceConfiguration[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      configurations.push({
        id: doc.id,
        regularPrice: data.regularPrice || 15,
        premiumPrice: data.premiumPrice || 30,
        created: data.created?.toDate(),
        userId: data.userId || '',
        userEmail: data.userEmail || ''
      })
    })

    const hasMore = configurations.length === pageSize
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
    const firstVisible = querySnapshot.docs[0]

    return {
      configurations,
      hasMore,
      lastVisible,
      firstVisible
    }
  }

  // Get next page of price configurations
  async getNextPage(lastVisible: QueryDocumentSnapshot, pageSize: number = 10): Promise<PaginationResult> {
    const q = query(
      collection(this.db, 'price-configurations'),
      orderBy("created", "desc"),
      startAfter(lastVisible),
      limit(pageSize)
    )

    const querySnapshot = await getDocs(q)
    const configurations: PriceConfiguration[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      configurations.push({
        id: doc.id,
        regularPrice: data.regularPrice || 15,
        premiumPrice: data.premiumPrice || 30,
        created: data.created?.toDate(),
        userId: data.userId || '',
        userEmail: data.userEmail || ''
      })
    })

    const hasMore = configurations.length === pageSize
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]

    return {
      configurations,
      hasMore,
      lastVisible: newLastVisible,
      firstVisible: querySnapshot.docs[0]
    }
  }

  // Get previous page of price configurations
  async getPrevPage(firstVisible: QueryDocumentSnapshot, pageSize: number = 10): Promise<PaginationResult> {
    const q = query(
      collection(this.db, 'price-configurations'),
      orderBy("created", "desc"),
      endBefore(firstVisible),
      limit(pageSize)
    )

    const querySnapshot = await getDocs(q)
    const configurations: PriceConfiguration[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      configurations.push({
        id: doc.id,
        regularPrice: data.regularPrice || 15,
        premiumPrice: data.premiumPrice || 30,
        created: data.created?.toDate(),
        userId: data.userId || '',
        userEmail: data.userEmail || ''
      })
    })

    const hasMore = configurations.length === pageSize
    const newFirstVisible = querySnapshot.docs[0]
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]

    return {
      configurations,
      hasMore,
      lastVisible: newLastVisible,
      firstVisible: newFirstVisible
    }
  }

  // Create default configuration if none exist
  private async createDefaultConfigurations(): Promise<void> {
    try {
      await this.create({
        regularPrice: 15,
        premiumPrice: 30,
        created: new Date(),
        userId: 'system',
        userEmail: 'system@command-center.com'
      })
    } catch (error) {
      console.error('Error creating default configuration:', error)
    }
  }

  // Get price configuration by ID
  async getById(id: string): Promise<PriceConfiguration | null> {
    const docRef = doc(this.db, 'price-configurations', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        regularPrice: data.regularPrice || 15,
        premiumPrice: data.premiumPrice || 30,
        created: data.created?.toDate(),
        userId: data.userId || '',
        userEmail: data.userEmail || ''
      }
    }
    return null
  }

  // Create new price configuration
  async create(config: Omit<PriceConfiguration, 'id'>): Promise<string> {
    const docRef = doc(collection(this.db, 'price-configurations'))
    
    const newConfig: PriceConfiguration = {
      ...config,
      id: docRef.id
    }

    await setDoc(docRef, newConfig)
    return docRef.id
  }

  // Update existing price configuration
  async update(id: string, data: { regularPrice: number; premiumPrice: number }): Promise<void> {
    const docRef = doc(this.db, 'price-configurations', id)
    await updateDoc(docRef, {
      regularPrice: data.regularPrice,
      premiumPrice: data.premiumPrice,
      created: new Date()
    })
  }

  // Delete price configuration
  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, 'price-configurations', id)
    await deleteDoc(docRef)
  }

  // Subscribe to price configurations changes
  subscribe(callback: (configurations: PriceConfiguration[]) => void): () => void {
    const q = query(
      collection(this.db, 'price-configurations'),
      orderBy("created", "desc")
    )

    return onSnapshot(q, (querySnapshot) => {
      const configurations: PriceConfiguration[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        configurations.push({
          id: doc.id,
          regularPrice: data.regularPrice || 15,
          premiumPrice: data.premiumPrice || 30,
          created: data.created?.toDate(),
          userId: data.userId || '',
          userEmail: data.userEmail || ''
        })
      })
      callback(configurations)
    })
  }
}

// Export singleton instance
export const priceConfigService = new PriceConfigService()