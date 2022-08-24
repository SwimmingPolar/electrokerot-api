import { Optional } from '@nestjs/common'
import { PickType } from '@nestjs/mapped-types'
import {
  IsAlphanumeric,
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
  @Optional()
  nickname: string
}
