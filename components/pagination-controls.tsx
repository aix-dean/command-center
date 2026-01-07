"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false
}: PaginationControlsProps) {
  const handleFirstPage = () => onPageChange(1)
  const handlePreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const handleNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const handleLastPage = () => onPageChange(totalPages)

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={isFirstPage || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronsLeft className="h-3 w-3" />
          First
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={isFirstPage || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-3 w-3" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={isLastPage || isLoading}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-3 w-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={isLastPage || isLoading}
          className="flex items-center gap-1"
        >
          Last
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}