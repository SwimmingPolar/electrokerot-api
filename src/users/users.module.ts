import { Module } from '@nestjs/common'
import { UsersRepository } from 'src/users/users.repository'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService]
})
export class UsersModule {}
