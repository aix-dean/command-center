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