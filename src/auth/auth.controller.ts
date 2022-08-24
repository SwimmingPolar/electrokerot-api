import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import Throttle from 'src/auth/decorator/throttler.decorator'
import { LoginDto } from 'src/auth/dto/LoginDto'
import { RequestVerificationEmailDto } from 'src/auth/dto/RequestVerificationEmailDto'
import {
  ResetPasswordDto,
  ResetPasswordParam
} from 'src/auth/dto/ResetPasswordDto'
import { VerifyTokenParam } from 'src/auth/dto/VerifyTokenDto'
import { AuthService } from './auth.service'
import { RequestPasswordResetEmailDto } from './dto/RequestResetPasswordEmailDto'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginDto: LoginDto
  ) {
    const { accessToken, user } = await this.authService.login(loginDto)
    response.cookie('access_token', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })
    return user
  }

  @Get('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('access_token', '')
  }

  @Get('verify/:tokenString')
  @HttpCode(204)
  async verifyToken(@Param() { tokenString }: VerifyTokenParam) {
    await this.authService.verifyUser(tokenString)
  }

  // request to this endpoint will be throttled (3 requests per minute)
  @Throttle()
  @Get('verify')
  @HttpCode(204)
  async requestVerificationEmail(
    @Query() { email }: RequestVerificationEmailDto
  ) {
    await this.authService.sendVerificationEmail(email)
  }

  @Post('reset/:tokenString')
  @HttpCode(204)
  async resetPassword(
    @Param() { tokenString }: ResetPasswordParam,
    @Body() { password }: ResetPasswordDto
  ) {
    await this.authService.resetPassword(tokenString, password)
  }

  @Throttle()
  @Post('reset')
  @HttpCode(204)
  async requestResetPasswordEmail(
    @Body() { email }: RequestPasswordResetEmailDto
  ) {
    await this.authService.sendResetPasswordEmail(email)
  }
}
