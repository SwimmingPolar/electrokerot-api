import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { MongoClient } from 'mongodb'
import { InjectClient } from 'nest-mongodb'

@Injectable()
export class LifecycleService implements OnApplicationShutdown {
  constructor(@InjectClient() private readonly client: MongoClient) {}

  async onApplicationShutdown(signal: string) {
    await this.client.close()
  }
}
