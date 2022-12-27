import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { AppModule } from 'src/app.module'
import { InvalidJsonFilter } from './common/filters/InvalidJsonFilter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('v1')

  app.enableCors()
  app.use(compression())
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.useGlobalFilters(new InvalidJsonFilter())

  const configService = app.get(ConfigService)
  const PORT = configService.get<number>('PORT')
  await app.listen(PORT)
}
bootstrap()
