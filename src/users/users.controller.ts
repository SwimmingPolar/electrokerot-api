import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Req
} from '@nestjs/common'
import { Private } from 'src/auth/decorator/guard.decorator'
import { CreateUserDto } from 'src/users/dto/CreateUserDto'
import { UpdateUserDto } from 'src/users/dto/UpdateUserDto'
import { User } from 'src/users/entities/User.entity'
import { UsersService } from 'src/users/users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Private()
  @Get()
  async getUser(@Req() { user }: { user: User }) {
    return user
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto)
  }

  @Private()
  @Patch()
  @HttpCode(204)
  async updateUser(
    @Req() { user }: { user: User },
    @Body() updateUserDto: UpdateUserDto
  ) {
    await this.usersService.updateUser(user, updateUserDto)
  }

  @Private()
  @Delete()
  @HttpCode(204)
  async deleteUserByUserId(@Req() { user }: { user: User }) {
    await this.usersService.deleteUser(user)
  }
}
