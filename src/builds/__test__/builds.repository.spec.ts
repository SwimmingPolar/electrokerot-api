import { Test } from '@nestjs/testing'
import { MongoClient, ObjectId } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import {
  adjectives,
  animals,
  uniqueNamesGenerator
} from 'unique-names-generator'
import { BuildsRepository } from '../builds.repository'

describe('unit test: BuildsRepository', () => {
  let client: MongoClient
  let buildsRepository: BuildsRepository

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ],
      providers: [BuildsRepository]
    }).compile()

    client = module.get(getClientToken())
    buildsRepository = module.get(BuildsRepository)
  })

  afterAll(async () => {
    await client.close()
  })

  // generate random name
  const generateName = () =>
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: ' ',
      style: 'capital'
    })
  // create a build
  const createBuild = async (owner: ObjectId) =>
    await buildsRepository.createBuild({
      owner,
      name: generateName(),
      isSelected: true
    })
  const isValidObjectId = (_id: ObjectId) => ObjectId.isValid(_id)

  describe('createBuild', () => {
    it('should be defined', () => {
      expect(buildsRepository.createBuild).toBeDefined()
    })
    it('should return an object id', async () => {
      const buildId = await buildsRepository.createBuild({
        name: generateName(),
        isSelected: true
      })
      expect(isValidObjectId(buildId)).toBe(true)
    })
  })
  describe('updateBuildsByUserId', () => {
    it('should be defined', () => {
      expect(buildsRepository.updateBuildsByUserId).toBeDefined()
    })
    it('should update multiple builds by userId', async () => {
      // create owner
      const owner = new ObjectId()
      // create 3 builds
      await createBuild(owner)
      await createBuild(owner)
      const buildId = await createBuild(owner)
      expect(isValidObjectId(buildId)).toBe(true)
      // set all builds to be not selected and result should be 3
      const updateResult = await buildsRepository.updateBuildsByUserId(owner, {
        isSelected: false
      })
      expect(updateResult).toBe(3)
      // create a new build and is the only one selected
      await createBuild(owner)
      // find all builds by owner (4 builds)
      const builds = await buildsRepository.findBuildsByUserId(owner)
      const sum = builds.reduce((sum, build) => (build.isSelected ? 1 : 0), 0)
      expect(sum).toBe(1)
    })
  })
  describe('updateBuildByBuildId', () => {
    it('should be defined', () => {
      expect(buildsRepository.updateBuildByBuildId).toBeDefined()
    })
    it('should update a build by buildId', async () => {
      // create owner
      const owner = new ObjectId()
      // create a build
      const buildId = await createBuild(owner)
      expect(isValidObjectId(buildId)).toBe(true)
      // get created build info
      const build = await buildsRepository.findBuildByBuildId(buildId)
      // update build
      const name = generateName()
      const updateResult = await buildsRepository.updateBuildByBuildId(
        buildId,
        {
          name
        }
      )
      expect(updateResult).toBe(1)
      expect(build.name).not.toBe(name)
    })
  })
  describe('deleteBuildByBuildId', () => {
    it('should be defined', () => {
      expect(buildsRepository.deleteBuildByBuildId).toBeDefined()
    })
    it('should delete a build by buildId', async () => {
      // create owner
      const owner = new ObjectId()
      // create a build
      const buildId = await createBuild(owner)
      expect(isValidObjectId(buildId)).toBe(true)
      // delete build
      const deleteResult = await buildsRepository.deleteBuildByBuildId(buildId)
      expect(deleteResult).toBe(1)
      // get build info
      const build = await buildsRepository.findBuildByBuildId(buildId)
      expect(build).toBeFalsy()
    })
  })
  describe('getBuildByBuildId', () => {
    it('should be defined', () => {
      expect(buildsRepository.findBuildByBuildId).toBeDefined()
    })
    it('should return a build by buildId', async () => {
      // create owner
      const owner = new ObjectId()
      // create a build
      const buildId = await createBuild(owner)
      expect(isValidObjectId(buildId)).toBe(true)
      // get created build info
      const build = await buildsRepository.findBuildByBuildId(buildId)
      expect(build._id).toEqual(buildId)
    })
  })
  describe('findBuildsByUserId', () => {
    it('should be defined', () => {
      expect(buildsRepository.findBuildsByUserId).toBeDefined()
    })
    it('should return builds by userId', async () => {
      // create owner
      const owner = new ObjectId()
      // create 3 builds
      await createBuild(owner)
      await createBuild(owner)
      await createBuild(owner)
      // get created builds info
      const builds = await buildsRepository.findBuildsByUserId(owner)
      expect(builds.length).toBe(3)
    })
  })
  describe('findBuildsByBuildIdAndUserId', () => {
    it('should be defined', () => {
      expect(buildsRepository.findBuildByBuildIdAndUserId).toBeDefined()
    })
    it('should return a build by buildId and userId', async () => {
      // create owner
      const owner = new ObjectId()
      // create a build
      const buildId = await createBuild(owner)
      expect(isValidObjectId(buildId)).toBe(true)
      // get created build info
      const build = await buildsRepository.findBuildByBuildIdAndUserId(
        buildId,
        owner
      )
      expect(build._id).toEqual(buildId)
    })
  })
  describe('countBuildsByUserId', () => {
    it('should be defined', () => {
      expect(buildsRepository.countBuildsByUserId).toBeDefined()
    })
    it('should return count of builds by userId', async () => {
      // create owner
      const owner = new ObjectId()
      // create 3 builds
      await createBuild(owner)
      await createBuild(owner)
      await createBuild(owner)
      // get created builds info
      const count = await buildsRepository.countBuildsByUserId(owner)
      expect(count).toBe(3)
    })
  })
})
