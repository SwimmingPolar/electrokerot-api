import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth '
  }

  findAll() {
    return `This action returns all auth ${this.configService.get<number>(
      'PORT'
    )}`
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`
  }

  remove(id: number) {
    return `This action removes a #${id} auth`
  }
}
