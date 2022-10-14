import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { AuthModule } from 'src/auth/auth.module'
import { AuthService } from 'src/auth/auth.service'
import ConfigModule from 'src/common/modules/ConfigModule'
import { Role, User } from 'src/users/entities/User.entity'
import { UsersModule } from 'src/users/users.module'
import { UsersRepository } from 'src/users/users.repository'
import supertestRequest, { agent, SuperAgentTest } from 'supertest'
import { UserStub } from '__test__/stubs/user.stub'
import { UserStatus } from 'src/users/entities/User.entity'
import { Reflector } from '@nestjs/core'

describe('integration test: UsersModule', () => {
  let app: INestApplication
  let client: MongoClient
  let request: ReturnType<typeof supertestRequest>
  let usersRepository: UsersRepository
  let requestAgent: SuperAgentTest
  let authService: AuthService

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        ),
        ConfigModule,
        AuthModule,
        UsersModule
      ]
    }).compile()

    app = module.createNestApplication()
    app.use(cookieParser())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    )
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector))
    )

    await app.init()

    client = module.get(getClientToken())
    usersRepository = module.get(UsersRepository)
    authService = module.get(AuthService)
    request = supertestRequest(app.getHttpServer())
  })

  afterAll(async () => {
    await client.close()
    await app.close()
  })

  // mock email api
  beforeEach(() => {
    requestAgent = agent(app.getHttpServer())
    jest.clearAllMocks()
    jest
      .spyOn(authService, 'sendEmail')
      .mockImplementationOnce(() => Promise.resolve())
  })

  describe('GET /users', () => {
    describe('Status 200', () => {
      test('with valid user', async () => {
        // prepare user info
        const userStub = new User(UserStub())
        const { _id: userId, email, password, nickname } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)
        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)
        // get user info
        const { body } = await requestAgent.get('/users').expect(200)
        expect(body).toEqual(
          expect.objectContaining({
            _id: expect.stringMatching(userId.toHexString()),
            email: expect.stringMatching(email),
            nickname: expect.stringMatching(nickname),
            role: expect.stringMatching(Role.user)
          })
        )
      })
    })
    describe('Status 401', () => {
      test('without access token', async () => {
        await requestAgent.get('/users').expect(401)
      })
      test('with deleted user', async () => {
        // prepare user info
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)
        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)
        // delete user
        await usersRepository.deleteUser(userId)
        // get user info
        await requestAgent.get('/users').expect(401)
      })
    })
    describe('Status 403', () => {
      test('with blocked user', async () => {
        // prepare user info
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)
        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)
        // block user
        await usersRepository.updateUserByUserId(userId, {
          status: UserStatus.blocked
        })
        // get user info
        await requestAgent.get('/users').expect(403)
      })
    })
  })

  describe('POST /users', () => {
    describe('Status 201', () => {
      test('with valid request body', async () => {
        const res = await request
          .post('/users')
          .type('application/json')
          .send(UserStub())
          .expect(201)
      })
    })

    describe('Status 400', () => {
      test('with empty request body', async () => {
        await request.post('/users').expect(400)
      })
      test('with invalid request body (omit email)', async () => {
        const { email, ...rest } = UserStub()
        await request
          .post('/users')
          .type('application/json')
          .send(rest)
          .expect(400)
      })
      test('with un-matching password and passwordConfirm', async () => {
        const { passwordConfirm, ...rest } = UserStub()
        await request
          .post('/users')
          .type('application/json')
          .send({ ...rest, passwordConfirm: 'some other password' })
          .expect(400)
      })
    })

    describe('Status 409', () => {
      test('with existing email', async () => {
        const createUserDto = UserStub()

        await request
          .post('/users')
          .type('application/json')
          .send(createUserDto)
        const { body } = await request
          .post('/users')
          .type('application/json')
          // same email as the first request
          // but with a different nickname
          .send({ ...createUserDto, nickname: UserStub().nickname })
          .expect(409)

        expect(body).toEqual(
          expect.objectContaining({
            message: expect.stringMatching(/email already exists/i)
          })
        )
      })
      test('with existing nickname', async () => {
        const createUserDto = UserStub()
        await request
          .post('/users')
          .type('application/json')
          .send(createUserDto)
        const { body } = await request
          .post('/users')
          .type('application/json')
          // same nickname as the first user
          // but with a different email
          .send({ ...createUserDto, email: UserStub().email })
          .expect(409)

        expect(body).toEqual(
          expect.objectContaining({
            message: expect.stringMatching(/nickname already exists/i)
          })
        )
      })
    })
  })
  describe('PATCH /users', () => {
    describe('Status 204', () => {
      test('with valid access token and valid request body', async () => {
        // create user
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        await usersRepository.createUser(userStub)

        // verify user
        await usersRepository.verifyUser(userId)

        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)

        await requestAgent
          .patch('/users')
          .send({
            nickname: 'MasterChief',
            password,
            passwordConfirm: password
          })
          .expect(204)
      })
    })
    describe('Status 400', () => {
      test('with empty request body', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        await usersRepository.createUser(userStub)

        // verify user
        await usersRepository.verifyUser(userId)

        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)

        // request with invalid request body
        await requestAgent.patch('/users').send({}).expect(400)
      })

      test('with invalid request body', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        await usersRepository.createUser(userStub)

        // verify user
        await usersRepository.verifyUser(userId)

        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)

        // request with invalid request body
        await requestAgent
          .patch('/users')
          .send({
            nickname: 'a'.repeat(256)
          })
          .expect(400)
      })
    })
    describe('Status 401', () => {
      test('with invalid access token', async () => {
        // request without login
        await request
          .patch('/users')
          .send({
            nickname: 'MasterChief'
          })
          .expect(401)
      })
      test(`with deleted user's access token`, async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        await usersRepository.createUser(userStub)

        // verify user
        await usersRepository.verifyUser(userId)

        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)

        // delete user
        await usersRepository.deleteUser(userId)

        // request with invalid access token
        await requestAgent
          .patch('/users')
          .send({
            nickname: 'MasterChief'
          })
          .expect(401)
      })
    })
    describe('Status 403', () => {
      test('with blocked user', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)

        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)

        // block user
        await usersRepository.updateUserByUserId(userId, {
          status: UserStatus.blocked
        })

        // request with valid credentials but user is blocked
        await requestAgent
          .patch('/users')
          .send({
            nickname: 'MasterChief'
          })
          .expect(403)
      })
    })
    describe('Status 409', () => {
      test('with existing nickname', async () => {
        // create user 1
        const userStub1 = new User(UserStub())
        const { nickname: userOneNickname } = userStub1
        await usersRepository.createUser(userStub1)

        // create user 2
        const userStub2 = new User(UserStub())
        const { _id: userId, email, password } = userStub2
        await usersRepository.createUser(userStub2)
        // verify user 2
        await usersRepository.verifyUser(userId)

        // login with user 2 credentials
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)

        // request with user 1's nickname which is already taken
        await requestAgent
          .patch('/users')
          .send({
            nickname: userOneNickname,
            password,
            passwordConfirm: password
          })
          .expect(409)
      })
    })
  })

  describe('DELETE /users', () => {
    describe('Status 204', () => {
      test('with valid access token', async () => {
        // prepare user info
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)
        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)
        // delete user
        await requestAgent.delete('/users').expect(204)
      })
    })
    describe('Status 401', () => {
      test('without access token', async () => {
        await request.delete('/users').expect(401)
      })
      test('with deleted user', async () => {
        // prepare user info
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)
        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({
            email,
            password
          })
          .expect(200)
        // delete user
        await usersRepository.deleteUser(userId)
        // delete again? kkk
        await requestAgent.delete('/users').expect(401)
      })
    })
    describe('Status 403', () => {
      test('with blocked user', async () => {
        // prepare user info
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)
        // login
        await requestAgent
          .post('/login')
          .type('application/json')
          .send({ email, password })
          .expect(200)
        // block user
        await usersRepository.updateUserByUserId(userId, {
          status: UserStatus.blocked
        })
        // delete user
        await requestAgent.delete('/users').expect(403)
      })
    })
  })
})
