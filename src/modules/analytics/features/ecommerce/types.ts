export type Period = 'thisMonth' | 'thisWeek' | 'thisYear'

export type StatisticCategory = 'totalSales' | 'orders' | 'cancellations' | 'avgOrderValue'

export type SalesAnalyticsData = {
  totalSales: number
  orders: number
  avgOrderValue: number
  cancellations: number
}

export type TopBrandData = {
  brandName: string
  brandImage: string
  quantityOrdered: number
}

export type TopProductData = {
  productName: string
  productImage: string
  totalOrders: number
}

export type TopSellerData = {
  sellerName: string
  sellerImage: string
  totalSales: number
}

export type CombinedAnalytics = {
  salesAnalytics?: SalesAnalyticsData
  topBrands?: TopBrandData[]
  topProducts?: TopProductData[]
  topSellers?: TopSellerData[]
}

export type AnalyticsParams = {
  startDate: string
  endDate: string
}
