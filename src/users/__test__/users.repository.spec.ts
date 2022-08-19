import { Test } from '@nestjs/testing'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { UsersRepository } from 'src/users/users.repository'
import { userStub } from '__test__/stubs/user.stub'

describe('UsersRepository Unit Test', () => {
  let client: MongoClient
  let usersRepository: UsersRepository

  // setup
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ],
      providers: [UsersRepository]
    }).compile()

    client = module.get(getClientToken())
    usersRepository = module.get(UsersRepository)
  })

  afterAll(async () => {
    await client.close()
  })

  let userId: string
  beforeEach(async () => {
    // clear users collection before each test
    await client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('users')
      .deleteMany({})
    // create a single user for each test
    userId = await usersRepository.createUser(userStub())
  })

  // test repository methods
  describe('createUser', () => {
    it('should be defined', () => {
      expect(usersRepository.createUser).toBeDefined()
    })
    it('should return an object id', async () => {
      const userId = await usersRepository.createUser(userStub())
      expect(userId).not.toBeNull()
    })
  })

  describe('verifyUserByUserId', () => {
    it('should be defined', () => {
      expect(usersRepository.verifyUser).toBeDefined()
    })
    it('should return 1', async () => {
      const result = await usersRepository.verifyUser(userId)
      expect(result).toBe(1)
    })
  })

  describe('deleteUser', () => {
    it('should be defined', () => {
      expect(usersRepository.deleteUser).toBeDefined()
    })
    it('should return 1', async () => {
      const result = await usersRepository.deleteUser(userId)
      expect(result).toBe(1)
    })
  })

  describe('findActiveUserByUserId', () => {
    it('should be defined', () => {
      expect(usersRepository.findActiveUserByUserId).toBeDefined()
    })
    it('with unverified user, should not return an User entity', async () => {
      const user = await usersRepository.findActiveUserByUserId(userId)
      expect(user).toBeNull()
    })
    it('with verified user, should return an User entity', async () => {
      await usersRepository.verifyUser(userId)
      const user = await usersRepository.findActiveUserByUserId(userId)
      expect(user).not.toBeNull()
    })
    it('should return null if user is deleted', async () => {
      await usersRepository.deleteUser(userId)
      const user = await usersRepository.findActiveUserByUserId(userId)
      expect(user).toBeNull()
    })
  })

  describe('findValidUserByEmail', () => {
    it('should be defined', () => {
      expect(usersRepository.findValidUserByEmail).toBeDefined()
    })
    it('with unverified user, should return an User entity', async () => {
      const user = await usersRepository.findValidUserByEmail(userStub().email)
      expect(user).not.toBeNull()
    })
    it('with verified user, should also return an User entity', async () => {
      await usersRepository.verifyUser(userId)
      const user = await usersRepository.findValidUserByEmail(userStub().email)
      expect(user).not.toBeNull()
    })
    it('should return null if user is deleted', async () => {
      await usersRepository.deleteUser(userId)
      const user = await usersRepository.findValidUserByEmail(userStub().email)
      expect(user).toBeNull()
    })
  })

  describe('findValidUserByNickname', () => {
    it('should be defined', () => {
      expect(usersRepository.findValidUserByNickname).toBeDefined()
    })
    it('with unverified user, should return an User entity', async () => {
      const user = await usersRepository.findValidUserByNickname(
        userStub().nickname
      )
      expect(user).not.toBeNull()
    })
    it('with verified user, should also return an User entity', async () => {
      await usersRepository.verifyUser(userId)
      const user = await usersRepository.findValidUserByNickname(
        userStub().nickname
      )
      expect(user).not.toBeNull()
    })
    it('should return null if user is deleted', async () => {
      await usersRepository.deleteUser(userId)
      const user = await usersRepository.findValidUserByNickname(
        userStub().nickname
      )
      expect(user).toBeNull()
    })
  })
})
