import { Module } from '@nestjs/common'
import { UsersController } from 'src/users/users.controller'
import { UsersRepository } from 'src/users/users.repository'
import { UsersService } from 'src/users/users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService]
})
export class UsersModule {}
