import { Test } from '@nestjs/testing'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'

describe('unit test: UnitName', () => {
  let client: MongoClient
  // let someService: SomeService
  // let someRepository: SomeRepository

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ]
      // Your repository imports here
      // providers: [SomeRepository, SomeService]
    }).compile()

    client = module.get(getClientToken())
    // repository = module.get(SomeRepository)
    // service = module.get(SomeService)
  })

  afterAll(async () => {
    await client.close()
  })

  // clear collection before each test
  beforeEach(async () => {
    await client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('CollectionName')
      .deleteMany({})
  })

  beforeEach(async () => {
    // some routine here
  })

  describe('Methods', () => {
    it.todo('should be defined')
  })
})
