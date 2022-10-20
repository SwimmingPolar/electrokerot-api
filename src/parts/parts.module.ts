import { Module } from '@nestjs/common'
import { SynonymsModule } from '../synonyms/synonyms.module'
import { PartsController } from './parts.controller'
import { PartsRepository } from './parts.repository'
import { PartsService } from './parts.service'

@Module({
  imports: [SynonymsModule],
  controllers: [PartsController],
  providers: [PartsRepository, PartsService],
  exports: [PartsRepository]
})
export class PartsModule {}
