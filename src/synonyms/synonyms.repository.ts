import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb'
import { EntityRepository } from '../common/repository/entity.repository'

export type MappingType = 'equivalent' | 'explicit'

export class Synonyms {
  _id: ObjectId
  mappingType: MappingType
  synonyms: string[]
}

@Injectable()
export class SynonymsRepository extends EntityRepository<Synonyms> {
  constructor(@InjectDb() private readonly db: Db) {
    super(db, 'synonyms', Synonyms)
  }

  async findSynonyms(tokens: string[]) {
    return await this.aggregate([
      {
        $match: {
          synonyms: {
            $in: tokens
          }
        }
      }
    ])
  }
}
