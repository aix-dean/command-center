"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, User, Calendar, DollarSign } from "lucide-react"

interface PriceHistoryProps {
  history: Array<{
    old_value: number
    new_value: number
    updated_by: string
    updated_at: Date
    reason?: string
  }>
}

export function PriceHistory({ history }: PriceHistoryProps) {
  const [showAll, setShowAll] = useState(false)
  const displayHistory = showAll ? history : history.slice(0, 5)

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Price History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No price changes recorded yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Price History
          </div>
          {history.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${history.length})`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayHistory.map((change, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{change.updated_by}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {change.updated_at.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Previous:</span>
                  <Badge variant="secondary">₱{change.old_value.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm">New:</span>
                  <Badge className="bg-green-100 text-green-800">₱{change.new_value.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600">
                    {((change.new_value - change.old_value) / change.old_value * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              {change.reason && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Reason:</span> {change.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}