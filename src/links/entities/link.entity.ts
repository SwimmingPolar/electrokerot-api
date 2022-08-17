import { ObjectId } from 'mongodb'

export class Link {
  _id: ObjectId
  owner: ObjectId
  token: string
  createdAt: Date
}
