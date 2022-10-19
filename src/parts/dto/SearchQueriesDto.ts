import { IsEnum, IsString, MaxLength } from 'class-validator'
import { Category } from '../../common/types'

export class SearchQueriesQuery {
  @IsEnum(Category)
  category: keyof typeof Category

  @IsString()
  @MaxLength(100)
  query: string
}
