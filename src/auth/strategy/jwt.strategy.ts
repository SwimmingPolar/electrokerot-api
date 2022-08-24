import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { plainToClass } from 'class-transformer'
import { Request } from 'express'
import { ObjectId } from 'mongodb'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { User, UserStatus } from 'src/users/entities/User.entity'
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

    let user = await this.usersRepository.findValidUserByUserId(_id)

    // user not found
    if (!user) {
      throw new UnauthorizedException()
    }

    // user not verified or blocked
    if (user.status !== UserStatus.active) {
      throw new ForbiddenException()
    }

    // transform to class instance
    user = plainToClass(User, user)

    return user
  }

  private static extractJwt(req: Request) {
    return req.cookies['access_token'] || ''
  }
}
