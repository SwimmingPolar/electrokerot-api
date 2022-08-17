import { ObjectId } from 'mongodb'
import { Category, MarketType } from 'src/common/types'

export class Part {
  _id: ObjectId
  pcode: string
  name: FullName
  category: Category
  variants: ObjectId[]
  sortOrder: number
  stock: boolean
  isVariant: boolean
  isUpdating: boolean
  details: Details
  vendors: Vendors
  prices: Prices
  createdAt: Date
  updatedAt: Date
}

interface FullName {
  name: string
  tag?: string
}

type Details = Record<
  string,
  {
    value: string
    type: string
  }
>

type Vendors = Record<MarketType, Vendor[]>

interface Vendor {
  vendorName: string
  vendorCode?: string
  vendorUrl: string
  shippingCost: number
  price: number
}

type Prices = Price[]

interface Price {
  timestamp: Date
  price: number
}
