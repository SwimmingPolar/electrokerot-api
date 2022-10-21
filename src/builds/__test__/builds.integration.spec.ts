import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { Collection, MongoClient, ObjectId } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { agent, SuperAgentTest } from 'supertest'
import { UserStub } from '__test__/stubs/user.stub'
import { PartsStubs } from '../../../__test__/stubs/part.stub'
import { AuthModule } from '../../auth/auth.module'
import { AuthService } from '../../auth/auth.service'
import ConfigModule from '../../common/modules/ConfigModule'
import { MarketType } from '../../common/types'
import { Part } from '../../parts/entities/part.entity'
import { PartsModule } from '../../parts/parts.module'
import { User } from '../../users/entities/User.entity'
import { UsersModule } from '../../users/users.module'
import { UsersRepository } from '../../users/users.repository'
import { BuildsModule } from '../builds.module'
import { Build, FilterStatus } from '../entities/build.entity'

describe('integration test: BuildsModule', () => {
  let app: INestApplication
  let client: MongoClient
  let requestAgent: SuperAgentTest
  let authService: AuthService
  let usersRepository: UsersRepository
  let partsCollection: Collection<Part>

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        ),
        ConfigModule,
        AuthModule,
        UsersModule,
        BuildsModule,
        PartsModule
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
    app.useGlobalInterceptors(app.get(Reflector))

    await app.init()

    client = module.get(getClientToken())
    authService = module.get(AuthService)
    usersRepository = module.get(UsersRepository)
    partsCollection = client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('parts')
  })

  // TEST SETUP
  beforeAll(async () => {
    // mock email service
    jest
      .spyOn(authService, 'sendEmail')
      .mockImplementation(() => Promise.resolve())
    // insert dummy parts data
    await partsCollection.bulkWrite(
      Object.keys(PartsStubs).map(key => ({
        insertOne: PartsStubs[key]
      }))
    )
  })

  afterAll(async () => {
    // clear email service mock after all test
    jest.restoreAllMocks()
    await client.close()
    await app.close()
  })

  // get new agent for each test
  beforeEach(() => {
    requestAgent = agent(app.getHttpServer())
  })

  const createUser = async ({ verify }: { verify: boolean }) => {
    const userStub = new User(UserStub())
    const { password } = userStub
    await usersRepository.createUser(userStub)
    if (verify) {
      await usersRepository.verifyUser(userStub._id)
    }
    // override hashed password
    return { ...userStub, password }
  }
  const loginUser = async ({
    email,
    password
  }: {
    email: string
    password: string
  }) => {
    await requestAgent
      .post('/login')
      .type('application/json')
      .send({
        email,
        password
      })
      .expect(200)
  }

  describe('GET /builds', () => {
    describe('Status 200', () => {
      test('with valid user', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create builds
        await Promise.all(
          Array.from({ length: 3 }, () =>
            requestAgent.post('/builds').expect(201)
          )
        )
        // get all builds info
        const { body } = await requestAgent.get('/builds').expect(200)
        expect(body).toHaveLength(3)
      })
    })
    describe('Status 401', () => {
      test('without valid user credentials', async () => {
        // attempt to get all builds info without logging in
        await requestAgent.get('/builds').expect(401)
      })
    })
  })
  describe('POST /builds', () => {
    describe('Status 201', () => {
      test('with valid user credentials', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        const { body } = await requestAgent.post('/builds').expect(201)
        expect(body).toEqual(
          expect.objectContaining({
            _id: expect.any(String),
            owner: expect.any(String),
            name: expect.any(String),
            isSelected: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        )
      })
    })
    describe('Status 401', () => {
      test('without valid user credentials', async () => {
        // attempt to create build without logging in
        await requestAgent.post('/builds').expect(401)
      })
    })
    describe('Status 403', () => {
      // build limit: 10
      test('with excessive build limit', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create 10 builds
        await Promise.all(
          Array.from({ length: 10 }, () =>
            requestAgent.post('/builds').expect(201)
          )
        )
        // attempt to create 11th build
        await requestAgent.post('/builds').expect(403)
      })
    })
  })
  describe('POST /builds/:buildId/clone', () => {
    describe('Status 201', () => {
      test('with valid user', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create 3 builds
        await Promise.all(
          Array.from({ length: 3 }, () =>
            requestAgent.post('/builds').expect(201)
          )
        )

        // create build
        const { body: build } = await requestAgent.post('/builds').expect(201)
        // clone build
        const { body: clonedBuild } = await requestAgent
          .post(`/builds/${build._id}/clone`)
          .expect(201)
        expect(clonedBuild).toEqual(
          expect.objectContaining({
            _id: expect.any(String),
            owner: expect.any(String),
            name: expect.any(String),
            isSelected: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        )
        // build id should be different
        expect(build._id).not.toEqual(clonedBuild._id)
        // created/updated dates should be updated
        expect(build.createdAt).not.toEqual(clonedBuild.createdAt)
        expect(build.updatedAt).not.toEqual(clonedBuild.updatedAt)

        // get all builds info (should be 4)
        const { body: builds } = await requestAgent.get('/builds').expect(200)
        // make sure cloned build is selected
        builds.forEach((build: Build) => {
          if (build._id === clonedBuild._id) {
            expect(build.isSelected).toBe(true)
          } else {
            expect(build.isSelected).toBe(false)
          }
        })
      })
    })
    describe('Status 400', () => {
      test('with invalid build id', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // attempt to clone build with invalid id
        await requestAgent.post('/builds/123/clone').expect(400)
      })
    })
    describe('Status 401', () => {
      test('without valid user credentials', async () => {
        // attempt to clone build without logging in
        await requestAgent.post('/builds/123/clone').expect(401)
      })
    })
    describe('Status 403', () => {
      // build limit: 10
      test('with excessive build limit', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create 10 builds
        await Promise.all(
          Array.from({ length: 10 }, () =>
            requestAgent.post('/builds').expect(201)
          )
        )
        // get all builds info
        const { body: builds } = await requestAgent.get('/builds').expect(200)
        const lastBuild: Build = builds[builds.length - 1]
        // try to clone 10th build which will be 11th build
        await requestAgent.post(`/builds/${lastBuild._id}/clone`).expect(403)
      })
    })
    describe('Status 404', () => {
      test(`with someone else's build id`, async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: build } = await requestAgent.post('/builds').expect(201)

        // create another user
        const { email: email2, password: password2 } = await createUser({
          verify: true
        })
        await loginUser({ email: email2, password: password2 })

        // attempt to clone build with another user's id
        await requestAgent.post(`/builds/${build._id}/clone`).expect(404)
      })
    })
  })
  describe('PATCH /builds/:buildId', () => {
    describe('Status 204', () => {
      describe('With valid user credentials, build id and part id', () => {
        test('create 3 builds and select the first build', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create 3 builds
          await Promise.all(
            Array.from({ length: 3 }, () =>
              requestAgent.post('/builds').expect(201)
            )
          )
          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // select first build
          const firstBuild: Build = builds[0]
          await requestAgent
            .patch(`/builds/${firstBuild._id}`)
            .send({ isSelected: true })
            .expect(204)

          // get all builds info
          const { body: updatedBuilds } = await requestAgent
            .get('/builds')
            .expect(200)
          // make sure first build is selected
          updatedBuilds.forEach((build: Build) => {
            if (build._id === firstBuild._id) {
              expect(build.isSelected).toBe(true)
            } else {
              expect(build.isSelected).toBe(false)
            }
          })
        })
        test('change name of the build', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: build } = await requestAgent.post('/builds').expect(201)
          // update build name
          await requestAgent
            .patch(`/builds/${build._id}`)
            .send({ name: 'new name' })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure build name is updated
          builds.forEach((build: Build) => {
            if (build._id === build._id) {
              expect(build.name).toBe('new name')
            }
          })
        })
        test('add valid cpu to the build', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          // update build cpu
          const { cpu } = PartsStubs
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'cpu', partId: cpu._id.toHexString() }
            })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure cpu is updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              expect(build.parts.cpu.partId).toBe(cpu._id.toHexString())
              expect(build.parts.cpu.count).toBe(1)
            }
          })
        })
        test('add custom part to build and change its price', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          // add custom part to build
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'cpu', name: 'cpu from mars' }
            })
            .expect(204)
          // change its price
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'cpu', price: 1000000 }
            })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure cpu is updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              // check count (should be 1 by default)
              expect(build.parts.cpu.count).toBe(1)
              expect(build.parts.cpu.name).toBe('cpu from mars')
              expect(build.parts.cpu.price).toBe(1000000)
            }
          })
        })
        test('change product count of the part', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          const { memory } = PartsStubs
          // update build memory
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'memory', partId: memory._id.toHexString() }
            })
            .expect(204)
          // change product count
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({ partInfo: { category: 'memory', count: 4 } })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure memory's count is updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              expect(build.parts.memory.count).toBe(4)
            }
          })
        })
        test('add custom part and valid part in in sequence, and check if the price and the count is reset', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          // add custom part to build
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'memory', name: 'memory from jupiter' }
            })
            .expect(204)
          // change count and price
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({ partInfo: { category: 'memory', count: 4 } })
            .expect(204)
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'memory', price: 32000 }
            })
            .expect(204)

          // add valid part to build
          const { memory } = PartsStubs
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'memory', partId: memory._id.toHexString() }
            })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure memory is updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              // count should be 1 by default
              expect(build.parts.memory.count).toBe(1)
              // name should be emptied when valid part is added
              expect(build.parts.memory.name).toBeFalsy()
              expect(build.parts.memory.partId).toBe(memory._id.toHexString())
            }
          })
        })
        test('change price and count first, and add custom part. Prior update should be maintained', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          // update build memory
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'memory', count: 4, price: 32000 }
            })
            .expect(204)
          // add custom part to build
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'memory', name: 'memory from jupiter' }
            })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure memory is updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              // when add custom part, count and price should not be reset
              expect(build.parts.memory.count).toBe(4)
              expect(build.parts.memory.price).toBe(32000)
              expect(build.parts.memory.name).toBe('memory from jupiter')
              expect(build.parts.memory.partId).toBeFalsy()
            }
          })
        })
        test('add vendor filters to the part', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          // add vendor filters

          const filters = [
            {
              vendorUrl: 'https://www.amazon.com',
              marketType: MarketType.cash,
              status: FilterStatus.excluded
            },
            {
              vendorUrl: 'https://www.newegg.com',
              marketType: MarketType.mall,
              status: FilterStatus.included
            }
          ]
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: {
                category: 'memory',
                filters
              }
            })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure vendor filters are updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              expect(build.parts.memory.filters).toEqual(filters)
            }
          })
        })
        test(`add vendor filters and change filters to see if it's replaced with new filters`, async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          // add vendor filters

          const filters = [
            {
              vendorUrl: 'https://www.amazon.com',
              marketType: MarketType.cash,
              status: FilterStatus.excluded
            },
            {
              vendorUrl: 'https://www.newegg.com',
              marketType: MarketType.mall,
              status: FilterStatus.included
            }
          ]
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: {
                category: 'memory',
                filters
              }
            })
            .expect(204)

          // get all builds info
          let { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure vendor filters are updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              expect(build.parts.memory.filters).toEqual(filters)
            }
          })

          // change filters
          const newFilters = [
            {
              vendorUrl: 'https://www.amazon.com',
              marketType: MarketType.cash,
              status: FilterStatus.included
            },
            {
              vendorUrl: 'https://www.newegg.com',
              marketType: MarketType.mall,
              status: FilterStatus.excluded
            },
            {
              vendorUrl: 'https://www.ebay.com',
              marketType: MarketType.openMarket,
              status: FilterStatus.included
            }
          ]
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: {
                category: 'memory',
                filters: newFilters
              }
            })
            .expect(204)

          // get all builds info
          ;({ body: builds } = await requestAgent.get('/builds').expect(200))
          // make sure vendor filters are updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              expect(build.parts.memory.filters).toEqual(newFilters)
            }
          })
        })
        test('add optimized combination to the build', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          const optimization = {
            hash: '67b69634f9880a282c14a0f0cb7ba20cf5d677e9',
            lowestPrice: {
              cpu: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              motherboard: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              memory: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              graphics: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              ssd: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              hdd: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              case: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              power: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              cpuCooler: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              systemCooler: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              }
            },
            leastPackage: {
              cpu: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              motherboard: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              memory: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              graphics: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              ssd: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              hdd: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              case: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              power: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              cpuCooler: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              },
              systemCooler: {
                marketType: 'openMarket',
                vendorUrl: 'http://example.com'
              }
            }
          }
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              optimization
            })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure optimized combination is updated
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              expect(build.optimization.hash).toEqual(optimization.hash)
              Object.keys(build.optimization.lowestPrice).forEach(part =>
                expect(build.optimization.lowestPrice[part]).toEqual(
                  optimization.lowestPrice[part]
                )
              )
              Object.keys(build.optimization.leastPackage).forEach(part =>
                expect(build.optimization.leastPackage[part]).toEqual(
                  optimization.leastPackage[part]
                )
              )
            }
          })
        })
        test('delete part', async () => {
          const { email, password } = await createUser({ verify: true })
          await loginUser({ email, password })

          // create build
          const { body: currentBuild } = await requestAgent
            .post('/builds')
            .expect(201)
          const { memory } = PartsStubs
          // update build memory
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({
              partInfo: { category: 'memory', partId: memory._id.toHexString() }
            })
            .expect(204)
          // delete build memory
          // to delete a part, delete flag should be true
          await requestAgent
            .patch(`/builds/${currentBuild._id}`)
            .send({ partInfo: { category: 'memory', delete: true } })
            .expect(204)

          // get all builds info
          const { body: builds } = await requestAgent.get('/builds').expect(200)
          // make sure memory is deleted
          builds.forEach((build: Build) => {
            if (currentBuild._id === build._id) {
              expect(build.parts.memory).toBeFalsy()
            }
          })
        })
      })
    })
    describe('Status 400', () => {
      test('with empty body', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: currentBuild } = await requestAgent
          .post('/builds')
          .expect(201)
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({})
          .expect(400)
      })
      test('with invalid build id', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // try to update build name with invalid build id
        await requestAgent
          .patch(`/builds/${new ObjectId().toHexString()}`)
          .send({
            name: 'new name'
          })
          .expect(404)
      })
      test('with mismatching category and part id', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: currentBuild } = await requestAgent
          .post('/builds')
          .expect(201)

        // try to update build part with mismatching category and part id
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({
            partInfo: {
              category: 'memory',
              partId: PartsStubs.cpu._id.toHexString()
            }
          })
          .expect(400)
      })
      // cpu: 1, motherboard: 1, memory: 8, storage: 4, graphics: 1, power: 1, case: 1, cooler: 32, reserved: 1
      test('with invalid count value (custom part/reserved part/part with count limit)', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: currentBuild } = await requestAgent
          .post('/builds')
          .expect(201)

        // try to update build part with invalid count value
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({
            partInfo: {
              category: 'cpu',
              count: 2
            }
          })
          .expect(400)
      })
      // Should not be able to change name and the price of a part that is considered as valid part
      // Name and price should be inferred from the part itself, not from the build
      // It is only allowed when the part is a custom part
      test('when trying to change the price of the part with valid part id', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: currentBuild } = await requestAgent
          .post('/builds')
          .expect(201)

        // try to update build part with invalid count value
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({
            partInfo: {
              category: 'cpu',
              partId: PartsStubs.cpu._id.toHexString(),
              price: 100
            }
          })
          .expect(400)
      })
      test('when both partId and name is provided', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: currentBuild } = await requestAgent
          .post('/builds')
          .expect(201)

        // try to update build part with invalid count value
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({
            partInfo: {
              category: 'cpu',
              partId: PartsStubs.cpu._id.toHexString(),
              name: 'new name'
            }
          })
          .expect(400)
      })
      // not allowed to change the name and the price of a part that is considered as valid part
      test('add valid part to the build and try to change the name or the price', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: currentBuild } = await requestAgent
          .post('/builds')
          .expect(201)

        // add valid part to the build
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({
            partInfo: {
              category: 'cpu',
              partId: PartsStubs.cpu._id.toHexString()
            }
          })
          .expect(204)

        // try to change the name or the price of the valid part
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({
            partInfo: {
              category: 'cpu',
              name: 'new name'
            }
          })
          .expect(400)
      })
    })
    describe('Status 401', () => {
      test('without valid user credentials', async () => {
        // try to get the list of builds without logging in
        await requestAgent.get('/builds').expect(401)
      })
    })
    describe('Status 404', () => {
      test('with non-existing build id', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // try to update build name with non-existing build id
        await requestAgent
          .patch(`/builds/${new ObjectId().toHexString()}`)
          .send({
            name: 'new name'
          })
          .expect(404)
      })
      test(`with someone else's build id`, async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: currentBuild } = await requestAgent
          .post('/builds')
          .expect(201)

        // create another user
        const { email: email2, password: password2 } = await createUser({
          verify: true
        })
        await loginUser({ email: email2, password: password2 })

        // try to update build name with someone else's build id
        await requestAgent
          .patch(`/builds/${currentBuild._id}`)
          .send({
            name: 'new name'
          })
          .expect(404)
      })
    })
  })
  describe('DELETE /builds/:buildId', () => {
    describe('Status 204', () => {
      test('with valid user and build id', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create 2 build
        await requestAgent.post('/builds').expect(201)
        const { body: build } = await requestAgent.post('/builds').expect(201)
        // delete build
        await requestAgent.delete(`/builds/${build._id}`).expect(204)
        // get all builds info (should be 0)
        const { body: builds } = await requestAgent.get('/builds').expect(200)
        expect(builds).toHaveLength(1)
      })
      test('try to delete the only build left', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create 1 build
        const { body: build } = await requestAgent.post('/builds').expect(201)
        // delete build
        await requestAgent.delete(`/builds/${build._id}`).expect(204)
        await requestAgent.delete(`/builds/${build._id}`).expect(204)
        await requestAgent.delete(`/builds/${build._id}`).expect(204)
        // get all builds info (should be 0)
        const { body: builds } = await requestAgent.get('/builds').expect(200)
        expect(builds).toHaveLength(1)
        expect(build._id).toEqual(builds[0]._id)
      })
      test(`with someone else's build id`, async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // create build
        const { body: build } = await requestAgent.post('/builds').expect(201)

        // create another user
        const { email: email2, password: password2 } = await createUser({
          verify: true
        })
        await loginUser({ email: email2, password: password2 })

        // attempt to delete build with another user's id
        await requestAgent.delete(`/builds/${build._id}`).expect(204)
      })
    })
    describe('Status 400', () => {
      test('with invalid build id', async () => {
        const { email, password } = await createUser({ verify: true })
        await loginUser({ email, password })

        // attempt to delete build with invalid id
        await requestAgent.delete('/builds/123').expect(400)
      })
    })
    describe('Status 401', () => {
      test('without valid user credentials', async () => {
        // attempt to delete build without logging in
        await requestAgent.delete('/builds/123').expect(401)
      })
    })
  })
})
