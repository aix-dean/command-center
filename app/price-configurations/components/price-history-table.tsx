"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PriceConfiguration, PaginationResult } from "../models/types"

interface PriceHistoryTableProps {
  paginatedData: PaginationResult | null
  currentPage: number
  loading: boolean
  pageLoading: boolean
  onPrevPage: () => void
  onNextPage: () => void
}

export function PriceHistoryTable({
  paginatedData,
  currentPage,
  loading,
  pageLoading,
  onPrevPage,
  onNextPage
}: PriceHistoryTableProps) {
  const configurations = paginatedData?.configurations || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Price History</CardTitle>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} • {configurations.length} items
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(loading || pageLoading) ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading price history...</p>
          </div>
        ) : configurations.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No price configurations found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Regular Price</TableHead>
                    <TableHead>Premium Price</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>User Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config, index) => (
                    <TableRow key={config.id || index}>
                      <TableCell className="font-medium">₱{config.regularPrice.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₱{config.premiumPrice.toLocaleString()}</TableCell>
                      <TableCell>{config.created?.toLocaleDateString() || 'N/A'}</TableCell>
                      <TableCell>{config.userEmail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {configurations.length} of {configurations.length} items
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevPage}
                  disabled={currentPage === 1 || pageLoading}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextPage}
                  disabled={!paginatedData?.hasMore || pageLoading}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}