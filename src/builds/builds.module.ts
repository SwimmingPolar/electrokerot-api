import { Module } from '@nestjs/common'
import { BuildsService } from './builds.service'
import { BuildsController } from './builds.controller'
import { BuildsRepository } from './builds.repository'
import { PartsRepository } from '../parts/parts.repository'
import { PartsModule } from '../parts/parts.module'

@Module({
  imports: [PartsModule],
  controllers: [BuildsController],
  providers: [BuildsService, BuildsRepository, PartsRepository]
})
export class BuildsModule {}
