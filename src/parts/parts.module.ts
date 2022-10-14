import { Module } from '@nestjs/common'
import { PartsController } from './parts.controller'
import { PartsRepository } from './parts.repository'
import { PartsService } from './parts.service'

@Module({
  controllers: [PartsController],
  providers: [PartsRepository, PartsService],
  exports: [PartsRepository]
})
export class PartsModule {}
