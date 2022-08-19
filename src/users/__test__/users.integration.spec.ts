import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { UsersModule } from 'src/users/users.module'
import supertestRequest from 'supertest'
import { createUserDtoStub } from '__test__/stubs/user.stub'

describe('Users Integration Test', () => {
  let app: INestApplication
  let client: MongoClient
  let request: ReturnType<typeof supertestRequest>

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        ),
        UsersModule
      ]
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    )
    client = module.get(getClientToken())

    await app.init()

    request = supertestRequest(app.getHttpServer())
  })

  afterAll(async () => {
    await client.close()
    await app.close()
  })

  // clear users collection before each test
  beforeEach(async () => {
    await client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('users')
      .deleteMany({})
  })

  describe('POST /users', () => {
    describe('Status 201', () => {
      test('with valid request body', async () => {
        request
          .post('/users')
          .type('application/json')
          .send(createUserDtoStub())
          .expect(201)
      })
    })

    describe('Status 400', () => {
      test('with empty request body', async () => {
        request.post('/users').expect(400)
      })
      test('with invalid request body (omit email)', async () => {
        const { email, ...rest } = createUserDtoStub()
        request.post('/users').type('application/json').send(rest).expect(400)
      })
      test('with un-matching password and passwordConfirm', async () => {
        const { passwordConfirm, ...rest } = createUserDtoStub()
        request
          .post('/users')
          .type('application/json')
          .send({ ...rest, passwordConfirm: 'some other password' })
          .expect(400)
      })
      test('with invalid email', async () => {
        const { email, ...rest } = createUserDtoStub()
        request
          .post('/users')
          .type('application/json')
          .send({ ...rest, email: 'invalid email' })
          .expect(400)
      })
      test('with very long nickname', async () => {
        const { nickname, ...rest } = createUserDtoStub()
        request
          .post('/users')
          .type('application/json')
          .send({ ...rest, nickname: 'a'.repeat(256) })
          .expect(400)
      })
    })

    describe('Status 409', () => {
      test('with existing email', async () => {
        const createUserDto = createUserDtoStub()
        await request
          .post('/users')
          .type('application/json')
          .send(createUserDto)
        await request
          .post('/users')
          .type('application/json')
          // same email as the first request
          // but with a different nickname
          .send({ ...createUserDto, nickname: 'MasterChief' })
          .expect(response => {
            expect(response.body).toEqual(
              expect.objectContaining({
                statusCode: 409,
                message: expect.stringMatching(/email already exists/i)
              })
            )
          })
      })
      test('with existing nickname', async () => {
        const createUserDto = createUserDtoStub()
        await request
          .post('/users')
          .type('application/json')
          .send(createUserDto)
        await request
          .post('/users')
          .type('application/json')
          // same nickname as the first user
          // but with a different email
          .send({ ...createUserDto, email: 'MasterChief@halo.com' })
          .expect(response => {
            expect(response.body).toEqual(
              expect.objectContaining({
                statusCode: 409,
                message: expect.stringMatching(/nickname already exists/i)
              })
            )
          })
      })
    })
  })
})
