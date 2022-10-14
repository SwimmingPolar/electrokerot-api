import { PickType } from '@nestjs/mapped-types'
import {
  IsAlphanumeric,
  IsOptional,
  MaxLength,
  MinLength,
  NotContains
} from 'class-validator'
import { CreateUserDto } from 'src/users/dto/CreateUserDto'

export class UpdateUserDto extends PickType(CreateUserDto, [
  'password',
  'passwordConfirm'
]) {
  @NotContains(' ', { message: 'Nickname cannot contain spaces' })
  @IsAlphanumeric()
  @MinLength(3)
  @MaxLength(12)
  @IsOptional()
  nickname: string
}
