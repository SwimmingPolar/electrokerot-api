import { Type } from 'class-transformer'
import {
  Equals,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  registerDecorator,
  ValidateNested,
  ValidationArguments
} from 'class-validator'
import { Category, MarketType } from '../../common/types'
import { FilterStatus } from '../entities/build.entity'
import { ValidationOptions } from 'joi'

enum Reserved {
  reserved = 'reserved'
}

const PartCategory = { ...Category, ...Reserved }

class OptimizedPart {
  @IsEnum(MarketType)
  marketType: MarketType

  @IsUrl()
  vendorUrl: string
}

class Filter {
  @IsUrl()
  vendorUrl: string

  @IsEnum(MarketType)
  marketType: MarketType

  @IsEnum(FilterStatus)
  status: FilterStatus
}

class PartInfo {
  @IsNotEmpty()
  @IsEnum(PartCategory)
  category: keyof typeof PartCategory

  @IsString()
  @IsMongoId()
  @IsOptional()
  partId?: string

  @IsString()
  @MaxLength(32, { message: 'Name is too long' })
  @IsOptional()
  name?: string

  @Min(0, { message: 'Count cannot be lower than 0' })
  @Max(32, { message: 'Count cannot be higher than 32' })
  @LimitPartCountValue()
  @IsOptional()
  count?: number

  @Min(0, { message: 'Price cannot be lower than 0' })
  @Max(9999999, { message: 'Price cannot be higher than 9999999' })
  @IsOptional()
  price?: number

  @ValidateNested({ each: true })
  @Type(() => Filter)
  @IsOptional()
  filters?: Filter[]

  @IsBoolean()
  @IsOptional()
  delete?: boolean
}

class OptimizedCombination {
  @ValidateNested()
  @Type(() => OptimizedPart)
  cpu: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  motherboard: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  memory: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  graphics: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  ssd: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  hdd: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  power: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  case: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  cpuCooler: OptimizedPart

  @ValidateNested()
  @Type(() => OptimizedPart)
  systemCooler: OptimizedPart
}

class Optimization {
  @IsString()
  @IsNotEmpty()
  hash: string

  @ValidateNested()
  @Type(() => OptimizedCombination)
  lowestPrice: OptimizedCombination

  @ValidateNested()
  @Type(() => OptimizedCombination)
  leastPackage: OptimizedCombination
}

export class UpdateBuildDto {
  @IsString()
  @MinLength(4, { message: 'Name is too short' })
  @MaxLength(32, { message: 'Name is too long' })
  @IsOptional()
  name?: string

  @ValidateNested()
  @Type(() => PartInfo)
  @IsOptional()
  partInfo?: PartInfo

  @Equals(true)
  @IsOptional()
  isSelected?: true

  @ValidateNested()
  @Type(() => Optimization)
  @IsOptional()
  optimization?: Optimization
}

// Decorators
function LimitPartCountValue(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isLongerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['category', 'count'],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { count, category } = args.object as any

          switch (category) {
            case 'cpu':
            case 'motherboard':
            case 'power':
            case 'case':
            case 'reserved':
            case 'graphics':
              return count <= 1
            case 'ssd':
            case 'hdd':
              return count <= 4
            case 'memory':
              return count <= 8
            case 'cpuCooler':
            case 'systemCooler':
              return count <= 32
            default:
              return false
          }
        }
      }
    })
  }
}
