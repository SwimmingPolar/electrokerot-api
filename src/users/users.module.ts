import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { UsersController } from 'src/users/users.controller'
import { UsersRepository } from 'src/users/users.repository'
import { UsersService } from 'src/users/users.service'

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository]
})
export class UsersModule {}
