"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Mail, Phone } from "lucide-react"

interface WishlistUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  productImage: string
  users: Array<{
    id: string
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
  }>
  appName: string
}

export function WishlistUsersDialog({
  open,
  onOpenChange,
  productName,
  productImage,
  users,
  appName
}: WishlistUsersDialogProps) {
  const getDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) {
      return user.firstName
    }
    if (user.email) {
      return user.email
    }
    if (user.phoneNumber) {
      return user.phoneNumber
    }
    return "Unknown User"
  }

  const getUserIcon = (user: any) => {
    if (user.firstName || user.lastName) {
      return <User className="h-4 w-4" />
    }
    if (user.email) {
      return <Mail className="h-4 w-4" />
    }
    if (user.phoneNumber) {
      return <Phone className="h-4 w-4" />
    }
    return <User className="h-4 w-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-end gap-3">
            {productName}
          </DialogTitle>
          <DialogDescription>
            Users who have this product in their {appName} wishlist
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users found for this product
            </p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {getUserIcon(user)}
                      </div>
                      <div>
                        <p className="font-medium">{getDisplayName(user)}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email || user.phoneNumber || "No contact info"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm text-muted-foreground">
              Total: {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
            <Badge variant="secondary">
              {appName} Wishlist
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}