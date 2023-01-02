import { FilterConfiguration } from '../../types'

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
    .replace(/-/g, '~')
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
