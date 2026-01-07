"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { WishlistUsersDialog } from "@/components/wishlist-users-dialog"
import { wishlistUsersService } from "@/lib/wishlist-users-service"

interface WishlistItemProps {
  productName: string
  productImage: string
  userCount: number
  location?: string
  product_id: string
  appName: string
}

export function WishlistItem({ productName, productImage, userCount, location, product_id, appName }: WishlistItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleOpenDialog = async () => {
    setDialogOpen(true)
    setLoading(true)
    
    try {
      const fetchedUsers = await wishlistUsersService.fetchUsersForProduct(product_id, appName)
      setUsers(fetchedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={handleOpenDialog}
      >
        <TableCell>
          <div className="flex items-center justify-start">
            <img
              src={productImage}
              alt={productName}
              className="h-15 w-15 object-cover rounded"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg"
                e.currentTarget.className = "h-12 w-12 object-cover rounded bg-gray-200"
              }}
            />
          </div>
        </TableCell>
        <TableCell className="font-medium">{productName}</TableCell>
        <TableCell>{location || "Unknown Location"}</TableCell>
        <TableCell className="">
          <Badge variant="outline" className="text-sm">
            {userCount}
          </Badge>
        </TableCell>
      </TableRow>

      <WishlistUsersDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productName={productName}
        productImage={productImage}
        users={users}
        appName={appName}
      />
    </>
  )
}