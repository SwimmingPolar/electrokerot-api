import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import supertestRequest from 'supertest'

describe('integration test: ModuleName', () => {
  let app: INestApplication
  let client: MongoClient
  let request: ReturnType<typeof supertestRequest>

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
        // Your unit test imports here
        // SomeModule
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
  })

  afterAll(async () => {
    await client.close()
    await app.close()
  })

  // clear  collection before each test
  beforeEach(async () => {
    await client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('CollectionName')
      .deleteMany({})
  })

  describe('Method uri', () => {
    describe('Status Code', () => {
      it.todo('your test case')
    })
  })
})
