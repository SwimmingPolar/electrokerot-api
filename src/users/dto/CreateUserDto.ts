import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  registerDecorator,
  ValidationArguments
} from 'class-validator'
import { ValidationOptions } from 'joi'

export default class CreateUserDto {
  @IsEmail()
  @MaxLength(128)
  email: string

  @IsNotEmpty()
  @MaxLength(128)
  password: string

  @IsEqualTo('password')
  passwordConfirm: string

  @IsNotEmpty()
  @MaxLength(10)
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
