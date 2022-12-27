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
  'CPU 소켓': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '세부 칩셋': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  폼팩터: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  전원부: {
    unit: '페이즈',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '메모리 종류': {
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
    matchingType: 'range',
    shouldConvert: true
  },
  '메모리 속도': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '메모리 슬롯': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '메모리 채널': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '메모리 기술': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '무선랜 종류': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '유선랜 속도': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  내장그래픽: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '그래픽 출력': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'RAID 지원': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'M.2': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'M.2 연결': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'M.2 폼팩터': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  PCIe버전: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  PCIex16: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'PCIex16(at x4)': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'PCIex16(at x2)': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'PCIex16(at x1)': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  PCIex8: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  PCIex4: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  PCIex1: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  썬더볼트4: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '썬더볼트4 헤더': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '썬더볼트3 헤더': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '시스템팬 헤더(4핀)': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  후면단자: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'USB 타입': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'ARGB 헤더(3핀)': {
    unit: '개',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  'ARGB 헤더(6핀)': {
    unit: '개',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  'RGB 헤더(4핀)': {
    unit: '개',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  'LED 시스템': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  특징: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  }
}
