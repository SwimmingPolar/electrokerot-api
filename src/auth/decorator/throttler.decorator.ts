import { UseGuards } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

const throttler = () => UseGuards(ThrottlerGuard)

export default throttler
