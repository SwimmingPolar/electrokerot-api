import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ObjectId } from 'mongodb'

@Injectable()
export class IsMongodbId implements PipeTransform {
  transform(value: any): ObjectId {
    const validObjectId = ObjectId.isValid(value)

    if (!validObjectId) {
      throw new BadRequestException('Invalid Id')
    }

    return new ObjectId(value)
  }
}
