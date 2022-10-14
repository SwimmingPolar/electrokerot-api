import { Test } from '@nestjs/testing'
import { Collection, MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { PartsRepository } from '../parts.repository'
import { PartsStubs } from '../../../__test__/stubs/part.stub'
import { Part } from '../entities/part.entity'

describe('unit test: PartsRepository', () => {
  let client: MongoClient
  let partsRepository: PartsRepository
  let partsCollection: Collection<Part>

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ],
      providers: [PartsRepository]
    }).compile()

    client = module.get(getClientToken())
    partsCollection = client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('parts')
    partsRepository = module.get(PartsRepository)
  })

  // insert dummy parts data
  beforeAll(async () => {
    await partsCollection.bulkWrite(
      Object.keys(PartsStubs).map(key => ({
        insertOne: PartsStubs[key]
      }))
    )
  })

  afterAll(async () => {
    await client.close()
  })

  describe('getPartByPartId', () => {
    it('should be defined', () => {
      expect(partsRepository.findPartByPartId).toBeDefined()
    })
    it('should return a part by partId', async () => {
      const { cpu } = PartsStubs
      const part = await partsRepository.findPartByPartId(cpu._id)
      expect(part).not.toBeFalsy()
      expect(part.category).toBe('cpu')
    })
  })
})
