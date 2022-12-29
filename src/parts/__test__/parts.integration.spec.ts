import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Collection, MongoClient, ObjectId } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import supertestRequest from 'supertest'
import { PartsStubs } from '../../../__test__/stubs/part.stub'
import { SynonymsDocuments } from '../../../__test__/stubs/synonyms.stub'
import { SynonymsModule } from '../../synonyms/synonyms.module'
import { Synonyms } from '../../synonyms/synonyms.repository'
import { Part } from '../entities/part.entity'
import { PartsModule } from '../parts.module'
import { PartsRepository } from '../parts.repository'

describe('integration test: PartsModule', () => {
  let app: INestApplication
  let client: MongoClient
  let request: ReturnType<typeof supertestRequest>
  let partsCollection: Collection<Part>
  let partsRepository: PartsRepository
  let synonymsCollection: Collection<Synonyms>

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        ),
        PartsModule,
        SynonymsModule
      ]
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    )
    await app.init()

    client = module.get(getClientToken())
    request = supertestRequest(app.getHttpServer())
    partsCollection = client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('parts')
    partsRepository = module.get(PartsRepository)
  })

  // TEST SETUP
  beforeAll(async () => {
    // insert dummy parts data
    await partsCollection.bulkWrite(
      Object.keys(PartsStubs).map(key => ({
        insertOne: PartsStubs[key]
      }))
    )
    // insert synonyms
    synonymsCollection = client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('synonyms')
    await synonymsCollection.insertMany(SynonymsDocuments)
  })

  afterAll(async () => {
    await client.close()
    await app.close()
  })

  describe('GET /parts/{ids}', () => {
    describe('Status 200', () => {
      test('with one valid partId', async () => {
        const { cpu } = PartsStubs
        const { body } = await request
          .get(`/parts?ids=${cpu._id.toHexString()}`)
          .expect(200)

        // with 1 request, we should get 1 part
        expect(body).toHaveLength(1)
        // check if the part is the same as the one we inserted
        body.forEach((part: Part) =>
          expect(part.name.fullName).toBe(cpu.name.fullName)
        )
      })
      test('with multiple valid partIds', async () => {
        const { cpu, motherboard, memory } = PartsStubs
        const partIds = [cpu, motherboard, memory].map(part =>
          part._id.toHexString()
        )
        const { body } = await request
          .get(`/parts?ids=${partIds.join(',')}`)
          .expect(200)

        // with 3 requests, we should get 3 parts
        expect(body).toHaveLength(3)
        // check if the parts are the same as the ones we inserted
        body.forEach((part: Part) => {
          let currentPart
          switch (part.category) {
            case 'cpu':
              currentPart = cpu
              break
            case 'motherboard':
              currentPart = motherboard
              break
            case 'memory':
              currentPart = memory
              break
          }
          expect(part.name.fullName).toBe(currentPart.name.fullName)
        })
      })
      test('with 10 valid partIds', async () => {
        // ids will be 10 valid ids
        const partIds = Object.keys(PartsStubs).map(key =>
          PartsStubs[key]._id.toHexString()
        )

        await request.get(`/parts?ids=${partIds.join(',')}`).expect(200)
      })
      // test with partIds that are not in the database
      test('with one valid partId and another one with valid partId but not in the db', async () => {
        const { cpu } = PartsStubs
        const { body } = await request
          .get(
            `/parts?ids=${cpu._id.toHexString()},${new ObjectId().toHexString()}`
          )
          .expect(200)

        // with 2 requests, we should get 1 part
        expect(body).toHaveLength(1)
        // check if the part is the same as the one we inserted
        body.forEach((part: Part) =>
          expect(part.name.fullName).toBe(cpu.name.fullName)
        )
      })
    })
    describe('Status 400', () => {
      test('with invalid partId', async () => {
        await request.get('/parts?ids=123').expect(400)
      })
      test('with one valid partId and other with invalid partId', async () => {
        const { cpu } = PartsStubs
        await request.get(`/parts?ids=${cpu._id.toHexString()},123`).expect(400)
      })
      test('with 10 valid partIds plus another which exceeds the limit of max ids in one request', async () => {
        // ids will be 10 valid ids
        const partIds = Object.keys(PartsStubs).map(key =>
          PartsStubs[key]._id.toHexString()
        )
        // plus one more id
        partIds.push(new ObjectId().toHexString())

        await request.get(`/parts?ids=${partIds.join(',')}`).expect(400)
      })
    })
  })
  describe('GET /parts/searchQueries', () => {
    describe('Status 200', () => {
      test('with keyword that matches some parts in the db', async () => {
        // mock results
        jest
          .spyOn(partsRepository, 'findPartsNamesByCategoryAndQuery')
          .mockResolvedValueOnce(Promise.resolve(['삼성전자 DDR4-3200']))

        // request
        const keyword = encodeURIComponent('ddr4')
        const { body } = await request
          .get(`/parts/searchQueries?category=memory&query=${keyword}`)
          .expect(200)

        expect(body).toHaveLength(1)
        expect(body[0]).toBe('삼성전자 DDR4-3200')
      })
      test(`with keyword that doesn't match any parts in the db`, async () => {
        // mock results
        jest
          .spyOn(partsRepository, 'findPartsNamesByCategoryAndQuery')
          .mockResolvedValueOnce(Promise.resolve([]))
        const keyword = encodeURIComponent('hello from the other side~ !%oo%!')
        const { body } = await request
          .get(`/parts/searchQueries?category=memory&query=${keyword}`)
          .expect(200)

        expect(body).toHaveLength(0)
      })
    })
    describe('Status 400', () => {
      // test without category
      test('without category', async () => {
        const keyword = encodeURIComponent('ddr4')
        await request.get(`/parts/searchQueries?query=${keyword}`).expect(400)
      })
      // test without query
      test('without query', async () => {
        await request.get(`/parts/searchQueries?category=memory`).expect(400)
      })
      // test with invalid category
      test('with invalid category', async () => {
        const keyword = encodeURIComponent('ddr4')
        await request
          .get(`/parts/searchQueries?category=invalid&query=${keyword}`)
          .expect(400)
      })
      test('with very long query keyword', async () => {
        const keyword = encodeURIComponent('a'.repeat(101))
        await request
          .get(`/parts/searchQueries?category=memory&query=${keyword}`)
          .expect(400)
      })
    })
  })
  describe('GET /parts/search', () => {
    describe('Status 200', () => {
      test('with just the category', async () => {
        const { body } = await request
          .get('/parts/search?category=cpu')
          .expect(200)

        expect(body).toHaveLength(1)
        expect(body[0].name.fullName).toBe(PartsStubs.cpu.name.fullName)
      })
      test('with category and page', async () => {
        const { body } = await request
          .get('/parts/search?category=cpu&page=1')
          .expect(200)

        expect(body).toHaveLength(1)
        expect(body[0].name.fullName).toBe(PartsStubs.cpu.name.fullName)
      })
      test('with category, page, query and filters', async () => {
        const mockedFn = jest.fn()
        jest
          .spyOn(partsRepository, 'findPartsByFilters')
          .mockImplementation(mockedFn)

        const filters = encodeURIComponent(
          JSON.stringify({
            제조회사: ['인텔', 'AMD'],
            '코어 수': ['8코어', '12코어'],
            'L3 캐시': ['~32MB', '64MB~128MB', '256MB~']
          })
        )

        await request.get(
          `/parts/search?category=cpu&page=1&query=
            ${encodeURIComponent('인텔 i5')}&filters=${filters}`
        )

        expect(mockedFn).toHaveBeenCalledWith({
          category: 'cpu',
          details: {
            'L3 캐시': {
              $or: [
                { $lte: 32 },
                { $and: [{ $gte: 64 }, { $lte: 128 }] },
                { $gte: 256 }
              ]
            },
            제조회사: { $in: [/인텔/i, /AMD/i] },
            '코어 수': { $in: [8, 12] }
          },
          keyword: '인텔 i5',
          page: 1
        })
      })
    })
    describe('Status 400', () => {
      test('without category', async () => {
        await request.get('/parts/search').expect(400)
      })
      test('with invalid category', async () => {
        await request.get('/parts/search?category=invalid').expect(400)
      })
      test('with very long query keyword', async () => {
        const keyword = encodeURIComponent('a'.repeat(101))
        await request
          .get(`/parts/search?category=memory&query=${keyword}`)
          .expect(400)
      })
      test('with very long filter key and value', async () => {
        const key = 'a'.repeat(101)
        const filters = encodeURIComponent(
          JSON.stringify({
            [key]: ['a'.repeat(101)]
          })
        )
        await request
          .get(`/parts/search?category=cpu&filters=${filters}`)
          .expect(400)
      })
      test('with very big page number', async () => {
        await request.get('/parts/search?category=cpu&page=10000').expect(400)
      })
    })
  })
})
