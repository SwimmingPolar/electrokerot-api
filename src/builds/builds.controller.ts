import { Controller } from '@nestjs/common'
import { BuildsService } from './builds.service'

@Controller('builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}
}
