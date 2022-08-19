import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      disableErrorMessages: true
    })
  )

  const configService = app.get(ConfigService)
  const PORT = configService.get<number>('PORT')
  await app.listen(PORT)
}
bootstrap()
