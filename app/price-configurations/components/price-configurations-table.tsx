"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface PriceConfiguration {
  id?: string
  regularPrice: number
  premiumPrice: number
  created: Date
  userId: string
  userEmail: string
}

interface PriceConfigurationsTableProps {
  configurations: PriceConfiguration[]
  loading: boolean
  onEdit: (index: number) => void
  onCreateDefault: () => void
}

export function PriceConfigurationsTable({
  configurations,
  loading,
  onEdit,
  onCreateDefault
}: PriceConfigurationsTableProps) {
  const [isEditing, setIsEditing] = useState<number | null>(null)

  const handleEdit = (index: number) => {
    setIsEditing(index)
    onEdit(index)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Price Management</CardTitle>
        <Button onClick={onCreateDefault}>
          Create Default Configuration
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading price configurations...</p>
          </div>
        ) : configurations.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No price configurations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regular Price</TableHead>
                  <TableHead>Premium Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configurations.map((config, index) => (
                  <TableRow
                    key={config.id || index}
                    className={`hover:bg-muted/50 ${isEditing === index ? 'bg-muted/50' : ''}`}
                  >
                    <TableCell className="font-medium">₱{config.regularPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₱{config.premiumPrice.toLocaleString()}</TableCell>
                    <TableCell>{config.created?.toLocaleDateString() || 'N/A'}</TableCell>
                    <TableCell>{config.userEmail}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(index)}
                        className="gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}