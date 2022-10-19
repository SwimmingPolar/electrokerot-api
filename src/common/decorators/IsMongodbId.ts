import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions
} from 'class-validator'
import { ObjectId } from 'mongodb'

export function IsMongodbId(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'IsMongodbId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedProperty = (args.object as any)[relatedPropertyName]
          const ids = Array.isArray(relatedProperty)
            ? relatedProperty
            : [relatedProperty]

          return ids.every(id => ObjectId.isValid(id))
        }
      }
    })
  }
}
