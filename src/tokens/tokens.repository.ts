import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb'
import { EntityRepository } from 'src/common/repository/entity.repository'
import { Action, Token } from 'src/tokens/entities/Token.entity'

@Injectable()
export class TokensRepository extends EntityRepository<Token> {
  constructor(@InjectDb() private readonly db: Db) {
    super(db, 'tokens')
  }

  async createToken(token: Token) {
    return await this.create(token)
  }
  async findTokenByUserIdAndAction(owner: ObjectId, action: Action) {
    return await this.findOne({ owner, action })
  }
  async findTokenByTokenStringAndAction(tokenString: string, action: Action) {
    return await this.findOne({
      tokenString,
      action
    })
  }
  async deleteTokenByTokenIdAndAction(tokenId: ObjectId, action: Action) {
    return await this.deleteOne({ _id: tokenId, action })
  }
}
