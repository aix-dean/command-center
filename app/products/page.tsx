"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { getFirestoreDb } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Star } from "lucide-react"

export interface Product {
  id?: string
  name: string
  description?: string
  price?: number
  type?: string
  status?: string
  active?: boolean
  rating?: number
  categories?: string[]
  seller_name?: string
  seller_id?: string
  company_id?: string
  specs_rental?: any
  media?: any[]
  created?: Date
  updated?: Date
  created_at?: Date
  updated_at?: Date
  deleted?: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const db = getFirestoreDb()
        const tenantId = "command-center-rep5o"
        const collectionPath = 'products'
        console.log(`[Products] Querying tenant collection: ${collectionPath}`)
        const q = query(
          collection(db, collectionPath),
          orderBy("created_at", "desc")
        )

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log(`[Products] Snapshot received, found ${querySnapshot.size} documents`)
          const fetchedProducts: Product[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            fetchedProducts.push({
              id: doc.id,
              name: data.name || '',
              description: data.description || '',
              price: data.price || 0,
              type: data.type || '',
              status: data.status || 'PENDING',
              active: data.active ?? true,
              rating: data.rating || 0,
              categories: data.categories || [],
              seller_name: data.seller_name || '',
              seller_id: data.seller_id || '',
              company_id: data.company_id || '',
              specs_rental: data.specs_rental || {},
              media: data.media || [],
              created: data.created?.toDate(),
              updated: data.updated?.toDate(),
              created_at: data.created_at?.toDate(),
              updated_at: data.updated_at?.toDate(),
              deleted: data.deleted || false,
            })
          })

          setProducts(fetchedProducts)
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Error fetching products:", error)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleRowClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'secondary'
      case 'ACTIVE':
      case 'APPROVED':
        return 'default'
      case 'REJECTED':
      case 'PARKED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-foreground">Products</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">No products found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => product.id && handleRowClick(product.id)}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.type || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(product.status || '')}>
                            {product.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.price ? `₱${product.price.toLocaleString()}` : 'N/A'}
                        </TableCell>
                        <TableCell>{product.seller_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{product.rating || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.created_at?.toLocaleDateString() || product.created?.toLocaleDateString() || 'N/A'}
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
    </main>
  )
}