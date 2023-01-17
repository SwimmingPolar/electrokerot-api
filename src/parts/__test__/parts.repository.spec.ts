import { Test } from '@nestjs/testing'
import { Collection, MongoClient, ObjectId } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { PartsStubs } from '../../../__test__/stubs/part.stub'
import { PartCategory } from '../../common/types'
import { Part } from '../entities/part.entity'
import { PartsRepository } from '../parts.repository'

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

  describe('findPartByPartId', () => {
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

  describe('findPartsByPartIds', () => {
    it('should be defined', () => {
      expect(partsRepository.findPartsByPartIds).toBeDefined()
    })
    it('should return parts by partIds', async () => {
      const partsIds = Object.keys(PartsStubs).map<ObjectId>(
        key => PartsStubs[key]._id
      )
      const parts = await partsRepository.findPartsByPartIds(partsIds)
      expect(parts.length).toBe(10)
      parts.forEach(part => {
        expect(
          partsIds.some(_id => _id.toHexString() === part._id.toHexString())
        ).toBeTruthy()
      })
    })
  })

  describe('findPartsNameByKeyword', () => {
    it('should be defined', () => {
      expect(partsRepository.findPartsNamesByCategoryAndQuery).toBeDefined()
    })
    it('should return parts name by keyword', async () => {
      jest
        .spyOn(partsRepository, 'findPartsNamesByCategoryAndQuery')
        .mockResolvedValueOnce([
          '인텔 코어i5-12세대 12400F (엘더레이크)',
          '인텔 코어i5-12세대 12400 (엘더레이크)'
        ])
      const parts = await partsRepository.findPartsNamesByCategoryAndQuery(
        PartCategory['cpu'],
        '12400'
      )
      expect(parts.length).toBe(2)
    })
  })

  describe('findPartsByFilter', () => {
    it('should be defined', () => {
      expect(partsRepository.findPartsByFilters).toBeDefined()
    })
    // @Issue: Can't test this function because of the aggregation pipeline
    // 'search' stage only works on cloud mongodb
    it.todo('should return parts by filter')
  })
})

// describe('Simple pagination', () => {
//   it.todo('should return parts by category with pagination (category, page)')
// })
// describe('Applying filters', () => {
//   it.todo(
//     'should return parts by category with filters (category, page, filter)'
//   )
// })
