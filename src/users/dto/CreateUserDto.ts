import {
  IsAlphanumeric,
  IsEmail,
  MaxLength,
  MinLength,
  NotContains,
  registerDecorator,
  ValidationArguments
} from 'class-validator'
import { ValidationOptions } from 'joi'

export default class CreateUserDto {
  @IsEmail()
  @MaxLength(128)
  email: string

  @NotContains(' ', { message: 'Password cannot contain spaces' })
  @MinLength(16)
  @MaxLength(256)
  password: string

  @IsEqualTo('password')
  passwordConfirm: string

  @NotContains(' ', { message: 'Nickname cannot contain spaces' })
  @IsAlphanumeric()
  @MinLength(3)
  @MaxLength(12)
  nickname: string
}

// check if the value that is being validated is the same
// as the value of the other property(targetValue)
function IsEqualTo(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const targetValue = args.object[property]
          return value === targetValue
        }
      }
    })
  }
}
