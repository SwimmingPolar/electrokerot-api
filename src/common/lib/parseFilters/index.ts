import fs from 'fs'
import { FiltersType } from 'src/parts/dto/SearchPartsDto'
import * as filterConfig from '../../assets/filters/config'
import {
  BuildCategoryType,
  FilterConfiguration,
  FilterJson,
  PartCategoryType
} from '../../types'
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
    category: PartCategoryType,
    filters: FiltersType
  ): { [key: string]: any } => {
    if (!filters) {
      return undefined
    }

    let partCategory = category as keyof typeof filterConfig
    switch (category) {
      case 'case':
        partCategory = '_case'
        break
    }

    // We need to perform 'and' operation on each filters
    const andQuery = [] as any

    // Prepare json file and config based on the category
    const { json, config } = FiltersObject[partCategory]

    for (const { filterName, filterOptions } of filters) {
      if (filterOptions.length === 0) {
        continue
      }

      const { shouldExist, matchingType, shouldConvert } =
        config[filterName] || {}

      // Extract trustable details key from the config file
      const detailsKey = Object.keys(FiltersObject[partCategory].config)
      // If the key given by the user doesn't exist in the config file, ignore it
      if (!detailsKey.includes(filterName)) {
        continue
      }

      // Check if the value sent by the user exists in the json file
      // to prevent malicious requests
      if (shouldExist) {
        // Trustable values saved in the json file at backend
        const originalValuesArray = json.find(
          ({ category, subCategory }) =>
            category === filterName || subCategory === filterName
        ).values
        const usersValueArray = filterOptions

        // Filter out the values that doesn't exist in the json file
        const sanitizedValues = usersValueArray.filter(
          value =>
            originalValuesArray.includes(value) ||
            originalValuesArray.includes(value.replace(/^!!/, ''))
        )

        // Empty the original user's value array and
        // save the sanitized values to the filters object
        filterOptions.splice(0, filterOptions.length, ...sanitizedValues)
      }

      // Place to hold the query for each filter
      let query = {}
      // Field name in the database
      const fieldName = `details.${filterName}.value`
      // Remove duplicate values
      const values = [...new Set(filterOptions)]

      let convertedValue: (string | number)[]

      switch (matchingType) {
        case 'exact':
        case 'contains':
          // Sample query for 'exact' matching type
          // {
          //   $and: [
          //     {
          //       'details.제조회사.value': { $not: { $in: [/AMD/i] } }
          //     },
          //     {
          //       'details.제조회사.value': { $in: [/인텔/i] }
          //     }
          //   ]
          // }

          // Split the values into two arrays (values to include and values to exclude)
          const valuesToInclude =
            values.filter(value => value.startsWith('!!') === false) || []
          const valuesToExclude =
            values
              // Values which are to be excluded in the query result
              .filter(value => !valuesToInclude.includes(value))
              // Remove the '!!' from the value
              .map(value => value.replace(/^!!/, '')) || []

          const queriesArray = [valuesToInclude, valuesToExclude]
            // Remove empty arrays
            .filter(e => e.length > 0)
            .map((values, index) => {
              // If conversion is needed, convert the values to numbers
              convertedValue =
                shouldConvert &&
                values.map(
                  value => convertToNumbers(value, config[filterName])[0]
                )
              let queryValues: (number | string | RegExp)[] = shouldConvert
                ? convertedValue
                : values
              if (matchingType === 'contains') {
                queryValues = queryValues.map(
                  value => new RegExp(value as string, 'i')
                )
              }

              return {
                [fieldName]:
                  // Element with index 0 is the values to include and
                  // element with index 1 is the values to exclude
                  index === 1
                    ? {
                        // Set $not operator to exclude the values
                        $not: { $in: queryValues }
                      }
                    : { $in: queryValues }
              }
            })

          // If there are more than one query, wrap them in $and operator
          query =
            queriesArray.length > 1 ? { $and: queriesArray } : queriesArray[0]
          break

        case 'range':
          // Sample query for 'range' matching type
          // $and: [
          //   {
          //     $and: [
          //       {
          //         'details.제조회사.value': {
          //           $in: [/AMD/i]
          //         }
          //       },
          //       {
          //         'details.제조회사.value': {
          //           $not: {
          //             $in: [/인텔/i]
          //           }
          //         }
          //       }
          //     ]
          //   },
          //   {
          //     $and: [
          //       {
          //         'details.코어 수.value': {
          //           $in: [8]
          //         }
          //       },
          //       {
          //         'details.코어 수.value': {
          //           $not: {
          //             $in: [12]
          //           }
          //         }
          //       }
          //     ]
          //   },
          //   {
          //     $or: [
          //       {
          //         'details.L3 캐시.value': {
          //           $lte: 32
          //         }
          //       },
          //       {
          //         $nor: [
          //           {
          //             $and: [
          //               {
          //                 'details.L3 캐시.value': {
          //                   $gte: 64
          //                 }
          //               },
          //               {
          //                 'details.L3 캐시.value': {
          //                   $lte: 128
          //                 }
          //               }
          //             ]
          //           }
          //         ]
          //       },
          //       {
          //         'details.L3 캐시.value': {
          //           $gte: 256
          //         }
          //       }
          //     ]
          //   }
          // ]
          query['$or'] = filterOptions.map(value => {
            // Check if the value starts with '!!'
            // which means that the user wants to exclude the value
            const shouldExclude = /^!!/.test(value)
            if (shouldExclude) {
              value = value.replace(/^!!/, '')
            }

            let rangeQuery

            const [min, max] = convertToNumbers(
              value,
              config[filterName]
            ) as number[]

            // In case of '~32GB', match anything that has less than 32GB
            const onlyMax = /^~/.test(value)
            if (onlyMax) {
              rangeQuery = {
                [fieldName]: { $lte: min }
              }
            }

            // In case of '32GB~', match anything that has greater than 32GB
            const onlyMin = /~$/.test(value)
            if (onlyMin) {
              rangeQuery = {
                [fieldName]: { $gte: min }
              }
            }

            // Default case
            if (!onlyMax && !onlyMin) {
              rangeQuery = {
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

            return shouldExclude ? { $nor: [rangeQuery] } : rangeQuery
          })

          break

        case 'max':
        case 'min':
          // Check if the value starts with '!!'
          // to exclude the value from the query result.
          // And 'min' or 'max' should only have one value
          const shouldExclude = /^!!/.test(values[0])
          const value = convertToNumbers(
            shouldExclude ? values[0].replace(/^!!/, '') : values[0],
            config[filterName]
          )[0]

          const operator = matchingType === 'max' ? '$lte' : '$gte'

          query = {
            [fieldName]: shouldExclude
              ? { $not: { [operator]: value } }
              : { [operator]: value }
          }

          break
      }

      andQuery.push(query)
    }

    return andQuery.length === 0
      ? undefined
      : {
          $and: andQuery
        }
  }
})()
