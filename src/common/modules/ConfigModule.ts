import { ConfigModule } from '@nestjs/config'
import Joi from 'joi'

const configModule = ConfigModule.forRoot({
  envFilePath: ['.env'],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production'),
    PORT: Joi.number(),
    DATABASE_URL: Joi.string().uri({
      scheme: ['mongodb', 'mongodb+srv']
    })
  }),
  isGlobal: true,
  validationOptions: {
    abortEarly: true
  }
})

export default configModule
