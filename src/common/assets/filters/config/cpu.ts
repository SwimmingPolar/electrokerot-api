import { FilterType } from '../../../types'

export const filterTypes: FilterType = {
  제조회사: {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  '코드 네임': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '인텔 CPU종류': {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  'AMD CPU종류': {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  '소켓 구분': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '기본 클럭': {
    unit: 'GHz',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '최대 클럭': {
    unit: 'GHz',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '코어 수': {
    unit: '코어',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '쓰레드 수': {
    unit: '쓰레드',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  TDP: {
    unit: 'W',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '제조 공정': {
    unit: 'nm',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '메모리 규격': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '메모리 채널': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '메모리 클럭': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '최대 메모리 크기': {
    unit: 'TB',
    unitInterval: 1024,
    unitSteps: ['MB', 'GB', 'TB', 'PB'],
    hasMultiUnit: true,
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  '최대 PCIe 레인수': {
    unit: '레인',
    shouldExist: true,
    matchingType: 'exact',
    shouldConvert: true
  },
  'L2 캐시': {
    unit: 'MB',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  'L3 캐시': {
    unit: 'MB',
    shouldExist: true,
    matchingType: 'range',
    shouldConvert: true
  },
  '패키지 형태': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'GPU 모델명': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  'PCIe 버전': {
    unit: '',
    shouldExist: true,
    matchingType: 'contains'
  },
  쿨러: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  내장그래픽: {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  },
  '기술 지원': {
    unit: '',
    shouldExist: true,
    matchingType: 'exact'
  }
}
