import { Test } from '@nestjs/testing'
import { MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { User } from 'src/users/entities/User.entity'
import { UsersRepository } from 'src/users/users.repository'
import { UserStub } from '__test__/stubs/user.stub'

describe('unit test: UsersRepository', () => {
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

  // test repository methods
  describe('createUser', () => {
    it('should be defined', () => {
      expect(usersRepository.createUser).toBeDefined()
    })
    it('should return an object id', async () => {
      const userId = await usersRepository.createUser(new User(UserStub()))
      expect(userId).not.toBeFalsy()
    })
  })

  describe('verifyUserByUserId', () => {
    it('should be defined', () => {
      expect(usersRepository.verifyUser).toBeDefined()
    })
    it('should return 1', async () => {
      // create an user
      const userId = await usersRepository.createUser(new User(UserStub()))
      // verify user
      const result = await usersRepository.verifyUser(userId)
      expect(result).toBe(1)
    })
  })

  describe('deleteUser', () => {
    it('should be defined', () => {
      expect(usersRepository.deleteUser).toBeDefined()
    })
    it('should return 1', async () => {
      // create user
      const userId = await usersRepository.createUser(new User(UserStub()))
      // delete user
      const result = await usersRepository.deleteUser(userId)
      expect(result).toBe(1)
    })
  })

  describe('findActiveUserByUserId', () => {
    it('should be defined', () => {
      expect(usersRepository.findActiveUserByUserId).toBeDefined()
    })
    test('with unverified user, it should not return an User entity', async () => {
      // create user
      const userId = await usersRepository.createUser(new User(UserStub()))
      // try to find active user
      const user = await usersRepository.findActiveUserByUserId(userId)
      expect(user).toBeFalsy()
    })
    test('with verified user, it should return an User entity', async () => {
      // create and verify user
      const userId = await usersRepository.createUser(new User(UserStub()))
      await usersRepository.verifyUser(userId)
      // find active user
      const user = await usersRepository.findActiveUserByUserId(userId)
      expect(user).not.toBeFalsy()
    })
    it('should return null if user is deleted', async () => {
      // create user and delete user
      const userId = await usersRepository.createUser(new User(UserStub()))
      await usersRepository.deleteUser(userId)
      // try to find active user
      const user = await usersRepository.findActiveUserByUserId(userId)
      expect(user).toBeFalsy()
    })
  })

  describe('findValidUserByEmail', () => {
    it('should be defined', () => {
      expect(usersRepository.findValidUserByEmail).toBeDefined()
    })
    test('with verified user, it should return an User entity', async () => {
      // create and verify user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.verifyUser(userId)
      // find valid user
      const user = await usersRepository.findValidUserByEmail(userStub.email)
      expect(user).not.toBeFalsy()
    })
    test('with unverified user, it should also return an User entity', async () => {
      // create and verify user
      const userStub = new User(UserStub())
      await usersRepository.createUser(userStub)
      // try to find valid user
      const user = await usersRepository.findValidUserByEmail(userStub.email)
      expect(user).not.toBeFalsy()
    })
    it('should return null if user is deleted', async () => {
      // create and delete user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.deleteUser(userId)
      // try to find valid user
      const user = await usersRepository.findValidUserByEmail(userStub.email)
      expect(user).toBeFalsy()
    })
  })

  describe('findValidUserByNickname', () => {
    it('should be defined', () => {
      expect(usersRepository.findValidUserByNickname).toBeDefined()
    })
    test('with verified user, it should return an User entity', async () => {
      // create and verify user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.verifyUser(userId)
      // find valid user
      const user = await usersRepository.findValidUserByNickname(
        userStub.nickname
      )
      expect(user).not.toBeFalsy()
    })
    test('with unverified user, it should also return an User entity', async () => {
      const userStub = new User(UserStub())
      // create and verify user
      await usersRepository.createUser(userStub)
      // try to find valid user
      const user = await usersRepository.findValidUserByNickname(
        userStub.nickname
      )
      expect(user).not.toBeFalsy()
    })
    it('should return null if user is deleted', async () => {
      // create and delete user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.deleteUser(userId)
      // try to find valid user
      const user = await usersRepository.findValidUserByNickname(
        UserStub().nickname
      )
      expect(user).toBeFalsy()
    })
  })
  describe('findValidUserByUserId', () => {
    it('should be defined', () => {
      expect(usersRepository.findValidUserByUserId).toBeDefined()
    })
    test('with verified user, it should return an User entity', async () => {
      // create and verify user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.verifyUser(userId)
      // find valid user
      const user = await usersRepository.findValidUserByUserId(userId)
      expect(user).not.toBeFalsy()
    })
    test('with unverified user, it should also return an User entity', async () => {
      // create and verify user
      const userStub = new User(UserStub())
      await usersRepository.createUser(userStub)
      // try to find valid user
      const user = await usersRepository.findValidUserByUserId(userStub._id)
      expect(user).not.toBeFalsy()
    })
    it('should return null if user is deleted', async () => {
      // create and delete user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.deleteUser(userId)
      // try to find valid user
      const user = await usersRepository.findValidUserByUserId(userStub._id)
      expect(user).toBeFalsy()
    })
  })
  describe('updateUserByUserId', () => {
    it('should be defined', () => {
      expect(usersRepository.updateUserByUserId).toBeDefined()
    })
    test('with verified user, it should return an User entity', async () => {
      // create and verify user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.verifyUser(userId)
      // update user
      userStub.nickname = 'newNickname'
      const result = await usersRepository.updateUserByUserId(userId, userStub)
      expect(result).toBe(1)
    })
    test('with unverified user, it should also return an User entity', async () => {
      // create and verify user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      // update user
      userStub.nickname = 'newNickname'
      const result = await usersRepository.updateUserByUserId(userId, userStub)
      expect(result).toBe(1)
    })
    it('should return null if user is deleted', async () => {
      // create and delete user
      const userStub = new User(UserStub())
      const userId = await usersRepository.createUser(userStub)
      await usersRepository.deleteUser(userId)
      // try to update user
      userStub.nickname = 'newNickname'
      const result = await usersRepository.updateUserByUserId(userId, userStub)
      expect(result).toBe(0)
    })
  })
})
