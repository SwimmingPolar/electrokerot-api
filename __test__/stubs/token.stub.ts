import { ObjectId } from 'mongodb'
import { Action, Token } from 'src/tokens/entities/Token.entity'
import bcrypt from 'bcrypt'

export const TokenStub = async (): Promise<Token> => ({
  _id: new ObjectId(),
  owner: new ObjectId(),
  action: Action.verification,
  tokenString: await bcrypt.hash('tokenString' + new Date(), 10),
  createdAt: new Date()
})
