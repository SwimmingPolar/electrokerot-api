import { ConflictException, Injectable } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { CreateUserDto } from 'src/users/dto/CreateUserDto'
import { UpdateUserDto } from 'src/users/dto/UpdateUserDto'
import { User } from 'src/users/entities/User.entity'
import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService
  ) {}

  async createUser(createUserDto: CreateUserDto) {
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
    const user = new User(rest)
    // create user
    await this.usersRepository.createUser(user)
    // send verification email
    await this.authService.sendVerificationEmail(user.email)

    return user._id
  }

  async updateUser(user: User, updateUserDto: Partial<UpdateUserDto>) {
    // destructure profile fields for individual update checkups
    const { nickname } = updateUserDto

    // check nickname
    if (nickname && nickname !== user.nickname) {
      // check if nickname is already taken
      const isNickNameConflicts =
        await this.usersRepository.findValidUserByNickname(nickname)
      if (isNickNameConflicts) {
        throw new ConflictException('Nickname already exists')
      }
    }
    // check other field
    // check other field

    // update user
    // remove passwordConfirm from updateUserDto
    const { passwordConfirm, ...rest } = updateUserDto
    Object.assign(user, rest)

    await user.hashPassword()

    await this.usersRepository.updateUserByUserId(user._id, user)
  }

  async deleteUser(user: User) {
    await this.usersRepository.deleteUser(user._id)
  }
}
