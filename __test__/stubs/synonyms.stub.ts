import { ObjectId } from 'mongodb'
import { MappingType } from '../../src/synonyms/synonyms.repository'

export const SynonymsDocuments = [
  {
    _id: new ObjectId(),
    mappingType: 'equivalent' as MappingType,
    synonyms: ['asus', '에이수스', '에이서스', '아수스']
  },
  {
    _id: new ObjectId(),
    mappingType: 'equivalent' as MappingType,
    synonyms: ['zotac', 'ZOTAC', '조탁', '조택']
  },
  {
    _id: new ObjectId(),
    mappingType: 'equivalent' as MappingType,
    synonyms: ['GAMING', '게이밍']
  },
  {
    _id: new ObjectId(),
    mappingType: 'equivalent' as MappingType,
    synonyms: ['strix', '스트릭스']
  },
  {
    _id: new ObjectId(),
    mappingType: 'equivalent' as MappingType,
    synonyms: ['rog', '로그']
  }
]

export const PartsNames = [
  'ZOTAC GAMING 지포스 RTX 4090 AMP EXTREME AIRO D6X 24GB',
  'ZOTAC GAMING 지포스 RTX 3060 TWIN Edge OC D6 12GB LHR',
  'ASUS ROG STRIX LC II 280 ARGB',
  'ASUS ROG RYUJIN II 240',
  'ASUS DUAL 지포스 RTX 3060 O12G OC D6 12GB'
]
