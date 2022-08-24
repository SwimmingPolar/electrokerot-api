import { Module } from '@nestjs/common'
import { TokensRepository } from 'src/tokens/tokens.repository'
import { TokensService } from './tokens.service'

@Module({
  providers: [TokensRepository, TokensService],
  exports: [TokensRepository, TokensService]
})
export class TokensModule {}
