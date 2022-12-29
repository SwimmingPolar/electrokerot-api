import { Injectable } from '@nestjs/common'
import { SynonymsRepository } from './synonyms.repository'

@Injectable()
export class SynonymsService {
  constructor(private readonly synonymsRepository: SynonymsRepository) {}

  async replaceQueryWithSynonyms(query: string) {
    if (!query) {
      return { query, vendorsInQuery: [] }
    }

    const tokens = query
      // leave only English and Korean alphabets and spaces
      .replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '')
      // remove single english letters
      .replace(/\b[a-zA-Z]{1}\b/g, ' ')
      // replace redundant spaces and replace with comma
      .trim()
      .replace(/\s+/g, ',')
      // split to tokens
      .split(',')

    const synonyms = await this.synonymsRepository.findSynonyms(tokens)
    const vendorsInQuery: string[] = []
    let replacementCount = synonyms?.length ?? 0

    tokens.forEach(token => {
      synonyms.forEach(synonym => {
        if (synonym.synonyms.includes(token)) {
          query = query.replace(token, synonym.synonyms[0])

          if (synonym.synonymType === 'vendor') {
            vendorsInQuery.push(synonym.synonyms[0])
          }

          replacementCount--
          if (replacementCount === 0) {
            return {
              query: query.trim(),
              vendorsInQuery
            }
          }
        }
      })
    })

    return {
      query: query.trim(),
      vendorsInQuery
    }
  }
}
