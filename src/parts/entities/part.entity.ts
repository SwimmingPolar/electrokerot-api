import { Exclude } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Category, MarketType } from 'src/common/types'
import { TransformObjectId } from '../../common/decorators/TransformObjectId.decorator'

export class Part {
  @TransformObjectId()
  _id: ObjectId
  pcode: string
  name: FullName
  category: keyof typeof Category
  variants: string[]
  sortOrder: number
  stock: boolean

  @Exclude({ toPlainOnly: true })
  isVariant: boolean

  @Exclude({ toPlainOnly: true })
  isUpdating: boolean
  details: Details
  vendors: Vendors
  prices: Prices

  @Exclude({ toPlainOnly: true })
  createdAt: Date
  updatedAt: Date
}

interface FullName {
  fullName: string
  tag?: string
}

export type Details = Record<
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
