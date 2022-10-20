import { Controller, Get, Param, Query } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { PartsIdsParam } from './dto/GetPartsByIdsDto'
import { SearchPartsQuery } from './dto/SearchPartsDto'
import { SearchQueriesQuery } from './dto/SearchQueriesDto'
import { Part } from './entities/part.entity'
import { PartsService } from './parts.service'

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get('searchQueries')
  async getSearchQueries(@Query() searchQueriesQuery: SearchQueriesQuery) {
    return await this.partsService.getSearchQueries(searchQueriesQuery)
  }

  @Get('search')
  async searchParts(@Query() searchPartsQuery: SearchPartsQuery) {
    return plainToInstance(
      Part,
      await this.partsService.searchParts(searchPartsQuery)
    )
  }

  // controller order matters
  @Get(':ids')
  async getPartsByIds(@Param() { ids }: PartsIdsParam) {
    return await this.partsService.getPartsByIds(ids)
  }
}
