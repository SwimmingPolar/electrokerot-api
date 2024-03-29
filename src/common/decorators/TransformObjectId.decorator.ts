import { Transform, TransformationType } from 'class-transformer'
import { ObjectId } from 'mongodb'
import 'reflect-metadata'

type indexSignature<T> = {
  [index: string]: T
}

// BIG ASSUMPTION: target is valid ObjectId object or ObjectId string
export const TransformObjectId = () =>
  Transform(({ value, obj, key, type }) => {
    value = value && value?.length > 0 ? value : obj[key]

    // target is not a valid ObjectId object
    // and is falsy (empty string, null, undefined, length 0)
    // then return original value
    if (
      !(value instanceof ObjectId) &&
      (!value || Object.keys(value).length === 0)
    ) {
      return value
    }

    // handle single value, array, object
    const isIndexAccessible =
      typeof value !== 'string' && Object.keys(value).length > 0
    // if input is single value, transform to array
    // to be able to use index access
    const targets: indexSignature<string> | indexSignature<ObjectId> =
      isIndexAccessible ? value : [value]

    // save original value to be able to type check,
    // and return original value if transformation didn't take place
    const transformed = targets

    // type guard for ObjectId
    const isObjectId = (
      x: indexSignature<ObjectId> | indexSignature<string>
    ): x is indexSignature<ObjectId> => x[Object.keys(x)[0]] instanceof ObjectId

    switch (type) {
      case TransformationType.PLAIN_TO_CLASS:
        // if targets are string, convert to ObjectId
        if (!isObjectId(targets)) {
          for (const key of Object.keys(targets)) {
            if (ObjectId.isValid(targets[key])) {
              transformed[key] = new ObjectId(targets[key])
            }
          }
        } else {
          // When transforming to class instance,
          // if target is already ObjectId, do nothing
        }
        break
      case TransformationType.CLASS_TO_PLAIN:
        // if targets are ObjectId object, convert to string
        if (isObjectId(targets)) {
          for (const key of Object.keys(targets)) {
            transformed[key] = targets[key].toHexString()
          }
        } else {
          // When transforming to plain object,
          // if target is already string, do nothing
        }
        break
    }

    return !isIndexAccessible ? transformed[0] : transformed
  })
