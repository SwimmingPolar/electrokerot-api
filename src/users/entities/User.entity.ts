import bcrypt from 'bcrypt'
import { Exclude, Type } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { TransformObjectId } from 'src/common/decorators/TransformObjectId.decorator'
import { BuildCategory } from 'src/common/types'

export class User {
  @TransformObjectId()
  _id: ObjectId

  email: string

  nickname: string

  @Exclude({ toPlainOnly: true })
  password: string

  role: Role

  @Exclude({ toPlainOnly: true })
  status: UserStatus

  @TransformObjectId()
  bookmarks?: ObjectId[]

  @TransformObjectId()
  build?: Record<BuildCategory, ObjectId>

  avatar?: string

  notifications?: Notification[]

  warnings?: Warning[]

  @Exclude({ toPlainOnly: true })
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

  // constructor({ email, nickname, password }) {
  constructor(partial: Partial<User>) {
    if (partial) {
      Object.assign(this, partial)
      this._id = new ObjectId()
      this.role = Role.guest
      this.status = UserStatus.unverified
      this.bookmarks = []
      this.build = {} as Record<BuildCategory, ObjectId>
      this.avatar = ''
      this.notifications = []
      this.warnings = []
      this.loggedInHistory = []
      this.createdAt = new Date()
      this.updatedAt = new Date()
    }
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
