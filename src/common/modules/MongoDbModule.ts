import { ConfigService } from '@nestjs/config'
import { MongoModule } from 'nest-mongodb'

const mongoDbModule = MongoModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('DATABASE_URI'),
    dbName: configService.get<string>('DATABASE_NAME')
  })
})

export default mongoDbModule
