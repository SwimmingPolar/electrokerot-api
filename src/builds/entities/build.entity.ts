import { ObjectId } from 'mongodb'
import { Category, MarketType } from 'src/common/types'

export class Build {
  _id: ObjectId
  owner: ObjectId
  name: string
  isSelected: boolean
  parts?: Parts
  optimization?: Optimization
  createdAt: Date
  updatedAt: Date
}

type Parts = Record<BuildCategory, Part>

type BuildCategory = Category | BuildCategoryWithReservedSlot

enum BuildCategoryWithReservedSlot {
  reserved = 'reserved'
}

interface Part {
  partId: ObjectId
  name: string
  count: number
  price: number
  filters: Filter[]
}

interface Filter {
  marketType: MarketType
  vendorUrl: string
  status: FilterStatus
}

enum FilterStatus {
  included = 'included',
  excluded = 'excluded',
  selected = 'selected'
}

interface Optimization {
  hash: string
  lowestPrice: Record<Category, OptimizedPart>
  leastPackages: Record<Category, OptimizedPart>
}

interface OptimizedPart {
  marketType: MarketType
  vendorUrl: string
}
