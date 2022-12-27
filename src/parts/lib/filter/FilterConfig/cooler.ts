import { FilterType } from '../lib/converToNumbers'

export const filterTypes: FilterType = {
  분류: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  제조회사: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  'AMD 소켓': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '인텔 소켓': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '냉각 방식': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  라디에이터: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '팬 크기': {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  '팬 두께': {
    unit: 'T',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  베어링: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  부가기능: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '최대 소음': {
    unit: 'dBA',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '최대 팬속도': {
    unit: 'RPM',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '최대 풍량': {
    unit: 'CFM',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '최대 풍압': {
    unit: 'mmH2O',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '최저 소음': {
    unit: 'dBA',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  컨넥터: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '쿨러 높이': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  히트파이프: {
    unit: '개',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  LED색상: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  LED시스템: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  }
}
