import { priceConfigService } from "@/lib/price-config-service"

export interface PriceConfiguration {
  id?: string
  regularPrice: number
  premiumPrice: number
  created: Date
  userId: string
  userEmail: string
}

export interface PaginationResult {
  configurations: PriceConfiguration[]
  hasMore: boolean
  lastVisible?: any
  firstVisible?: any
}

// Backend API functions
export const subscribeToConfigurations = (
  callback: (configurations: PriceConfiguration[]) => void
): (() => void) => {
  return priceConfigService.subscribe(callback)
}

export const createPriceConfiguration = async (
  data: Omit<PriceConfiguration, 'id'>
): Promise<string> => {
  return await priceConfigService.create(data)
}

export const updatePriceConfiguration = async (
  id: string,
  data: { regularPrice: number; premiumPrice: number }
): Promise<void> => {
  return await priceConfigService.update(id, data)
}

export const getPriceConfiguration = async (
  id: string
): Promise<PriceConfiguration | null> => {
  return await priceConfigService.getById(id)
}

export const getAllPriceConfigurations = async (): Promise<PriceConfiguration[]> => {
  return await priceConfigService.getAll()
}

// Pagination functions
export const getPaginatedConfigurations = async (
  page: number,
  pageSize: number = 10
): Promise<PaginationResult> => {
  return await priceConfigService.getPaginated(page, pageSize)
}

export const getNextPageConfigurations = async (
  lastVisible: any,
  pageSize: number = 10
): Promise<PaginationResult> => {
  return await priceConfigService.getNextPage(lastVisible, pageSize)
}

export const getPrevPageConfigurations = async (
  firstVisible: any,
  pageSize: number = 10
): Promise<PaginationResult> => {
  return await priceConfigService.getPrevPage(firstVisible, pageSize)
}