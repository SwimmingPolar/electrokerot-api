import { ObjectId } from 'mongodb'
import { Vote } from 'src/common/types'

export class Comment {
  _id: ObjectId
  documentType: DocumentType
  document: ObjectId
  owner: ObjectId
  children: Children
  indentation: number
  content: string
  votes: Votes
  status: CommentStatus
  createdAt: Date
  updatedAt: Date
}

type Votes = Vote[]

enum DocumentType {
  post = 'post',
  review = 'review'
}

interface Children {
  count: number
  list: ObjectId[]
}

enum CommentStatus {
  published = 'published',
  blocked = 'blocked',
  deleted = 'deleted'
}
