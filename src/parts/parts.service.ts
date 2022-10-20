import { Injectable } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { SynonymsService } from '../synonyms/synonyms.service'
import { SearchPartsQuery } from './dto/SearchPartsDto'
import { SearchQueriesQuery } from './dto/SearchQueriesDto'
import { PartsRepository } from './parts.repository'

@Injectable()
export class PartsService {
  constructor(
    private readonly partsRepository: PartsRepository,
    private readonly synonymsService: SynonymsService
  ) {}

  async getSearchQueries({ category, query }: SearchQueriesQuery) {
    query = await this.synonymsService.replaceQueryWithSynonyms(query)
    return await this.partsRepository.findPartsNamesByCategoryAndQuery(
      category,
      query
    )
  }

  async searchParts({
    category,
    page,
    query: keyword,
    filters: details
  }: SearchPartsQuery) {
    keyword = await this.synonymsService.replaceQueryWithSynonyms(keyword)
    return await this.partsRepository.findPartsByFilters({
      category,
      page,
      keyword,
      details
    })
  }

  async getPartsByIds(ids: ObjectId[]) {
    return await this.partsRepository.findPartsByPartIds(ids)
  }
}
