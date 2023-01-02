import fs from 'fs'
import * as filterConfig from '../../assets/filters/config'
import { Category, FilterConfiguration, FilterJson } from '../../types'
import { convertToNumbers } from '../convertToNumbers/index'

const FiltersObject = {} as {
  [key in keyof typeof filterConfig]: {
    json: FilterJson[]
    config: {
      [key: string]: FilterConfiguration
    }
  }
}

const init = () => {
  for (const category in filterConfig) {
    // @Important: 'case' is a reserved keyword in javascript
    //             so we need special treatment for it
    let partCategory = category as string
    if (category.includes('case')) {
      partCategory = 'case'
    }

    const json = fs.readFileSync(
      `${process.env.PWD}/src/common/assets/filters/json/${partCategory}.json`,
      'utf8'
    )

    FiltersObject[partCategory] = {
      json: {},
      config: {}
    }
    FiltersObject[partCategory].json = JSON.parse(json)
    FiltersObject[partCategory].config = filterConfig[category]
  }
}

export const parseFilters = (() => {
  init()

  return (
    category: keyof typeof Category,
    filters: Record<string, string[]>
  ): { [key: string]: any } => {
    if (!filters) {
      return {}
    }

    let partCategory = category as keyof typeof filterConfig
    // @Issue: Find a way to make this more elegant
    if (category === 'systemCooler' || category === 'cpuCooler') {
      partCategory = 'cooler'
    } else if (category === 'case') {
      partCategory = '_case'
    }

    // We need to perform 'and' operation on each filters
    const andQuery = [] as any

    // Prepare json file and config based on the category
    const { json, config } = FiltersObject[partCategory]

    for (const key in filters) {
      const { shouldExist, matchingType, shouldConvert } = config[key] || {}

      // Extract trustable details key from the config file
      const detailsKey = Object.keys(FiltersObject[partCategory].config)
      // If the key given by the user doesn't exist in the config file, ignore it
      if (!detailsKey.includes(key)) {
        continue
      }

      // Check if the value sent by the user exists in the json file
      // to prevent malicious requests
      if (shouldExist) {
        // Trustable values saved in the json file at backend
        const originalValuesArray = json.find(
          ({ category, subCategory }) => category === key || subCategory === key
        ).values
        const usersValueArray = filters[key]

        // Filter out the values that doesn't exist in the json file
        const sanitizedValues = usersValueArray.filter(value =>
          originalValuesArray.includes(value)
        )

        // Save the sanitized values to the filters object
        filters[key] = sanitizedValues
      }

      // Place to hold the query for each filter
      const query = {}
      // Field name in the database
      const fieldName = `details.${key}.value`
      // Remove duplicate values
      const values = [...new Set(filters[key])]

      let convertedValue: (string | number)[]

      switch (matchingType) {
        case 'exact':
          // If conversion is needed, convert the values to numbers
          convertedValue =
            shouldConvert &&
            values.map(value => convertToNumbers(value, config[key])[0])

          query[fieldName] = {
            $in: shouldConvert ? convertedValue : values
          }
          break

        case 'contains':
          const regex = values.map(value => new RegExp(value as string, 'i'))
          query[fieldName] = {
            $in: regex
          }
          break

        case 'range':
          query['$or'] = filters[key].map(value => {
            const [min, max] = convertToNumbers(value, config[key]) as number[]

            // In case of '~32GB', match anything that has less than 32GB
            const onlyMax = /^~/.test(value)
            if (onlyMax) {
              return {
                [fieldName]: { $lte: min }
              }
            }

            // In case of '32GB~', match anything that has greater than 32GB
            const onlyMin = /~$/.test(value)
            if (onlyMin) {
              return {
                [fieldName]: { $gte: min }
              }
            }

            // Default case
            if (!onlyMax && !onlyMin) {
              return {
                $and: [
                  {
                    [fieldName]: { $gte: min }
                  },
                  {
                    [fieldName]: { $lte: max }
                  }
                ]
              }
            }
          })

          break

        case 'max':
          convertedValue = values.map(
            value => convertToNumbers(value, config[key])[0]
          )

          query[fieldName] = {
            $lte: convertedValue
          }
          break

        case 'min':
          convertedValue = values.map(
            value => convertToNumbers(value, config[key])[0]
          )

          query[fieldName] = {
            $gte: convertedValue
          }
          break
      }

      andQuery.push(query)
    }

    return {
      $and: andQuery
    }
  }
})()
