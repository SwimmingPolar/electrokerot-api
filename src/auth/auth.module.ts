import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from 'src/users/users.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy'
import { TokensModule } from 'src/tokens/tokens.module'
import ThrottlerModule from 'src/common/modules/ThrottleModule'

@Module({
  imports: [
    ThrottlerModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }
      })
    }),
    TokensModule,
    forwardRef(() => UsersModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
