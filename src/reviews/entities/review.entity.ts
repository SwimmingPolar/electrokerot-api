import { ObjectId } from 'mongodb'
import { Vote } from 'src/common/types'

export class Review {
  _id: ObjectId
  partId: ObjectId
  owner: ObjectId
  status: ReviewStatus
  content: string
  votes: Votes
  comments: ObjectId[]
  createdAt: Date
  updatedAt: Date
}

type Votes = Vote[]

enum ReviewStatus {
  published = 'published',
  blocked = 'blocked',
  deleted = 'deleted'
}
