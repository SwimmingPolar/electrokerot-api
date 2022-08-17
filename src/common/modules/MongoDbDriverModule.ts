import { MongoDbDriverModule } from 'nest-mongodb-driver'
import { ConfigModule, ConfigService } from '@nestjs/config'

const mongoDbDriverModule = MongoDbDriverModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    url: configService.get<string>('DATABASE_URL')
  })
})

export default mongoDbDriverModule
