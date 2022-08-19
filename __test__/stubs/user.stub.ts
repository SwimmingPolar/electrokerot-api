import { ObjectId } from 'mongodb'
import CreateUserDto from 'src/users/dto/CreateUserDto'
import { Role, User, UserStatus } from 'src/users/entities/user.entity'

export const createUserDtoStub = (): CreateUserDto => ({
  email: 'test@gmail.com',
  password: 'cc93c5e74ea079188047a6e8452e865e',
  passwordConfirm: 'cc93c5e74ea079188047a6e8452e865e',
  nickname: 'nickname'
})

export const userStub = (): User => ({
  _id: new ObjectId(),
  email: 'test@gmail.com',
  nickname: 'nickname',
  password: 'cc93c5e74ea079188047a6e8452e865e',
  role: Role.guest,
  status: UserStatus.unverified,
  createdAt: new Date(),
  updatedAt: new Date(),

  hashPassword: () => Promise.resolve(),
  comparePassword: () => Promise.resolve(true)
})
