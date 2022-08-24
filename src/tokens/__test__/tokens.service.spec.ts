import { Test } from '@nestjs/testing'
import { MongoClient, ObjectId } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { Action } from 'src/tokens/entities/Token.entity'
import { TokensRepository } from 'src/tokens/tokens.repository'
import { TokensService } from 'src/tokens/tokens.service'

describe('unit test: TokensService', () => {
  let client: MongoClient
  let tokensService: TokensService
  let tokensRepository: TokensRepository

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ],
      providers: [TokensRepository, TokensService]
    }).compile()

    client = module.get(getClientToken())
    tokensService = module.get(TokensService)
    tokensRepository = module.get(TokensRepository)
  })

  afterAll(async () => {
    await client.close()
  })

  beforeEach(async () => {
    // clear collection before each test
    await client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('tokens')
      .deleteMany({})
  })

  const owner = new ObjectId()
  const action = Action.verification

  describe('createToken', () => {
    it('should be defined', () => {
      expect(tokensService).toBeDefined()
    })
    it('should return a token', async () => {
      expect(await tokensService.createToken(owner, action)).not.toBeFalsy()
    })
    it('should return a token with an owner and an action', async () => {
      const token = await tokensService.createToken(owner, action)
      expect(token).toEqual(
        expect.objectContaining({
          owner,
          action
        })
      )
    })
    it('should return the same token if the same owner and action are passed', async () => {
      const token = await tokensService.createToken(owner, action)
      expect(await tokensService.createToken(owner, action)).toEqual(token)
    })
    it('should return a different token if ttl is passed', async () => {
      const token = await tokensService.createToken(owner, action)
      // simulate ttl expiration
      await tokensRepository.deleteTokenByTokenIdAndAction(token._id, action)
      // create a new token with the same owner and action
      expect(await tokensService.createToken(owner, action)).not.toEqual(token)
    })
  })

  describe('verifyToken', () => {
    it('should be defined', () => {
      expect(tokensService).toBeDefined()
    })
    it('should return owner id if the token is found and verified', async () => {
      const { tokenString } = await tokensService.createToken(owner, action)
      expect(
        await tokensService.verifyToken(tokenString, action)
      ).not.toBeFalsy()
    })
    it('should return falsy if the token is not valid', async () => {
      expect(
        await tokensService.verifyToken('invalid token', action)
      ).toBeFalsy()
    })
  })
})
