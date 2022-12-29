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
      `${process.env.PWD}/assets/filters/json/${partCategory}.json`,
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

    const query = {} as any

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

        // Check if the user's value exists in the original values array
        const isValueExist = usersValueArray.every(value =>
          originalValuesArray.includes(value)
        )

        // If the value doesn't exist, skip this filter
        if (!isValueExist) {
          continue
        }
      }

      // Convert requested values to the correct type if necessary
      // Temporary replace to store converted values
      const temp = [] as number[]
      if (shouldConvert) {
        for (const value of filters[key]) {
          // If it has multi units (ex, 1GB, 1TB, 1PB),
          // it will be converted inside this function
          temp.push(...(convertToNumbers(value, config[key]) as number[]))
        }
      }

      // If 'shouldConvert' is true, use the converted values
      // Otherwise, use the original values
      const values = Array.from(
        (shouldConvert ? temp : (filters[key] as any[]))
          // Remove duplicate values
          .reduce((set, value) => set.add(value), new Set())
      )

      switch (matchingType) {
        case 'exact':
          query[key] = {
            $in: values
          }
          break

        case 'contains':
          const regex = values.map(value => new RegExp(value as string, 'i'))
          query[key] = {
            $in: regex
          }
          break

        case 'range':
          query[key] = {
            $or: filters[key].map(value => {
              const [min, max] = convertToNumbers(
                value,
                config[key]
              ) as number[]

              let query = {}
              // In case of '~32GB', match anything that has less than 32GB
              const onlyMax = /^~/.test(value)
              if (onlyMax) {
                query = {
                  $lte: min
                }
              }

              // In case of '32GB~', match anything that has greater than 32GB
              const onlyMin = /~$/.test(value)
              if (onlyMin) {
                query = {
                  $gte: min
                }
              }

              // Default case
              if (!onlyMax && !onlyMin) {
                query = {
                  $and: [
                    {
                      $gte: min
                    },
                    {
                      $lte: max
                    }
                  ]
                }
              }

              return query
            })
          }
          break

        // Reserved
        case 'max':
          break

        // Reserved
        case 'min':
          break
      }
    }
    return query
  }
})()
