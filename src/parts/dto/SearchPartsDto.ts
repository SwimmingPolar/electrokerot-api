import { Transform } from 'class-transformer'
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  registerDecorator,
  ValidationArguments,
  ValidationOptions
} from 'class-validator'
import { PartCategory, PartCategoryType } from '../../common/types'

export type FiltersType = {
  filterName: string
  filterOptions: string[]
}[]

export class SearchPartsBody {
  @IsIn(Object.keys(PartCategory))
  category: PartCategoryType

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(9999)
  @IsOptional()
  page: number

  @IsString()
  @MaxLength(100)
  @IsOptional()
  query: string

  @IsObject({ each: true })
  @IsFilter('filters', {
    message: 'Invalid filter value'
  })
  @IsOptional()
  filters: FiltersType
}

function IsFilter(property: string, validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'IsFilter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const filters = (args.object as any)[relatedPropertyName] as {
            filterName: string
            filterOptions: string[]
          }[]

          // Without this, will get 500 internal error
          // @Issue: there's no 'stop on error' feature for now
          if (!Array.isArray(filters)) {
            return false
          }

          // Examine the length of the filter name and filter options
          return filters?.every(({ filterName, filterOptions }) => {
            // limit the length of the filter name to 100
            if (filterName?.length > 100) {
              return false
            }
            return filterOptions?.every(filterOption => {
              // limit the length of the individual filter option to 100
              if (filterOption?.length > 100) {
                return false
              }
              return true
            })
          })
        }
      }
    })
  }
}
