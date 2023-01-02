import { FilterType } from '../../../types'

export const filterTypes: FilterType = {
  제조회사: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  '칩셋 제조사': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'NVIDIA 칩셋': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'AMD 칩셋': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  사용전력: {
    unit: 'W',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '권장 파워용량': {
    unit: 'W',
    shouldExist: true,
    matchingType: 'min',
    shouldConvert: true
  },
  '팬 개수': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '가로(길이)': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  세로: {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '높이(두께)': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '모니터 지원': {
    unit: '개',
    shouldExist: true,
    matchingType: 'min',
    shouldConvert: true
  },
  냉각방식: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  베이스클럭: {
    unit: 'MHz',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  부스트클럭: {
    unit: 'MHz',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '쿠다 프로세서': {
    unit: '개',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '메모리 종류': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '메모리 클럭': {
    unit: 'MHz',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
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
  '전원 포트': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  전원부: {
    unit: '페이즈',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  인터페이스: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  DisplayPort: {
    unit: '개',
    shouldExist: true,
    matchingType: 'min',
    shouldConvert: true
  },
  HDMI: {
    unit: '개',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  부가기능: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '추가 구성': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  }
}
