import { ConfigModule } from '@nestjs/config'
import Joi from 'joi'

const configModule = ConfigModule.forRoot({
  envFilePath: ['.env'],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production'),
    PORT: Joi.number(),
    DATABASE_URI: Joi.string().uri({
      scheme: ['mongodb', 'mongodb+srv']
    }),
    DATABASE_NAME: Joi.string()
  }),
  isGlobal: true,
  validationOptions: {
    abortEarly: true
  }
})

export default configModule
