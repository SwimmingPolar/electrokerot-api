import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from 'src/auth/dto/LoginDto'
import { Action } from 'src/tokens/entities/Token.entity'
import { TokensService } from 'src/tokens/tokens.service'
import { UserStatus } from 'src/users/entities/User.entity'
import { UsersRepository } from '../users/users.repository'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly tokensService: TokensService
  ) {}
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.usersRepository.findValidUserByEmail(email)

    // there is no valid user with this email
    if (!user) {
      throw new UnauthorizedException()
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

    // user is found but password is not matched
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return {
      user,
      accessToken: this.jwtService.sign({ _id: user._id })
    }
  }

  async sendVerificationEmail(email: string) {
    const user = await this.usersRepository.findValidUserByEmail(email)

    // if there is no unverified user with this email
    if (!user || user.status !== UserStatus.unverified) {
      return
    }

    let { tokenString } = await this.tokensService.createToken(
      user._id,
      Action.verification
    )
    tokenString = encodeURIComponent(tokenString)

    await this.sendEmail(Action.verification, email, tokenString)
  }

  async verifyUser(tokenString: string) {
    // valid token verification returns owner
    const owner = await this.tokensService.verifyToken(
      tokenString,
      Action.verification
    )

    // if not, throw not found exception
    if (!owner) {
      throw new NotFoundException()
    }

    await this.usersRepository.verifyUser(owner)
  }

  async sendResetPasswordEmail(email: string) {
    const user = await this.usersRepository.findValidUserByEmail(email)

    // active, blocked, unverified user can change password
    if (!user || user.status === UserStatus.deleted) {
      return
    }

    let { tokenString } = await this.tokensService.createToken(
      user._id,
      Action.resetPassword
    )
    tokenString = encodeURIComponent(tokenString)

    await this.sendEmail(Action.resetPassword, email, tokenString)
  }

  async resetPassword(tokenString: string, password: string) {
    // valid token verification returns owner
    const owner = await this.tokensService.verifyToken(
      tokenString,
      Action.resetPassword
    )

    // if not, throw not found exception
    if (!owner) {
      throw new NotFoundException()
    }

    // find valid user (active, blocked, unverified)
    const user = await this.usersRepository.findValidUserByUserId(owner)
    // assign new password
    Object.assign(user, { password })
    // hash password
    await user.hashPassword()
    // update user
    await this.usersRepository.updateUserByUserId(user._id, {
      password: user.password
    })
  }

  async sendEmail(action: Action, email: string, tokenString: string) {
    // @TODO: send email
    console.log('hello~')
  }
}
