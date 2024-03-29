import { Test } from '@nestjs/testing'
import { Collection, MongoClient } from 'mongodb'
import { getClientToken, MongoModule } from 'nest-mongodb'
import { SynonymsDocuments } from '../../../__test__/stubs/synonyms.stub'
import { Synonyms, SynonymsRepository } from '../synonyms.repository'
import { SynonymsService } from '../synonyms.service'

describe('unit test: Synonyms Module', () => {
  let client: MongoClient
  let synonymsCollection: Collection<Synonyms>
  let synonymsService: SynonymsService

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongoModule.forRoot(
          globalThis.__MONGO_URI__,
          globalThis.__MONGO_DB_NAME__
        )
      ],
      providers: [SynonymsService, SynonymsRepository]
    }).compile()

    client = module.get(getClientToken())
    synonymsService = module.get(SynonymsService)
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
    it('should return query sotring replaced with appropriate synonyms', async () => {
      // #1
      let original = 'ZOTAC GAMING 지포스 RTX 4090'.toLowerCase()
      let incoming = '조택 게이밍 지포스 RTX 4090'
      let result = (
        await synonymsService.replaceQueryWithSynonyms(incoming)
      )?.toLowerCase()
      expect(result).toEqual(original)

      // #2
      original = 'ASUS ROG STRIX LC II A B C'.toLowerCase()
      incoming = '아수스 로그 스트릭스 LC II A B C'
      result = (
        await synonymsService.replaceQueryWithSynonyms(incoming)
      )?.toLowerCase()
      expect(result).toEqual(original)
    })
  })
})
