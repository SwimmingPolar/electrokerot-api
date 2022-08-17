import { Collection, Db, Filter, ObjectId } from 'mongodb'
import { CollectionName } from 'src/common/types'

export abstract class EntityRepository<T> {
  protected readonly collection: Collection

  constructor(db: Db, collectionName: CollectionName) {
    this.collection = db.collection(collectionName)
  }

  async create(entity: Partial<T>) {
    return (await this.collection.insertOne(entity)).insertedId.toString()
  }

  async findById(id: string) {
    return await this.collection.findOne<T>({ _id: new ObjectId(id) })
  }

  async findOne(filter: Filter<Partial<T>>) {
    return await this.collection.findOne<T>(filter)
  }

  async findMany(filter: Filter<Partial<T>>) {
    return await this.collection.find<T>(filter).toArray()
  }

  async updateById(id: string, entity: Partial<T>) {
    return (
      await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: entity }
      )
    ).modifiedCount
  }

  async updateOne(filter: Filter<Partial<T>>, entity: Partial<T>) {
    return (await this.collection.updateOne(filter, { $set: entity }))
      .modifiedCount
  }

  async updateMany(filter: Filter<Partial<T>>, entity: Partial<T>) {
    return (await this.collection.updateMany(filter, { $set: entity }))
      .modifiedCount
  }

  async delete(id: string) {
    return (await this.collection.deleteOne({ _id: new ObjectId(id) }))
      .deletedCount
  }
}
