import { ObjectId } from 'mongodb'
import { Category } from 'src/common/types'

export class User {
  _id: ObjectId
  email: string
  nickname: string
  password: string
  role: Role
  status: UserStatus
  bookmarks?: ObjectId[]
  build?: Record<Category, ObjectId>
  avatar?: string
  notifications?: Notifications
  warnings?: Warnings
  loggedInHistory: LoggedInHistory[]
  createdAt: Date
  updatedAt: Date
}

export enum Role {
  admin = 'admin',
  manager = 'manager',
  user = 'user',
  guest = 'guest'
}

export enum UserStatus {
  active = 'active',
  blocked = 'blocked',
  deleted = 'deleted',
  unverified = 'unverified'
}

type Notifications = Notification[]

interface Notification {
  isChecked: boolean
  title: string
  content: string
}

type Warnings = Warning[]

interface Warning {
  title: string
  content: string
}

interface LoggedInHistory {
  timestamp: Date
  ip: string
}
