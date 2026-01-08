"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface PriceConfigFormProps {
  initialData?: {
    regularPrice: number
    premiumPrice: number
  }
  onSubmit: (data: { regularPrice: number; premiumPrice: number }) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function PriceConfigForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: PriceConfigFormProps) {
  const [regularPrice, setRegularPrice] = useState(initialData?.regularPrice || 15)
  const [premiumPrice, setPremiumPrice] = useState(initialData?.premiumPrice || 30)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: number) => void) => {
    const value = e.target.value
    // Only allow numbers, decimal point, and backspace
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value === '' ? 0 : parseFloat(value))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (regularPrice <= 0 || premiumPrice <= 0) {
      toast({
        title: "Invalid Prices",
        description: "Prices must be greater than 0",
        variant: "destructive"
      })
      return
    }

    if (regularPrice >= premiumPrice) {
      toast({
        title: "Invalid Price Relationship",
        description: "Premium price must be higher than regular price",
        variant: "destructive"
      })
      return
    }

    onSubmit({ regularPrice, premiumPrice })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Price Configuration' : 'Create Price Configuration'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regularPrice">Regular Price (₱)</Label>
              <Input
                id="regularPrice"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={regularPrice}
                onChange={(e) => handleInputChange(e, setRegularPrice)}
                disabled={isLoading}
                required
                placeholder="Enter regular price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premiumPrice">Premium Price (₱)</Label>
              <Input
                id="premiumPrice"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={premiumPrice}
                onChange={(e) => handleInputChange(e, setPremiumPrice)}
                disabled={isLoading}
                required
                placeholder="Enter premium price"
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="ml-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}