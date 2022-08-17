import { Controller } from '@nestjs/common'
import { PartsService } from './parts.service'

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}
}
