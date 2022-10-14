import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb'
import { EntityRepository } from '../common/repository/entity.repository'
import { Part } from './entities/part.entity'

@Injectable()
export class PartsRepository extends EntityRepository<Part> {
  constructor(@InjectDb() private readonly db: Db) {
    super(db, 'parts')
  }

  async findPartByPartId(_id: ObjectId) {
    return await this.findById(_id)
  }
}
