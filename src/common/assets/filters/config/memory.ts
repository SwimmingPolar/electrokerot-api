import { FilterType } from '../../../types'

export const filterTypes: FilterType = {
  제조회사: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  '제품 분류': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '메모리 용량': {
    unit: 'GB',
    unitInterval: 1024,
    unitSteps: ['MB', 'GB', 'TB', 'PB'],
    hasMultiUnit: true,
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '동작클럭(대역폭)': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  램타이밍: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  동작전압: {
    unit: 'V',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  'LED 시스템': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  히트싱크: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  부가기능: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  }
}
