import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb'
import { EntityRepository } from '../common/repository/entity.repository'
import { Category } from '../common/types'
import { Part } from './entities/part.entity'

@Injectable()
export class PartsRepository extends EntityRepository<Part> {
  constructor(@InjectDb() private readonly db: Db) {
    super(db, 'parts', Part)
  }

  async findPartByPartId(_id: ObjectId) {
    return await this.findById(_id)
  }

  async findPartsByPartIds(partIds: ObjectId[]) {
    return await this.findMany({ _id: { $in: partIds } })
  }

  async findPartsNamesByCategoryAndQuery(
    category: keyof typeof Category,
    query: string
  ): Promise<string[]> {
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
          $match: {
            category
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
   *  and we don't need to filter out the variants of the same part because the full text search engine will.
   *  Instead, we need to group the parts by name and return the first part of each group
   */
  async findPartsByFilters({
    category,
    page = 1,
    keyword,
    details = {}
  }: {
    category: keyof typeof Category
    page: number
    keyword: string
    details: Record<string, string[]>
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

    let match = {
      category
    }

    // If search keyword is provided, delegate the sorting to the full text search engine.
    // And variants information provided by the original data provider is used
    // isVariant: true means that it's a variant of the same part (ddr4-3200 16gb, ddr-3200 8gb)
    // So, we need to filter out the variants of the same part
    if (!keyword) {
      match['isVariant'] = false
    }

    // translate filter to object that mongodb understands
    if (details) {
      const filters = Object.entries(details).reduce((acc, [key, values]) => {
        acc['details.' + key + '.value'] = {
          $in: values
        }
        return acc
      }, {})
      match = { ...match, ...filters }
    }

    query.push({
      $match: match
    })

    return await this.aggregate([
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
        $lookup: {
          from: 'parts',
          localField: 'variants',
          foreignField: 'pcode',
          as: 'variants'
        }
      }
    ])
  }
}
