import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { Config, starWars, uniqueNamesGenerator } from 'unique-names-generator'
import { PartsRepository } from '../parts/parts.repository'
import { User } from '../users/entities/User.entity'
import { BuildsRepository } from './builds.repository'
import { UpdateBuildDto } from './dto/UpdateBuildDto'

@Injectable()
export class BuildsService {
  constructor(
    private readonly buildsRepository: BuildsRepository,
    private readonly partRepository: PartsRepository
  ) {}

  async getBuilds({ _id: userId }: User) {
    return await this.buildsRepository.findBuildsByUserId(userId)
  }

  async createBuild({ _id: userId }: User) {
    const buildCount = await this.buildsRepository.countBuildsByUserId(userId)
    // limit build count to 10
    if (buildCount >= 10) {
      throw new ForbiddenException(
        'You have reached the maximum number of builds'
      )
    }

    // make all builds not selected
    // to make sure only one build is selected
    await this.buildsRepository.updateBuildsByUserId(userId, {
      isSelected: false
    })

    // create build
    const config: Config = {
      dictionaries: [starWars],
      style: 'capital'
    }
    const name = uniqueNamesGenerator(config)
    const buildId = await this.buildsRepository.createBuild({
      owner: userId,
      name,
      isSelected: true,
      createdAt: new Date()
    })

    return await this.buildsRepository.findBuildByBuildId(buildId)
  }

  async cloneBuild({ _id: userId }: User, buildId: ObjectId) {
    const buildCount = await this.buildsRepository.countBuildsByUserId(userId)

    // limit build count to 10
    if (buildCount >= 10) {
      throw new ForbiddenException(
        'You have reached the maximum number of builds'
      )
    }

    const targetBuild = await this.buildsRepository.findBuildByBuildIdAndUserId(
      buildId,
      userId
    )
    if (!targetBuild) {
      throw new NotFoundException('Build not found')
    }

    // unselect all builds
    await this.buildsRepository.updateBuildsByUserId(userId, {
      isSelected: false
    })

    // clone build
    const clonedBuild = await this.buildsRepository.createBuild({
      ...targetBuild,
      // change build id
      _id: new ObjectId(),
      isSelected: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return await this.buildsRepository.findBuildByBuildId(clonedBuild)
  }

  async updateBuild(
    { _id: userId }: User,
    buildId: ObjectId,
    updateBuildDto: UpdateBuildDto
  ) {
    let targetBuild = await this.buildsRepository.findBuildByBuildIdAndUserId(
      buildId,
      userId
    )
    // if build not found, throw 404
    if (!targetBuild) {
      throw new NotFoundException('Build not found')
    }

    //  remove undefined properties
    //  properties are actions to be taken:
    //  name:         build name
    //  isSelected:   build selection
    //  partInfo:     build's parts
    //  optimization: build's optimization status
    Object.keys(updateBuildDto).forEach(key => {
      if (updateBuildDto[key] === undefined) {
        delete updateBuildDto[key]
      }
    })

    // if all props are undefined, throw 400
    // request with no actions to be taken (empty body)
    if (Object.keys(updateBuildDto).length === 0) {
      throw new BadRequestException('No properties to update')
    }

    // all actions will be processed in order
    // maintain targetBuild's immutability
    for await (const action of Object.keys(updateBuildDto)) {
      switch (action) {
        case 'name':
          targetBuild = {
            ...targetBuild,
            name: updateBuildDto.name
          }
          break
        case 'isSelected':
          // unselect all builds
          await this.buildsRepository.updateBuildsByUserId(userId, {
            isSelected: false
          })
          // make this to be the only selected build
          targetBuild = {
            ...targetBuild,
            isSelected: updateBuildDto.isSelected
          }
          break
        case 'optimization':
          targetBuild = {
            ...targetBuild,
            optimization: {
              // update optimized date
              ...updateBuildDto.optimization,
              optimizedAt: new Date()
            }
          }
          break
        case 'partInfo':
          const { category } = updateBuildDto.partInfo
          // DELETE part
          if (updateBuildDto.partInfo.delete) {
            delete targetBuild.parts[category]
            break
          }

          // UPDATE part
          let { partId, name, count, price } =
            updateBuildDto.partInfo || ({} as UpdateBuildDto['partInfo'])

          // not allow to update partId and name at once
          if (partId && name) {
            throw new BadRequestException(
              'Cannot update both partId and name at the same time'
            )
          }
          // when partId is given, it means changing part
          if (partId) {
            // when partId is given, name and price are not needed (can't be changed)
            if (name !== undefined || price !== undefined) {
              throw new BadRequestException(
                'Cannot change the name or the price of a valid part'
              )
            }
            // make sure partId belongs to the valid category
            const part = await this.partRepository.findPartByPartId(
              new ObjectId(partId)
            )
            // if no part found or
            // part's category doesn't match the category in the request
            // throw 400
            if (!part || part?.category !== category) {
              throw new BadRequestException('Invalid partId')
            }
            // if partId is valid, reset name and price field
            // and set count as default of 1 or given value
            name = ''
            price = 0
            count = count ?? 1
          }
          // if partId is not given, it means changing part's info (name, count, price)
          else {
            // if name is given, then remove partId from the build
            if (name) {
              partId = undefined
            }
            // @Issue: partId should be ObjectId when fetched from db
            // but for some reason it's string, so we need to convert it ObjectId if necessary
            // the type of partId will still be ObjectId in Build entity class
            partId = partId ?? targetBuild?.parts?.[category]?.partId
            // when partId is given, name and price are not needed (can't be changed)
            if (partId) {
              if (name !== undefined || price !== undefined) {
                throw new BadRequestException(
                  'Cannot change the name or the price of a valid part'
                )
              }
            }
            name = name ?? targetBuild?.parts?.[category]?.name
            price = price ?? targetBuild?.parts?.[category]?.price ?? 0
            count = count ?? targetBuild?.parts?.[category]?.count ?? 1
          }

          // update part info
          targetBuild = {
            ...targetBuild,
            parts: {
              ...targetBuild.parts,
              [category]: {
                // @Issue: partId should be ObjectId when fetched from db
                // take a look at the comment above for more info (line: 194)
                // Convert to partId only when it's not a falsy value
                partId: partId && new ObjectId(partId),
                name,
                count,
                price,
                filters: updateBuildDto.partInfo.filters
              }
            }
          }
      }
    }
    return await this.buildsRepository.updateBuildByBuildId(
      buildId,
      targetBuild
    )
  }

  async deleteBuild({ _id: userId }: User, buildId: ObjectId) {
    const targetBuild = await this.buildsRepository.findBuildByBuildIdAndUserId(
      buildId,
      userId
    )
    if (!targetBuild) {
      return
    }

    await this.buildsRepository.deleteBuildByBuildId(buildId)

    return
  }
}
