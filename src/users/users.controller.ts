import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import CreateUserDto from 'src/users/dto/CreateUserDto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUserByUserId() {
    return 'getUserByUserId'
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return createUserDto
  }

  @Patch()
  updateUserProfileByUserId() {
    return 'updateUserProfileByUserId'
  }

  @Delete()
  deleteUserByUserId() {
    return 'deleteUserByUserId'
  }
}
