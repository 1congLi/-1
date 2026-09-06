export interface Record {
  id: string
  amount: number
  date: string
  category1: string
  category2: string
  note?: string
  attachment?: {
    type: 'image'
    data: string
    name: string
    size: number
  }
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  children?: CategoryChild[]
}

export interface CategoryChild {
  id: string
  name: string
  icon: string
  color: string
}

export interface AppState {
  records: Record[]
  categories: Category[]
}

export interface Statistics {
  totalAmount: number
  categoryDistribution: Record[]
  dailyTrend: Record[]
  categoryRanking: Record[]
}
