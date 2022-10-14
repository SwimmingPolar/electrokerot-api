import { Exclude, Type } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Category, MarketType } from 'src/common/types'
import { TransformObjectId } from '../../common/decorators/TransformObjectId.decorator'

class Filter {
  marketType: MarketType
  vendorUrl: string
  status: FilterStatus
}
class Part {
  @TransformObjectId()
  partId: ObjectId
  name: string
  count: number
  price: number

  @Type(() => Filter)
  filters: Filter[]
}

class Parts {
  @Type(() => Part)
  cpu: Part

  @Type(() => Part)
  motherboard: Part

  @Type(() => Part)
  memory: Part

  @Type(() => Part)
  graphics: Part

  @Type(() => Part)
  ssd: Part

  @Type(() => Part)
  hdd: Part

  @Type(() => Part)
  power: Part

  @Type(() => Part)
  case: Part

  @Type(() => Part)
  cooler: Part

  @Type(() => Part)
  reserved: Part
}
export class Build {
  @TransformObjectId()
  _id: ObjectId

  @Exclude({ toPlainOnly: true })
  @TransformObjectId()
  owner: ObjectId

  name: string

  isSelected: boolean

  @Type(() => Parts)
  parts?: Parts

  optimization?: Optimization

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date
}

export enum FilterStatus {
  included = 'included',
  excluded = 'excluded',
  selected = 'selected'
}

class Optimization {
  hash: string
  optimizedAt: Date
  lowestPrice: Record<Category, OptimizedPart>
  leastPackage: Record<Category, OptimizedPart>
}

class OptimizedPart {
  marketType: MarketType
  vendorUrl: string
}
