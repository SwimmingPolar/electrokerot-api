import { Injectable } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { SynonymsService } from '../synonyms/synonyms.service'
import { SearchPartsQuery } from './dto/SearchPartsDto'
import { SearchQueriesQuery } from './dto/SearchQueriesDto'
import { PartsRepository } from './parts.repository'
import { transformVendorsListIntoFilter } from '../common/lib'
import { parseFilters } from '../common/lib/parseFilters/index'

@Injectable()
export class PartsService {
  constructor(
    private readonly partsRepository: PartsRepository,
    private readonly synonymsService: SynonymsService
  ) {}

  async getSearchQueries({ category, query }: SearchQueriesQuery) {
    // replace query with synonyms and separate vendors from query
    const { query: replacedQuery, vendorsInQuery } =
      await this.synonymsService.replaceQueryWithSynonyms(query)
    // transform separated vendors into filters that mongodb can understand
    const vendorsFilter = transformVendorsListIntoFilter({}, vendorsInQuery)

    return await this.partsRepository.findPartsNamesByCategoryAndQuery(
      category,
      replacedQuery,
      vendorsFilter
    )
  }

  async searchParts({
    category,
    page,
    query,
    filters: details
  }: SearchPartsQuery) {
    // parse details filter into mongodb understandable format
    const parsedDetailsFilter = parseFilters(category, details)

    // Replace search query string with synonyms
    // and separate vendors from search query string
    const { query: replacedQuery, vendorsInQuery } =
      await this.synonymsService.replaceQueryWithSynonyms(query)

    // Concat vendors list to the filter if it exists
    console.log(parsedDetailsFilter)
    transformVendorsListIntoFilter(parsedDetailsFilter, vendorsInQuery)

    return await this.partsRepository.findPartsByFilters({
      category,
      page,
      keyword: replacedQuery,
      details: parsedDetailsFilter
    })
  }

  async getPartsByIds(ids: ObjectId[]) {
    return await this.partsRepository.findPartsByPartIds(ids)
  }
}
