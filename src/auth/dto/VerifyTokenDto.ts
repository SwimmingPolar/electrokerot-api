import { Transform } from 'class-transformer'
import { IsString, Length } from 'class-validator'

export class VerifyTokenParam {
  @IsString()
  @Transform(({ value }) => decodeURIComponent(value))
  @Length(60, 60)
  tokenString: string
}
