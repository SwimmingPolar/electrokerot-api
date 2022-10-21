import { Transform } from 'class-transformer'
import { ArrayMaxSize, ValidateNested } from 'class-validator'
import { ObjectId } from 'mongodb'
import { IsMongodbId } from '../../common/decorators/IsMongodbId'
import { TransformObjectId } from '../../common/decorators/TransformObjectId.decorator'

export class PartsIdsQuery {
  @Transform(({ value }) => value.split(','))
  @ValidateNested({ each: true })
  @IsMongodbId('ids', { message: 'Invalid part id' })
  @TransformObjectId()
  @ArrayMaxSize(10, { message: 'Too many part ids' })
  ids: ObjectId[]
}
