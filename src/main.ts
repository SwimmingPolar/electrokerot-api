import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from 'src/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.setGlobalPrefix('v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      disableErrorMessages: true
    })
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const configService = app.get(ConfigService)
  const PORT = configService.get<number>('PORT')
  await app.listen(PORT)
}
bootstrap()
