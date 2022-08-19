import { ConflictException, Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import CreateUserDto from 'src/users/dto/CreateUserDto'
import { Role, User, UserStatus } from 'src/users/entities/user.entity'
import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<string> {
    // check if user with the same email already exists
    const isEmailConflicts = await this.usersRepository.findValidUserByEmail(
      createUserDto.email
    )
    if (isEmailConflicts) {
      throw new ConflictException('Email already exists')
    }

    // check if nickname is already taken
    const isNickNameConflicts =
      await this.usersRepository.findValidUserByNickname(createUserDto.nickname)
    if (isNickNameConflicts) {
      throw new ConflictException('Nickname already exists')
    }

    // remove passwordConfirm from createUserDto
    const { passwordConfirm, ...rest } = createUserDto
    const user = plainToClass(User, {
      ...rest,
      role: Role.guest,
      status: UserStatus.unverified,
      bookmarks: [],
      build: {},
      avatar: '',
      notifications: [],
      warnings: [],
      loggedInHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return await this.usersRepository.createUser(user)
  }
}
