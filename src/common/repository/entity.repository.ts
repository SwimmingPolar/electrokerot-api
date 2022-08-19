import { Collection, Db, Filter, ObjectId } from 'mongodb'
import { CollectionName } from 'src/common/types'

export abstract class EntityRepository<T> {
  protected readonly collection: Collection

  constructor(db: Db, collectionName: CollectionName) {
    this.collection = db.collection(collectionName)
  }

  protected async create(entity: Partial<T>) {
    return (await this.collection.insertOne(entity)).insertedId.toString()
  }

  protected async findById(id: string) {
    return await this.collection.findOne<T>({ _id: new ObjectId(id) })
  }

  protected async findOne(filter: Filter<Partial<T>>) {
    return await this.collection.findOne<T>(filter)
  }

  protected async findMany(filter: Filter<Partial<T>>) {
    return await this.collection.find<T>(filter).toArray()
  }

  protected async updateById(id: string, entity: Partial<T>) {
    return (
      await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: entity }
      )
    ).modifiedCount
  }

  protected async updateOne(filter: Filter<Partial<T>>, entity: Partial<T>) {
    return (await this.collection.updateOne(filter, { $set: entity }))
      .modifiedCount
  }

  protected async updateMany(filter: Filter<Partial<T>>, entity: Partial<T>) {
    return (await this.collection.updateMany(filter, { $set: entity }))
      .modifiedCount
  }

  protected async delete(id: string) {
    return (await this.collection.deleteOne({ _id: new ObjectId(id) }))
      .deletedCount
  }
}
