import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import { Action, Token } from 'src/tokens/entities/Token.entity'
import { TokensRepository } from 'src/tokens/tokens.repository'

@Injectable()
export class TokensService {
  constructor(private readonly tokensRepository: TokensRepository) {}

  async createToken(owner: ObjectId, action: Action) {
    // find existing token and return if any
    const token = await this.tokensRepository.findTokenByUserIdAndAction(
      owner,
      action
    )
    if (token) {
      return token
    }

    // generate random string
    const salt = await bcrypt.genSalt(10)
    const tokenString = await bcrypt.hash(salt, 10)

    // create new token and save it
    const newToken = new Token({ owner, action, tokenString })
    await this.tokensRepository.createToken(newToken)

    return newToken
  }

  async verifyToken(tokenString: string, action: Action) {
    const { _id: tokenId, owner } =
      (await this.tokensRepository.findTokenByTokenStringAndAction(
        tokenString,
        action
      )) || {}
    await this.tokensRepository.deleteTokenByTokenIdAndAction(tokenId, action)
    return owner
  }
}
