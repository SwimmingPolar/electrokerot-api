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
  protected transformVendorsListIntoFilter(vendorsList: string[]) {
    return vendorsList.length !== 0
      ? {
          'details.제조회사.value': {
            $in: vendorsList.map(vendor => new RegExp(vendor, 'i'))
          }
        }
      : {}
  }

  async getSearchQueries({ category, query }: SearchQueriesQuery) {
    // replace query with synonyms and separate vendors from query
    const { query: replacedQuery, vendorsInQuery } =
      await this.synonymsService.replaceQueryWithSynonyms(query)
    // transform separated vendors into filters that mongodb can understand
    const vendorsFilter = this.transformVendorsListIntoFilter(vendorsInQuery)

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
    // replace query with synonyms and separate vendors from query
    const { query: replacedQuery, vendorsInQuery } =
      await this.synonymsService.replaceQueryWithSynonyms(query)
    // transform separated vendors into filters that mongodb can understand
    const vendorsFilter = this.transformVendorsListIntoFilter(vendorsInQuery)

    return await this.partsRepository.findPartsByFilters({
      category,
      page,
      keyword: replacedQuery,
      details,
      extraFilter: vendorsFilter
    })
  }

  async getPartsByIds(ids: ObjectId[]) {
    return await this.partsRepository.findPartsByPartIds(ids)
  }
}
