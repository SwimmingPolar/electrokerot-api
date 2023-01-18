import { ObjectId } from 'mongodb'

export * from './parts'

// @Todo: move types to separate folders

export enum MarketType {
  openMarket = 'openMarket',
  mall = 'mall',
  credit = 'credit',
  cash = 'cash'
}

export enum PartCategory {
  cpu = 'cpu',
  memory = 'memory',
  motherboard = 'motherboard',
  graphics = 'graphics',
  ssd = 'ssd',
  hdd = 'hdd',
  power = 'power',
  case = 'case',
  cooler = 'cooler'
}

export type PartCategoryType = keyof typeof PartCategory

export enum BuildCategory {
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

export type BuildCategoryType = keyof typeof BuildCategory

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
  | 'synonyms'
