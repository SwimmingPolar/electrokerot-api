import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb-driver'
import { EntityRepository } from 'src/common/repository/entity.repository'
import CreateUserDto from 'src/users/dto/CreateUserDto'
import { Role, User, UserStatus } from 'src/users/entities/user.entity'

@Injectable()
export class UsersRepository extends EntityRepository<User> {
  constructor(
    @InjectDb()
    private readonly db: Db
  ) {
    super(db, 'users')
  }

  async createUser(createUserDto: CreateUserDto) {
    return await this.create(createUserDto)
  }

  async deleteUser(id: string) {}

  async findActiveUserByUserId(id: string) {
    return await this.findOne({
      _id: new ObjectId(id),
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
      email,
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
      nickname,
      status: {
        $not: {
          $eq: UserStatus.deleted
        }
      }
    })
  }
}
