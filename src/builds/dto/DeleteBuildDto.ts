import { ObjectId } from 'mongodb'
import { IsMongodbId } from '../../common/decorators/IsMongodbId'
import { TransformObjectId } from '../../common/decorators/TransformObjectId.decorator'

export class DeleteBuildParam {
  @IsMongodbId('buildId', { message: 'Invalid build id' })
  @TransformObjectId()
  buildId: ObjectId
}
