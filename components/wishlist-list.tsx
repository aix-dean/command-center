"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { WishlistItem } from "@/components/wishlist-item"
import { PaginationControls } from "@/components/pagination-controls"
import { wishlistPaginationService } from "@/lib/wishlist-pagination-service"

interface GroupedWishlistItem {
  product_id: string
  userCount: number
  product: {
    id: string
    name: string
    image: string
    priority: number
    location?: string
  } | null
}

interface WishlistListProps {
  appName: string
  title: string
}

export default function WishlistList({ appName, title }: WishlistListProps) {
  const [groupedItems, setGroupedItems] = useState<GroupedWishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const pageSize = 10
  const { toast } = useToast()

  const updatePagination = (newPage: number) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    setLoading(true)
    
    const unsubscribe = wishlistPaginationService.subscribeToPaginatedWishlist(
      appName,
      {
        pageSize,
        currentPage
      },
      (items, total) => {
        setGroupedItems(items)
        setTotalCount(total)
        setTotalPages(Math.ceil(total / pageSize))
        setLoading(false)
      },
      (error) => {
        console.error(`[${title}] Error loading wishlist:`, error)
        toast({
          title: "Error Loading Wishlist",
          description: "Failed to load wishlist data. Please try refreshing the page.",
          variant: "destructive",
        })
        setLoading(false)
      }
    )

    return unsubscribe
  }, [appName, title, toast, currentPage])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">
            {totalCount} product{totalCount !== 1 ? 's' : ''} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading wishlist data...</p>
          </div>
        ) : groupedItems.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No wishlist items found for {appName}.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Product Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedItems.map((item) => (
                    <WishlistItem
                      key={item.product_id}
                      productName={item.product?.name || "Unknown Product"}
                      productImage={item.product?.image || ""}
                      userCount={item.userCount}
                      location={item.product?.location}
                      product_id={item.product_id}
                      appName={appName}
                    />
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
    </Card>
  )
}