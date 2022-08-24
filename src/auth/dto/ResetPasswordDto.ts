import { PickType } from '@nestjs/mapped-types'
import { Transform } from 'class-transformer'
import { IsString, Length } from 'class-validator'
import { CreateUserDto } from 'src/users/dto/CreateUserDto'

export class ResetPasswordDto extends PickType(CreateUserDto, [
  'password',
  'passwordConfirm'
] as const) {}

export class ResetPasswordParam {
  @IsString()
  @Transform(({ value }) => decodeURIComponent(value))
  @Length(60, 60)
  tokenString: string
}
