import { IsIn, IsString, MaxLength } from 'class-validator'
import { PartCategory, PartCategoryType } from '../../common/types'

export class SearchQueriesQuery {
  @IsIn(Object.keys(PartCategory))
  category: PartCategoryType

  @IsString()
  @MaxLength(100)
  query: string
}
