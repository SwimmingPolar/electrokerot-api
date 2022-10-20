import { Test } from '@nestjs/testing'
import { Collection, MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { SynonymsDocuments } from '../../../__test__/stubs/synonyms.stub'
import { Synonyms, SynonymsRepository } from '../synonyms.repository'

describe('unit test: Synonyms repository', () => {
  let client: MongoClient
  let synonymsCollection: Collection<Synonyms>
  let synonymsRepository: SynonymsRepository

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ],
      providers: [SynonymsRepository]
    }).compile()

    client = module.get(getClientToken())
    synonymsRepository = module.get(SynonymsRepository)
  })

  // insert synonyms
  beforeAll(async () => {
    synonymsCollection = client
      .db(globalThis.__MONGO_DB_NAME__)
      .collection('synonyms')
    await synonymsCollection.insertMany(SynonymsDocuments)
  })

  afterAll(async () => {
    await client.close()
  })

  describe('replaceQueryWithSynonyms', () => {
    it('should return synonyms documents', async () => {
      const result = await synonymsRepository.findSynonyms(['아수스', '조택'])
      expect(result).toHaveLength(2)
    })
  })
})
