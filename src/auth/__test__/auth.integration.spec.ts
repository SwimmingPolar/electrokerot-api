import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { AuthModule } from 'src/auth/auth.module'
import { AuthService } from 'src/auth/auth.service'
import ConfigModule from 'src/common/modules/ConfigModule'
import { Action } from 'src/tokens/entities/Token.entity'
import { TokensRepository } from 'src/tokens/tokens.repository'
import { TokensService } from 'src/tokens/tokens.service'
import { User, UserStatus } from 'src/users/entities/User.entity'
import { UsersRepository } from 'src/users/users.repository'
import supertestRequest from 'supertest'
import { UserStub } from '__test__/stubs/user.stub'

describe('integration test: AuthModule', () => {
  let app: INestApplication
  let client: MongoClient
  let request: ReturnType<typeof supertestRequest>
  let usersRepository: UsersRepository
  let tokensRepository: TokensRepository
  let tokensService: TokensService
  let authService: AuthService

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        ),
        ConfigModule,
        AuthModule
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

    await app.init()

    client = module.get(getClientToken())
    usersRepository = module.get(UsersRepository)
    tokensRepository = module.get(TokensRepository)
    tokensService = module.get(TokensService)
    authService = module.get(AuthService)

    request = supertestRequest(app.getHttpServer())
  })

  afterAll(async () => {
    await client.close()
    await app.close()
  })

  // mock email api
  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .spyOn(authService, 'sendEmail')
      .mockImplementationOnce(() => Promise.resolve())
  })

  describe('POST /login', () => {
    describe('Status 200', () => {
      test('with valid credentials, should return an user object', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user and
        // directly verify user through users repository
        await usersRepository.createUser(userStub)
        await usersRepository.verifyUser(userId)

        const { body } = await request
          .post('/login')
          .type('application/json')
          .send({ email, password })
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            _id: expect.any(String),
            nickname: expect.any(String)
          })
        )
      })
      test('with valid credentials, should contain set cookie header containing access token', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user and
        // directly verify user through users repository
        await usersRepository.createUser(userStub)
        await usersRepository.verifyUser(userId)

        const { headers } = await request
          .post('/login')
          .type('application/json')
          .send({ email, password })
          .expect(200)

        expect(headers['set-cookie']).toEqual(
          expect.arrayContaining([expect.any(String)])
        )
      })
    })
    describe('Status 400', () => {
      test('with invalid request body', async () => {
        await request
          .post('/login')
          .type('application/json')
          .send({ email: 'invalid' })
          .expect(400)
      })
    })
    describe('Status 401', () => {
      test('with invalid credentials', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email } = userStub
        // create user and
        // directly verify user through users repository
        await usersRepository.createUser(userStub)
        await usersRepository.verifyUser(userId)

        await request
          .post('/login')
          .type('application/json')
          .send({ email, password: 'invalid_password' })
          .expect(401)
      })
    })
    describe('Status 403', () => {
      test('with restricted credentials, such as unverified, blocked account', async () => {
        const userStub = new User(UserStub())
        const { email, password } = userStub
        // create user and
        await usersRepository.createUser(userStub)

        await request
          .post('/login')
          .type('application/json')
          .send({ email, password })
          .expect(403)
      })
    })
  })
  describe('GET /logout', () => {
    describe('Status 204', () => {
      test('without login', async () => {
        await request.get('/logout').expect(204)
      })
      test('with valid credentials', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email, password } = userStub
        // create user and
        // directly verify user through users repository
        await usersRepository.createUser(userStub)
        await usersRepository.verifyUser(userId)

        await request
          .post('/login')
          .type('application/json')
          .send({ email, password })
          .expect(200)
        request.get('/logout').expect(204)
      })
      test('with multiple requests without credentials', async () => {
        await request.get('/logout').expect(204)
        await request.get('/logout').expect(204)
        await request.get('/logout').expect(204)
      })
    })
  })
  describe('GET /verify', () => {
    describe('Status 204', () => {
      test('with valid query parameter', async () => {
        const userStub = new User(UserStub())
        const { email } = userStub
        // create user
        await usersRepository.createUser(userStub)

        await request.get('/verify').query({ email }).expect(204)
      })
      test('with non-existing user email', async () => {
        await request
          .get('/verify')
          .query({ email: 'MasterChief@halo.com' })
          .expect(204)
      })
    })
    describe('Status 400', () => {
      test('with invalid query parameter', async () => {
        await request.get('/verify').query({ email: 'invalid' }).expect(400)
      })
    })
    describe('Status 429', () => {
      test('with multiple requests: 3 times in a row', async () => {
        // send request 5 times in a row
        await request.get('/verify').query({ email: 'MasterChief@halo.com' })
        await request.get('/verify').query({ email: 'MasterChief@halo.com' })
        await request.get('/verify').query({ email: 'MasterChief@halo.com' })
        await request.get('/verify').query({ email: 'MasterChief@halo.com' })
        await request.get('/verify').query({ email: 'MasterChief@halo.com' })
        // should get 403 after 5 requests
        await request
          .get('/verify')
          .query({ email: 'MasterChief@halo.com' })
          .expect(429)
      })
    })
  })
  describe('GET /verify/:token', () => {
    describe('Status 204', () => {
      test('with valid token', async () => {
        const userStub = new User(UserStub())
        const { _id: userId } = userStub
        // create user and
        await usersRepository.createUser(userStub)
        // issue verification token
        await tokensService.createToken(userId, Action.verification)

        // find token for this user
        let { tokenString } = await tokensRepository.findTokenByUserIdAndAction(
          userId,
          Action.verification
        )
        // encode token
        tokenString = encodeURIComponent(tokenString)

        await request.get(`/verify/${tokenString}`).expect(204)

        // After verification:
        // The user's status must be active
        const user = await usersRepository.findActiveUserByUserId(userId)
        expect(user.status).toEqual(UserStatus.active)
        // The token must be deleted
        const token = await tokensRepository.findTokenByTokenStringAndAction(
          tokenString,
          Action.verification
        )
        expect(token).toBeFalsy()
      })
    })
    describe('Status 400', () => {
      test('with invalid token', async () => {
        await request.get('/verify/invalid').expect(400)
      })
    })
    describe('Status 404', () => {
      test('without encodeURIComponent', async () => {
        // without encodeURIComponent, some token will be treated as url path
        const tokenString =
          '$2b$10$PaRTsgMrNGW2eZS22ISzjeKltt3pztEp0SVEJn294/iTVUGMiGK9a'
        await request.get(`/verify/${tokenString}`).expect(404)
      })
      test('with non-existing token', async () => {
        await request.get('/verify/' + 'a'.repeat(60)).expect(404)
      })
      test('with used token', async () => {
        const userStub = new User(UserStub())
        const { _id: userId } = userStub
        // create user and
        await usersRepository.createUser(userStub)
        // issue verification token
        await tokensService.createToken(userId, Action.verification)

        // find token for this user
        let { tokenString } = await tokensRepository.findTokenByUserIdAndAction(
          userId,
          Action.verification
        )
        // encode token
        tokenString = encodeURIComponent(tokenString)

        // verify user
        await request.get(`/verify/${tokenString}`).expect(204)
        // verify user again
        await request.get(`/verify/${tokenString}`).expect(404)
      })
    })
  })
  describe('POST /reset', () => {
    describe('Status 204', () => {
      test('with valid request body', async () => {
        const userStub = new User(UserStub())
        const { email } = userStub
        // create user
        await usersRepository.createUser(userStub)

        await request
          .post('/reset')
          .type('application/json')
          .send({ email })
          .expect(204)
      })
      test('with non-existing user email', async () => {
        await request
          .post('/reset')
          .type('application/json')
          .send({ email: 'MasterChief@halo.com' })
          .expect(204)
      })
      test('with deleted user email', async () => {
        const userStub = new User(UserStub())
        const { _id: userId, email } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // delete user
        await usersRepository.deleteUser(userId)

        await request
          .post('/reset')
          .type('application/json')
          .send({ email })
          .expect(204)
      })
    })
    describe('Status 400', () => {
      test('with invalid request body', async () => {
        await request
          .post('/reset')
          .type('application/json')
          .send({ email: 'invalid', age: 10 })
          .expect(400)
      })
    })
    describe('Status 429', () => {
      test('with multiple requests: 3 times in a row', async () => {
        const sendRequest = () =>
          request
            .post('/reset')
            .type('application/json')
            .send({ email: 'MasterChief@halo.com' })
        // send request 5 times in a row
        await sendRequest()
        await sendRequest()
        await sendRequest()
        await sendRequest()
        await sendRequest()
        // should get 403 after 5 requests
        await sendRequest().expect(429)
      })
    })
  })
  describe('POST /reset/:token', () => {
    describe('Status 204', () => {
      test('with valid token', async () => {
        const userStub = new User(UserStub())
        const { _id: userId } = userStub
        // create user
        await usersRepository.createUser(userStub)
        // verify user
        await usersRepository.verifyUser(userId)
        // issue reset token
        await tokensService.createToken(userId, Action.resetPassword)

        // find token for this user
        let { tokenString } = await tokensRepository.findTokenByUserIdAndAction(
          userId,
          Action.resetPassword
        )
        // encode token
        tokenString = encodeURIComponent(tokenString)

        const newPassword = 'a'.repeat(12)

        await request
          .post('/reset/' + tokenString)
          .type('application/json')
          .send({ password: newPassword, passwordConfirm: newPassword })
          .expect(204)

        userStub.password = newPassword
        await userStub.hashPassword()

        // After reset:
        // The token must be deleted
        const token = await tokensRepository.findTokenByTokenStringAndAction(
          tokenString,
          Action.resetPassword
        )
        expect(token).toBeFalsy()

        // Should be able to login with new password
        const { body } = await request
          .post('/login')
          .type('application/json')
          .send({
            email: userStub.email,
            password: newPassword
          })
          .expect(200)
        expect(body).toEqual(
          expect.objectContaining({
            _id: expect.any(String),
            nickname: expect.any(String)
          })
        )
      })
    })
    describe('Status 400', () => {
      test('with invalid token', async () => {
        await request.post('/reset/invalid').expect(400)
      })
    })
    describe('Status 404', () => {
      test('without encodeURIComponent', async () => {
        // without encodeURIComponent, some token will be treated as url path
        const tokenString =
          '$2b$10$PaRTsgMrNGW2eZS22ISzjeKltt3pztEp0SVEJn294/iTVUGMiGK9a'
        await request.get(`/reset/${tokenString}`).expect(404)
      })
      test('with non-existing token', async () => {
        await request.post('/reset/' + 'a'.repeat(60)).expect(400)
      })
      test('with used token', async () => {
        const userStub = new User(UserStub())
        const { _id: userId } = userStub
        // create user and
        await usersRepository.createUser(userStub)
        // issue reset token
        await tokensService.createToken(userId, Action.resetPassword)

        // find token for this user
        let { tokenString } = await tokensRepository.findTokenByUserIdAndAction(
          userId,
          Action.resetPassword
        )
        tokenString = encodeURIComponent(tokenString)

        const newPassword = 'a'.repeat(12)

        // send valid request
        await request
          .post('/reset/' + tokenString)
          .type('application/json')
          .send({ password: newPassword, passwordConfirm: newPassword })
          .expect(204)
        // send valid request again
        await request
          .post('/reset/' + tokenString)
          .type('application/json')
          .send({ password: newPassword, passwordConfirm: newPassword })
          .expect(404)
      })
    })
  })
})
