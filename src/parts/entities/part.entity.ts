import { Exclude, Transform, Type } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { MarketType, PartCategoryType } from 'src/common/types'
import { TransformObjectId } from '../../common/decorators/TransformObjectId.decorator'

export class Part {
  @TransformObjectId()
  _id: ObjectId

  @Exclude({ toPlainOnly: true })
  pcode: string
  name: FullName
  category: PartCategoryType

  @Type(() => Part)
  variants: Part[]
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

  @Transform(({ value }) => new Date(value))
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
  value: number
}
