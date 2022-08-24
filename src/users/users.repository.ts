import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb'
import { EntityRepository } from 'src/common/repository/entity.repository'
import { Role, User, UserStatus } from 'src/users/entities/User.entity'

@Injectable()
export class UsersRepository extends EntityRepository<User> {
  constructor(@InjectDb() private readonly db: Db) {
    super(db, 'users')
  }

  async createUser(user: User) {
    // delete passwordConfirm if any
    delete user['passwordConfirm']

    await user.hashPassword()
    return await this.create(user)
  }

  async verifyUser(_id: ObjectId) {
    return await this.updateById(_id, {
      role: Role.user,
      status: UserStatus.active
    })
  }

  async deleteUser(_id: ObjectId) {
    return await this.updateById(_id, {
      status: UserStatus.deleted
    })
  }

  async findActiveUserByUserId(_id: ObjectId) {
    return await this.findOne({
      _id,
      role: Role.user,
      status: {
        $not: {
          $eq: UserStatus.deleted
        }
      }
    })
  }

  // user is found but may not be active
  async findValidUserByEmail(email: string) {
    return await this.findOne({
      email: { $regex: new RegExp(email, 'i') },
      status: {
        $not: {
          $eq: UserStatus.deleted
        }
      }
    })
  }

  // user is found but may not be active
  async findValidUserByNickname(nickname: string) {
    return await this.findOne({
      nickname: { $regex: new RegExp(nickname, 'i') },
      status: {
        $not: {
          $eq: UserStatus.deleted
        }
      }
    })
  }

  // user is found but may not be active
  async findValidUserByUserId(_id: ObjectId) {
    return await this.findOne({
      _id,
      status: {
        $not: {
          $eq: UserStatus.deleted
        }
      }
    })
  }

  async updateUserByUserId(_id: ObjectId, user: Partial<User>) {
    // delete passwordConfirm if any
    delete user['passwordConfirm']

    return await this.updateOne(
      {
        _id,
        status: {
          $not: {
            $eq: UserStatus.deleted
          }
        }
      },
      user
    )
  }
}
