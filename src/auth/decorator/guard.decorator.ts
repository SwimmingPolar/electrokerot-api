import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guard/auth.guard'

export const Private = () => UseGuards(JwtAuthGuard)
