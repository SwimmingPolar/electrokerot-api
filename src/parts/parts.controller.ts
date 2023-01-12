import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common'
import { PartsIdsQuery } from './dto/GetPartsByIdsDto'
import { SearchPartsBody } from './dto/SearchPartsDto'
import { SearchQueriesQuery } from './dto/SearchQueriesDto'
import { PartsService } from './parts.service'

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get()
  async getPartsByIds(@Query() { ids }: PartsIdsQuery) {
    return await this.partsService.getPartsByIds(ids)
  }

  @Get('searchQueries')
  async getSearchQueries(@Query() searchQueriesQuery: SearchQueriesQuery) {
    return await this.partsService.getSearchQueries(searchQueriesQuery)
  }

  @Post('search')
  @HttpCode(200)
  async searchParts(@Body() searchPartsBody: SearchPartsBody) {
    return await this.partsService.searchParts(searchPartsBody)
  }
}
