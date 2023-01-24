import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb'
import { PartCategoryType } from 'src/common/types'
import {
  cooler,
  cpu,
  graphics,
  hdd,
  memory,
  motherboard,
  power,
  ssd,
  _case
} from '../common/assets/filters/config'
import { EntityRepository } from '../common/repository/entity.repository'
import { Part } from './entities/part.entity'

const partsConfig = {
  cpu,
  cooler,
  graphics,
  hdd,
  memory,
  motherboard,
  power,
  ssd,
  case: _case
}

@Injectable()
export class PartsRepository extends EntityRepository<Part> {
  constructor(@InjectDb() private readonly db: Db) {
    super(db, 'parts', Part)
  }

  async findPartByPartId(_id: ObjectId) {
    return await this.findById(_id)
  }

  async findPartsByPartIds(partIds: ObjectId[]) {
    return (
      (
        await this.aggregate([
          {
            $match: {
              _id: {
                $in: partIds
              }
            }
          },
          {
            $lookup: {
              from: 'parts',
              localField: 'variants',
              foreignField: 'pcode',
              as: 'variants'
            }
          }
        ])
      )
        // To not expose pcode to the client,
        // we are replacing it with _id
        .reduce((acc, part) => {
          // Collect all ids including the current part
          const variantsIds = part.variants
            .map(variant => variant._id)
            .concat(part._id)
            .map(id => id.toString())
          //  Flatten the parts including the current part and variants
          const allParts = part.variants.concat(part)
          // Replace variants with the ids string
          allParts.forEach((part: any) => {
            part.variants = variantsIds.filter(id => id !== part._id.toString())
          })

          return [...acc, ...allParts]
        }, [] as Part[])
        .map(part => {
          let category = part.category as string
          if (category === 'case') {
            category = '_case'
          }

          // Get config for the current detail
          const config = partsConfig[category]
          // Iterate over details and
          // decorate the value with the unit
          Object.entries(part.details).forEach(([key, values]) => {
            // Value points to the object reference
            // so we can directly mutate it
            const hasUnit =
              config[key]?.unit !== undefined && config[key]?.unit !== ''

            if (hasUnit) {
              const value = values.value
              values.value = `${value}${config[key].unit}`
            }
          })

          return part
        })
    )
  }

  async findPartsNamesByCategoryAndQuery(
    category: PartCategoryType,
    query: string,
    vendorsFilter?: any
  ): Promise<string[]> {
    const match = Object.assign(
      {
        category
      },
      vendorsFilter ? vendorsFilter : {}
    )

    const result =
      (await this.aggregate([
        {
          $search: {
            text: {
              query,
              path: {
                wildcard: '*'
              }
              // @Issue: synonyms not working correctly (need fix from Atlas)
              // synonyms: 'vendorSynonyms'
            }
          }
        },
        {
          $set: {
            _metaSearchScore: {
              $meta: 'searchScore'
            }
          }
        },
        {
          $group: {
            _id: '$name.fullName',
            doc: {
              $first: '$$ROOT'
              // @Issue: have to replace $first with $top
              // $top: MongoDB 5.2 and above
              // When documents have same search scores, this will improve search result.
              // $top: {
              //   sortBy: { "_metaSearchScore": -1, "sortOrder": -1 },
              //   output: "$$ROOT"
              // }
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: '$doc'
          }
        },
        {
          $sort: {
            _metaSearchScore: -1,
            sortOrder: -1
          }
        },
        {
          $match: match
        },
        {
          $limit: 5
        },
        {
          $project: {
            _id: 0,
            'name.fullName': 1
          }
        }
      ])) ?? []

    if (result.length !== 0) {
      return result.map<string>((part: any) => part.name.fullName)
    }

    // if search engine doesn't return any result, then try to find with normal query
    return (
      await this.aggregate([
        {
          $match: {
            category,
            'name.fullName': {
              $regex: query,
              $options: 'i'
            }
          }
        },
        {
          $sort: {
            sortOrder: -1
          }
        },
        {
          $limit: 5
        },
        {
          $project: {
            _id: 0,
            'name.fullName': 1
          }
        }
      ])
    ).map(part => part.name.fullName)
  }

  /**
   * @description
   *  PAGINATION
   *  sortOrder: use to sort the parts popularity by the original data provider
   *  isVariant: indicates if it's variant of the same part (ddr4-3200 16gb, ddr-3200 8gb)
   *  When paginating without "full text search", details, sortOrder and isVariant are needed to sort the parts
   *  by popularity and to filter out the variants of the same part
   *  TEXT SEARCH
   *  If the user is searching for a specific part by name (query) plus the details filter and the page,
   *  then sortOrder and isVariant are less important. So we delegate the sorting to the full text search engine
   *  and we don't need to filter out the vaimport { PartCategoryType } from 'src/common/types';
riants of the same part because the full text search engine will.
   *  Instead, we need to group the parts by name and return the first part of each group
   */
  async findPartsByFilters({
    category,
    page = 1,
    keyword,
    details,
    extraFilter
  }: {
    category: PartCategoryType
    page: number
    keyword: string
    details: any
    extraFilter?: any
  }) {
    // handle empty string
    keyword = Boolean(keyword) ? keyword : null
    // prepare query
    const query = []

    // if search keyword is provided, then use full text search
    // and add searchScore field to the result to sort by it
    // otherwise, use normal pagination
    keyword &&
      query.push(
        ...[
          {
            $search: {
              text: {
                query: keyword,
                path: {
                  wildcard: '*'
                }
                // @Issue: synonyms not working correctly (need fix from Atlas)
                // synonyms: 'vendorSynonyms'
              }
            }
          },
          {
            $set: {
              _metaSearchScore: {
                $meta: 'searchScore'
              }
            }
          }
        ]
      )

    const match = Object.assign(
      {
        category
      },
      details ? details : {},
      extraFilter ? extraFilter : {}
    )

    // If search keyword is provided, delegate the sorting to the full text search engine.
    // And variants information provided by the original data provider is used
    // isVariant: true means that it's a variant of the same part (ddr4-3200 16gb, ddr-3200 8gb)
    // So, we need to filter out the variants of the same part
    if (!keyword) {
      match['isVariant'] = false
    }

    query.push({
      $match: match
    })

    const result = await this.aggregate([
      ...query,
      {
        $group: {
          _id: '$name.fullName',
          doc: {
            $first: '$$ROOT'
            // @Issue: have to replace $first with $top
            // $top: MongoDB 5.2 and above
            // When documents have same search scores, this will improve search result.
            // $top: {
            //   sortBy: { "_metaSearchScore": -1, "sortOrder": -1 },
            //   output: "$$ROOT"
            // }
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: '$doc'
        }
      },
      {
        $sort: {
          _metaSearchScore: -1,
          sortOrder: -1
        }
      },
      {
        $unset: '_metaSearchScore'
      },
      {
        $skip: (page - 1) * 15
      },
      {
        $limit: 15 * page
      },
      {
        $project: {
          _id: 1
        }
      }
    ])

    return result.map(part => part._id.toString())
  }
}
