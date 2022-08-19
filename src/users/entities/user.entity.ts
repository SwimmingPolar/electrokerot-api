import { Exclude, Type } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Category } from 'src/common/types'
import bcrypt from 'bcrypt'

export class User {
  _id: ObjectId

  @Exclude({ toPlainOnly: true })
  email: string

  nickname: string

  @Exclude({ toPlainOnly: true })
  password: string

  role: Role

  @Exclude({ toPlainOnly: true })
  status: UserStatus

  @Exclude({ toPlainOnly: true })
  @Type(() => ObjectId)
  bookmarks?: ObjectId[]

  build?: Record<Category, ObjectId>

  avatar?: string

  @Type(() => Notification)
  notifications?: Notification[]

  @Type(() => Warning)
  warnings?: Warning[]

  @Exclude({ toPlainOnly: true })
  @Type(() => LoggedInHistory)
  loggedInHistory?: LoggedInHistory[]

  @Exclude({ toPlainOnly: true })
  @Type(() => Date)
  createdAt: Date

  @Exclude({ toPlainOnly: true })
  @Type(() => Date)
  updatedAt: Date

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.password)
  }
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

class Notification {
  isChecked: boolean
  title: string
  content: string
}

class Warning {
  title: string
  content: string
}

class LoggedInHistory {
  timestamp: Date
  ip: string
}
