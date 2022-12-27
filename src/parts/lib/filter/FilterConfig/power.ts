import { FilterType } from '../lib/converToNumbers'

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
  정격출력: {
    unit: 'W',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '80PLUS인증': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  케이블연결: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  깊이: {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  'PCIe 16핀(12+4)': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'PCIe 8핀(6+2)': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'PCIe 6핀': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  부가기능: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'LED 시스템': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  }
}
