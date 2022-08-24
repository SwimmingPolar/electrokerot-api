import { Test } from '@nestjs/testing'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { Action } from 'src/tokens/entities/Token.entity'
import { TokensRepository } from 'src/tokens/tokens.repository'
import { TokenStub } from '__test__/stubs/token.stub'

describe('unit test: TokensRepository', () => {
  let client: MongoClient
  let tokensRepository: TokensRepository

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ],
      providers: [TokensRepository]
    }).compile()

    client = module.get(getClientToken())
    tokensRepository = module.get(TokensRepository)
  })

  afterAll(async () => {
    await client.close()
  })

  describe('createToken', () => {
    it('should be defined', () => {
      expect(tokensRepository.createToken).toBeDefined()
    })
    it('should return an object id', async () => {
      const tokenId = await tokensRepository.createToken(await TokenStub())
      expect(tokenId).not.toBeNull()
    })
  })

  describe('findTokenByUserIdAndAction', () => {
    it('should be defined', () => {
      expect(tokensRepository.findTokenByUserIdAndAction).toBeDefined()
    })
    it('should return a Token entity', async () => {
      const tokenStub = await TokenStub()
      await tokensRepository.createToken(tokenStub)
      const { owner, action } = tokenStub
      const result = await tokensRepository.findTokenByUserIdAndAction(
        owner,
        action
      )
      expect(result).not.toBeFalsy()
    })
    it('should return falsy if no token found', async () => {
      const { owner } = await TokenStub()
      // find token with wrong
      const result = await tokensRepository.findTokenByUserIdAndAction(
        owner,
        Action.resetPassword
      )
      expect(result).toBeFalsy()
    })
  })
  describe('findTokenByTokenStringAndAction', () => {
    it('should be defined', () => {
      expect(tokensRepository.findTokenByTokenStringAndAction).toBeDefined()
    })
    it('should return a Token entity', async () => {
      const tokenStub = await TokenStub()
      await tokensRepository.createToken(tokenStub)
      const { tokenString, action } = tokenStub
      const result = await tokensRepository.findTokenByTokenStringAndAction(
        tokenString,
        action
      )
      expect(result).not.toBeFalsy()
    })
    it('should return falsy if no token found', async () => {
      const { tokenString, action } = await TokenStub()
      const result = await tokensRepository.findTokenByTokenStringAndAction(
        tokenString,
        action
      )
      expect(result).toBeFalsy()
    })
  })

  describe('deleteTokenByTokenIdAndAction', () => {
    it('should be defined', () => {
      expect(tokensRepository.deleteTokenByTokenIdAndAction).toBeDefined()
    })
    it('should return 1', async () => {
      const tokenStub = await TokenStub()
      await tokensRepository.createToken(tokenStub)
      const { _id: tokenId, action } = tokenStub
      const result = await tokensRepository.deleteTokenByTokenIdAndAction(
        tokenId,
        action
      )
      expect(result).toBe(1)
    })
    it('should return 0', async () => {
      const tokenStub = await TokenStub()
      await tokensRepository.createToken(tokenStub)
      const { _id: tokenId } = tokenStub
      // delete token with wrong action
      const result = await tokensRepository.deleteTokenByTokenIdAndAction(
        tokenId,
        Action.resetPassword
      )
      expect(result).toBe(0)
    })
  })
})
