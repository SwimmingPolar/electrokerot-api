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
  지원보드규격: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  지원파워규격: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  쿨링팬: {
    unit: '개',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '깊이(D)': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '너비(W)': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '높이(H)': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  // @Issue: 다나와 데이터가 너무 답이 없어서 일단 뺌
  // "라디에이터(상단)",
  // "라디에이터(하단)",
  // "라디에이터(전면)",
  // "라디에이터(후면)",
  // "라디에이터(측면)",
  전면: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  후면: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  측면: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '전면 패널 타입': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '수랭쿨러 규격': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '파워 위치': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '파워 장착': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  'CPU쿨러 장착': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  'GPU 장착': {
    unit: 'mm',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '13.3cm베이': {
    unit: '개',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '6.4cm베이': {
    unit: '개',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '8.9cm베이': {
    unit: '개',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  }
}
