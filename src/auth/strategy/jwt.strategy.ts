import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ObjectId } from 'mongodb'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserStatus } from 'src/users/entities/User.entity'
import { UsersRepository } from 'src/users/users.repository'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJwt]),
      secretOrKey: configService.get('JWT_SECRET')
    })
  }

  async validate(payload: any) {
    const _id = new ObjectId(payload._id)

    const user = await this.usersRepository.findValidUserByUserId(_id)

    // user not found
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // user not verified or blocked
    if (user.status !== UserStatus.active) {
      if (user.status === UserStatus.unverified) {
        throw new ForbiddenException('Verify your account')
      }
      if (user.status === UserStatus.blocked) {
        throw new ForbiddenException('Your account is blocked')
      }

      throw new ForbiddenException('Your account is not active')
    }

    return user
  }

  private static extractJwt(req: Request) {
    return req.cookies['access_token'] || ''
  }
}
