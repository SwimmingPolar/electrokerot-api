import { ObjectId } from 'mongodb'

export type MarketType = 'openMarket' | 'mall' | 'credit' | 'cash'

export type Category =
  | 'cpu'
  | 'mainboard'
  | 'memory'
  | 'graphics'
  | 'ssd'
  | 'hdd'
  | 'power'
  | 'case'
  | 'cpuCooler'
  | 'systemCooler'

export interface Vote {
  voter: ObjectId
  action: VoteAction
}

export type VoteAction = 'like' | 'dislike'

export type CollectionName =
  | 'parts'
  | 'builds'
  | 'users'
  | 'posts'
  | 'reviews'
  | 'tokens'
  | 'comments'
