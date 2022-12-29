import { FilterType } from '../../../types'

export const filterTypes: FilterType = {
  제조회사: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '디스크 용량': {
    unit: 'TB',
    unitInterval: 1024,
    unitSteps: ['MB', 'GB', 'TB', 'PB'],
    hasMultiUnit: true,
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  두께: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '전송 속도': {
    unit: 'MB/s',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  }
}
