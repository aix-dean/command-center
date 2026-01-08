"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign as DollarIcon } from "lucide-react"

interface PriceConfigSummaryProps {
  regularPrice: number
  premiumPrice: number
}

export function PriceConfigSummary({ regularPrice, premiumPrice }: PriceConfigSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regular Price</CardTitle>
          <DollarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{regularPrice.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Current regular price per square foot</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Premium Price</CardTitle>
          <DollarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{premiumPrice.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Current premium price per square foot</p>
        </CardContent>
      </Card>
    </div>
  )
}