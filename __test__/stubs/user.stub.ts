import { CreateUserDto } from 'src/users/dto/CreateUserDto'

export const UserStub = (() => {
  let count = 0
  const randomNickname = () => `nickname${++count}`
  const randomEmail = () => `test_${Date.now()}@test.com`
  return (): CreateUserDto => ({
    email: randomEmail(),
    password: 'cc93c5e74ea079188047a6e8452e865e',
    passwordConfirm: 'cc93c5e74ea079188047a6e8452e865e',
    nickname: randomNickname()
  })
})()
