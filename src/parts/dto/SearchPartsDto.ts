import { Transform } from 'class-transformer'
import {
  IsEnum,
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
import { Category } from '../../common/types'

export class SearchPartsQuery {
  @IsEnum(Category)
  category: keyof typeof Category

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

  @Transform(({ value }) => JSON.parse(decodeURIComponent(value)))
  @IsObject()
  @IsFilter('filters', { message: 'Invalid filter value' })
  @IsOptional()
  filters: Record<string, string[]>
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
          const filter = (args.object as any)[relatedPropertyName]
          // const { filter } = args.object as { filter: Record<string, string[]> }
          for (const key of Object.keys(filter)) {
            // key must be string and its value must be an array
            if (typeof key !== 'string' || !Array.isArray(filter[key])) {
              return false
            }
            // limit key length to 100
            if (key?.length > 100) {
              return false
            }

            // filter value must be an array of strings
            filter[key].forEach(value => {
              if (typeof value !== 'string') {
                return false
              }
              // limit value length to 100
              if (value?.length > 100) {
                return false
              }
            })
          }
          return true
        }
      }
    })
  }
}
