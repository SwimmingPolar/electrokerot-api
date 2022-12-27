const NumberWord = {
  듀얼: 2,
  쿼드: 4,
  헥사: 6,
  핵사: 6,
  옥타: 8
}

const wordToNumber = (value: string) => {
  const key = Object.keys(NumberWord).find(key => value.includes(key))
  return key ? NumberWord[key as keyof typeof NumberWord] : value
}

type MatchingType = 'exact' | 'contains' | 'range' | 'max' | 'min'

type FilterConfiguration = {
  // Whether to check the existence of the value,
  // in case the user sends a request with non-existing value
  shouldExist: boolean
  // Decides how to match the value
  matchingType: MatchingType
  // Decides if the value should be converted to number
  shouldConvert?: boolean
  // Individual RegExp for each filter if necessary
  regex?: RegExp
  // Unit of the value
  unit: string
  // @Issue: Find a away to conditionally make this property required
  // If the value has multiple units, specify them here (ex. 1GB, 1TB, 1PB)
  hasMultiUnit?: boolean
  unitInterval?: number
  unitSteps?: string[]
}

export type FilterType = {
  [key: string]: FilterConfiguration
}

// Split each string token and sum up the numbers (1+1, 2.5+1)
// const toNumber = (token: string) =>
//   token
//     .split('+')
//     .reduce((sum, num) => sum + Number(num.replace(/,/gi, '')), 0) || 0

// Convert the string value into numbers array
export const convertToNumbers = (
  // The value of the field to be converted
  value: string,
  // Configuration of the field
  {
    unit,
    hasMultiUnit,
    unitInterval,
    unitSteps,
    // reserved for future use
    regex: regExp
  }: FilterConfiguration
) => {
  // Number to multiply to the value to convert it into the base unit
  let numerator = 1

  // If currently converting field has multiple units, convert them into one unit
  if (hasMultiUnit) {
    // Index of the base unit
    const baseUnitIndex =
      unitSteps?.findIndex(unitElement => unit === unitElement) || 0 // default value should never be used

    // Index of the current unit included in the value string
    const currentUnitIndex =
      unitSteps?.findIndex(unit => value.includes(unit)) || 0 // default value should never be used

    const deltaToBaseUnit = currentUnitIndex - baseUnitIndex

    numerator =
      deltaToBaseUnit < 0
        ? 1 / (unitInterval as number) ** -deltaToBaseUnit
        : (unitInterval as number) ** deltaToBaseUnit

    // In case there's only one unit, set the numerator to 1
    if (numerator === 0) {
      numerator = 1
    }
  }

  const convertedValue = value
    // split the value if it has range value (ex, 1,000.00~2,000+500 MHz)
    .split('~')
    // iterate each token (["1,000.00", "2,000+500MHz"])
    .map(valueToken =>
      valueToken
        // remove the unit from the token (["1,000.00", "2,000+500"])
        .replace(new RegExp(unit, 'ig'), '')
        // remove the comma from the token (["1000.00", "2000+500"])
        .replace(/,/gi, '')
        // match the number tokens ([["1000.00"], ["2000", "500"]])
        .match(/[\d\\.]*/gi)
        // convert each tokens to number and sum up the numbers (1000.00, 2500)
        ?.reduce((sum, numToken) => sum + Number(numToken) * numerator, 0)
    )
    .filter(Boolean) as number[]

  return convertedValue.length === 0 ? [wordToNumber(value)] : convertedValue
}
