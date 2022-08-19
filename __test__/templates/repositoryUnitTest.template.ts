import { Test } from '@nestjs/testing'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'

describe('unit test: RepositoryName', () => {
  let client: MongoClient
  // let someRepository: SomeRepository

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
        // Your repository imports here
        // providers: [SomeRepository]
      ]
    }).compile()

    client = module.get(getClientToken())
    // repository = module.get(SomeRepository)
  })

  afterAll(async () => {
    await client.close()
  })

  beforeEach(async () => {
    // some routine here
  })

  describe('Methods', () => {
    it.todo('should be defined')
  })
})
