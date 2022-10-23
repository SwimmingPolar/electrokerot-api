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
    // replace query with synonyms and separate vendors from query
    const { query: replacedQuery, vendorsFilter } =
      await this.synonymsService.replaceQueryWithSynonyms(query)
    const extraFilter = vendorsFilter.$in?.length ? vendorsFilter : undefined

    return await this.partsRepository.findPartsNamesByCategoryAndQuery(
      category,
      replacedQuery,
      extraFilter
    )
  }

  async searchParts({
    category,
    page,
    query,
    filters: details
  }: SearchPartsQuery) {
    // replace query with synonyms and separate vendors from query
    const { query: replacedQuery, vendorsFilter } =
      await this.synonymsService.replaceQueryWithSynonyms(query)
    const extraFilter = vendorsFilter.$in?.length ? vendorsFilter : undefined

    return await this.partsRepository.findPartsByFilters({
      category,
      page,
      keyword: replacedQuery,
      details,
      extraFilter
    })
  }

  async getPartsByIds(ids: ObjectId[]) {
    return await this.partsRepository.findPartsByPartIds(ids)
  }
}
