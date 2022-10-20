import { Collection, Db, Filter, ObjectId } from 'mongodb'
import { CollectionName } from 'src/common/types'

export abstract class EntityRepository<T> {
  protected readonly collection: Collection

  constructor(db: Db, collectionName: CollectionName) {
    this.collection = db.collection(collectionName)
  }

  protected async create(entity: Partial<T>) {
    return (await this.collection.insertOne(entity)).insertedId
  }

  protected async find(filter: Filter<Partial<T>>) {
    return this.collection.find<T>(filter)
  }

  protected async findById(_id: ObjectId) {
    return await this.collection.findOne<T>({ _id })
  }

  protected async findOne(filter: Filter<Partial<T>>) {
    return await this.collection.findOne<T>(filter)
  }

  protected async findMany(filter: Filter<Partial<T>>) {
    return await this.collection.find<T>(filter).toArray()
  }

  protected async updateById(_id: ObjectId, entity: Partial<T>) {
    return (await this.collection.updateOne({ _id }, { $set: entity }))
      .modifiedCount
  }

  protected async updateOne(filter: Filter<Partial<T>>, entity: Partial<T>) {
    return (await this.collection.updateOne(filter, { $set: entity }))
      .modifiedCount
  }

  protected async updateMany(filter: Filter<Partial<T>>, entity: Partial<T>) {
    return (await this.collection.updateMany(filter, { $set: entity }))
      .modifiedCount
  }

  protected async deleteOne(filter: Filter<Partial<T>>) {
    return (await this.collection.deleteOne(filter)).deletedCount
  }

  protected async countDocuments(filter: Filter<Partial<T>>) {
    return await this.collection.countDocuments(filter)
  }

  protected async aggregate(pipeline: any[]) {
    return this.collection.aggregate<T>(pipeline).toArray()
  }
}
