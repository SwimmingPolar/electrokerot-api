import { Type } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { TransformObjectId } from 'src/common/decorators/TransformObjectId.decorator'

export class Token {
  @TransformObjectId()
  _id: ObjectId

  @TransformObjectId()
  owner: ObjectId

  tokenString: string

  action: Action

  @Type(() => Date)
  createdAt: Date

  constructor(partial: Partial<Token>) {
    if (partial) {
      Object.assign(this, partial)
      this._id = new ObjectId()
      this.createdAt = new Date()
    }
  }
}

export enum Action {
  resetPassword = 'resetPassword',
  verification = 'verification'
}
