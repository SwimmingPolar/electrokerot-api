import { Injectable } from '@nestjs/common'
import { Db, ObjectId } from 'mongodb'
import { InjectDb } from 'nest-mongodb'
import { EntityRepository } from '../common/repository/entity.repository'
import { Build } from './entities/build.entity'

@Injectable()
export class BuildsRepository extends EntityRepository<Build> {
  constructor(@InjectDb() private readonly db: Db) {
    super(db, 'builds')
  }

  async createBuild(build: Partial<Build>) {
    return await this.create({
      ...build,
      updatedAt: new Date()
    })
  }
  async updateBuildsByUserId(_id, build: Partial<Build>) {
    return await this.updateMany(
      {
        owner: _id
      },
      {
        ...build,
        updatedAt: new Date()
      }
    )
  }
  async updateBuildByBuildId(_id: ObjectId, build: Partial<Build>) {
    return await this.updateById(_id, { ...build, updatedAt: new Date() })
  }
  async deleteBuildByBuildId(_id: ObjectId) {
    return await this.deleteOne({
      _id
    })
  }
  async findBuildByBuildId(_id: ObjectId) {
    return await this.findById(_id)
  }
  async findBuildsByUserId(_id: ObjectId) {
    return await this.findMany({
      owner: _id
    })
  }
  async findBuildByBuildIdAndUserId(_id: ObjectId, userId: ObjectId) {
    return await this.findOne({
      _id,
      owner: userId
    })
  }
  async countBuildsByUserId(_id: ObjectId) {
    return await this.countDocuments({
      owner: _id
    })
  }
}
