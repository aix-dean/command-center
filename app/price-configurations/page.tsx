"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  subscribeToConfigurations,
  createPriceConfiguration,
  getPaginatedConfigurations,
  getNextPageConfigurations,
  getPrevPageConfigurations
} from "./services/price-config-api"
import { PriceHistoryTable, PriceConfigSummary } from "./components"
import { PriceConfigEditDialog } from "@/components/price-config-edit-dialog"
import { PriceConfiguration, PaginationResult } from "./models/types"

export default function PriceConfigurationsPage() {
  const [configurations, setConfigurations] = useState<PriceConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [regularPrice, setRegularPrice] = useState<number>(15)
  const [premiumPrice, setPremiumPrice] = useState<number>(30)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [paginatedData, setPaginatedData] = useState<PaginationResult | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const unsubscribe = subscribeToConfigurations((configs) => {
      setConfigurations(configs)
      
      // Extract latest regular and premium prices from the most recent configuration
      if (configs.length > 0) {
        const latestConfig = configs[0] // Most recent based on subscription order
        setRegularPrice(latestConfig.regularPrice ?? 15)
        setPremiumPrice(latestConfig.premiumPrice ?? 30)
      } else {
        // Use defaults if no configurations exist
        setRegularPrice(15)
        setPremiumPrice(30)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Load initial page
  useEffect(() => {
    loadPage(1)
  }, [])

  const loadPage = async (page: number) => {
    if (page === 1) {
      // Load first page
      try {
        setPageLoading(true)
        const result = await getPaginatedConfigurations(page, 10)
        setPaginatedData(result)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load price history",
          variant: "destructive"
        })
      } finally {
        setPageLoading(false)
      }
    } else if (page > 1 && paginatedData?.lastVisible) {
      // Load next page
      try {
        setPageLoading(true)
        const result = await getNextPageConfigurations(paginatedData.lastVisible, 10)
        setPaginatedData(result)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load next page",
          variant: "destructive"
        })
      } finally {
        setPageLoading(false)
      }
    } else if (page < currentPage && paginatedData?.firstVisible) {
      // Load previous page
      try {
        setPageLoading(true)
        const result = await getPrevPageConfigurations(paginatedData.firstVisible, 10)
        setPaginatedData(result)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load previous page",
          variant: "destructive"
        })
      } finally {
        setPageLoading(false)
      }
    }
  }

  const handleNextPage = () => {
    if (paginatedData?.hasMore) {
      setCurrentPage(prev => prev + 1)
      loadPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      loadPage(currentPage - 1)
    }
  }

  const handleEdit = async (data: { regularPrice: number; premiumPrice: number }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a price configuration",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Create a new price configuration document instead of updating existing one
      await createPriceConfiguration({
        regularPrice: data.regularPrice,
        premiumPrice: data.premiumPrice,
        created: new Date(),
        userId: user.uid,
        userEmail: user.email || ''
      })

      toast({
        title: "Price Configuration Created",
        description: `Regular: ₱${data.regularPrice}, Premium: ₱${data.premiumPrice}`,
      })

      // Update local state to reflect the changes
      setRegularPrice(data.regularPrice)
      setPremiumPrice(data.premiumPrice)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create price configuration",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-4xl font-bold text-foreground">Price Configurations</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
            disabled={isSubmitting}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Prices
          </Button>
        </div>

        {/* Current Prices Summary */}
        <PriceConfigSummary
          regularPrice={regularPrice}
          premiumPrice={premiumPrice}
        />

        {/* Price History Table with Server-Side Pagination */}
        <PriceHistoryTable
          paginatedData={paginatedData}
          currentPage={currentPage}
          loading={loading}
          pageLoading={pageLoading}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />

        {/* Edit Dialog */}
        <PriceConfigEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          initialData={{ regularPrice, premiumPrice }}
          onSave={handleEdit}
          loading={isSubmitting}
        />
      </div>
    </main>
  )
}