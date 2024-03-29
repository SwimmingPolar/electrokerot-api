import { ObjectId } from 'mongodb'
import { Category, Vote } from 'src/common/types'

export class Post {
  _id: ObjectId
  category: Category
  owner: ObjectId
  nickname: string
  tag: Tag
  title: string
  content: string
  builds?: Builds
  status: PostStatus
  votes: Votes
  comments: ObjectId[]
  createdAt: Date
  updatedAt: Date
  lastAccessedAt: Date
}

enum Tag {
  general = 'general',
  question = 'question',
  build = 'build'
}

type Builds = Build[]

type Build = Record<Category, Part>

enum PostStatus {
  published = 'published',
  blocked = 'blocked',
  deleted = 'deleted',
  draft = 'draft'
}

interface Part {
  partId: ObjectId
  count: number
}

type Votes = Vote[]
