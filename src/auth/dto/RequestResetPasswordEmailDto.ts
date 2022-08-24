import { PickType } from '@nestjs/mapped-types'
import { CreateUserDto } from 'src/users/dto/CreateUserDto'

export class RequestPasswordResetEmailDto extends PickType(CreateUserDto, [
  'email'
] as const) {}
