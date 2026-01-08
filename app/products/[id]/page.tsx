"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { getFirestoreDb } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Star, Calendar, MapPin, Image as ImageIcon } from "lucide-react"

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

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        const db = getFirestoreDb()
        const docRef = doc(db, "products", productId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setProduct({
            id: docSnap.id,
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
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching product:", error)
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Product not found.</p>
          </div>
        </div>
      </main>
    )
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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/products')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
            <Badge variant={getStatusVariant(product.status || '')}>
              {product.status || 'N/A'}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{product.description || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-sm">{product.type || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Price</label>
                <p className="text-sm font-semibold">
                  {product.price ? `₱${product.price.toLocaleString()}` : 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Rating</label>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating || 0}</span>
                </div>
              </div>

              {product.categories && product.categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categories</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Seller Name</label>
                <p className="text-sm">{product.seller_name || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Seller ID</label>
                <p className="text-sm font-mono text-xs">{product.seller_id || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Company ID</label>
                <p className="text-sm font-mono text-xs">{product.company_id || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Active</label>
                <Badge variant={product.active ? 'default' : 'secondary'}>
                  {product.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {product.specs_rental && Object.keys(product.specs_rental).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rental Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.specs_rental.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-sm">{product.specs_rental.location}</p>
                    </div>
                  </div>
                )}

                {product.specs_rental.geopoint && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                    <p className="text-sm font-mono text-xs">
                      {product.specs_rental.geopoint.latitude || product.specs_rental.geopoint._latitude},
                      {product.specs_rental.geopoint.longitude || product.specs_rental.geopoint._longitude}
                    </p>
                  </div>
                )}

                {product.specs_rental.size && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Size</label>
                    <p className="text-sm">{product.specs_rental.size}</p>
                  </div>
                )}

                {product.specs_rental.height && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Height</label>
                    <p className="text-sm">{product.specs_rental.height} ft</p>
                  </div>
                )}

                {product.specs_rental.width && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Width</label>
                    <p className="text-sm">{product.specs_rental.width} ft</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {product.media && product.media.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Media Gallery ({product.media.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {product.media.map((mediaItem, index) => (
                    <div key={index} className="group relative">
                      {mediaItem.url ? (
                        <div className="relative overflow-hidden rounded-lg border bg-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                          <img
                            src={mediaItem.url}
                            alt={mediaItem.description || `Media ${index + 1}`}
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                            onClick={() => window.open(mediaItem.url, '_blank')}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground';
                                errorDiv.innerHTML = `
                                  <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <span class="text-sm">Image unavailable</span>
                                `;
                                parent.appendChild(errorDiv);
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                              </svg>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Click to view
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">No image</span>
                        </div>
                      )}
                      <div className="mt-3 space-y-1">
                        <div className="text-sm font-medium text-foreground line-clamp-2">
                          {mediaItem.description || `Media ${index + 1}`}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{mediaItem.type || 'image'}</span>
                          {mediaItem.distance && (
                            <>
                              <span>•</span>
                              <span>{mediaItem.distance}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(product.created_at || product.created) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">
                      {(product.created_at || product.created)?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {(product.updated_at || product.updated) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated</label>
                    <p className="text-sm">
                      {(product.updated_at || product.updated)?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}