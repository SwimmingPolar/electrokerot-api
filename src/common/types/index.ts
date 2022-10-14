import { ObjectId } from 'mongodb'

export enum MarketType {
  openMarket = 'openMarket',
  mall = 'mall',
  credit = 'credit',
  cash = 'cash'
}

export enum Category {
  cpu = 'cpu',
  motherboard = 'motherboard',
  memory = 'memory',
  graphics = 'graphics',
  ssd = 'ssd',
  hdd = 'hdd',
  power = 'power',
  case = 'case',
  cpuCooler = 'cpuCooler',
  systemCooler = 'systemCooler'
}

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
