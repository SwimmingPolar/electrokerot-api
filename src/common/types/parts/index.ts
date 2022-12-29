export type MatchingType = 'exact' | 'contains' | 'range' | 'max' | 'min'

export type FilterConfiguration = {
  // Whether to check the existence of the value,
  // in case the user sends a request with non-existing value
  shouldExist: boolean
  // Decides how to match the value
  matchingType: MatchingType
  // Decides if the value has multiple units
  hasMultiUnit?: boolean
  // Decides if the value should be converted to number
  shouldConvert?: boolean
  // Unit of the value
  unit: string
  // @Issue: Find a away to conditionally make this property required
  // If the value has multiple units, specify them here (ex. 1GB, 1TB, 1PB)
  unitInterval?: number
  unitSteps?: string[]
  // Individual RegExp for each filter if necessary
  regex?: RegExp
}

export type FilterType = {
  [key: string]: FilterConfiguration
}

export type FilterJson = {
  category?: string
  subCategory?: string
  values: string[]
}
