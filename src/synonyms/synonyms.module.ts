import { Module } from '@nestjs/common'
import { SynonymsRepository } from './synonyms.repository'
import { SynonymsService } from './synonyms.service'

@Module({
  providers: [SynonymsService, SynonymsRepository],
  exports: [SynonymsService]
})
export class SynonymsModule {}
