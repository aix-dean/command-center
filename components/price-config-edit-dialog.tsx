"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PriceConfigForm } from "@/components/price-config-form"

interface PriceConfigEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { regularPrice: number; premiumPrice: number }) => Promise<void>
  initialData: {
    regularPrice: number
    premiumPrice: number
  }
  loading?: boolean
}

export function PriceConfigEditDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  loading = false
}: PriceConfigEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (data: { regularPrice: number; premiumPrice: number }) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Price Configuration</DialogTitle>
          <DialogDescription>
            Update the regular and premium prices for your configuration.
          </DialogDescription>
        </DialogHeader>
        <PriceConfigForm
          initialData={initialData}
          onSubmit={handleSave}
          onCancel={handleCancel}
          isLoading={isSubmitting || loading}
        />
      </DialogContent>
    </Dialog>
  )
}