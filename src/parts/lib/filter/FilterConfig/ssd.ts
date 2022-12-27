import { FilterType } from '../lib/converToNumbers'

export const filterTypes: FilterType = {
  제조회사: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  인터페이스: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  폼팩터: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  용량: {
    unit: 'TB',
    unitInterval: 1024,
    unitSteps: ['MB', 'GB', 'TB', 'PB'],
    hasMultiUnit: true,
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '메모리 타입': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  프로토콜: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '낸드 구조': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  쓰기IOPS: {
    unit: 'K',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  읽기IOPS: {
    unit: 'K',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  순차쓰기: {
    unit: 'MB/s',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  순차읽기: {
    unit: 'MB/s',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  'NVMe 방열판': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  지원기능: {
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
