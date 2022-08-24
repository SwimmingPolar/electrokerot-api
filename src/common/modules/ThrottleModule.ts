import { ThrottlerModule } from '@nestjs/throttler'
const throttlerModule = ThrottlerModule.forRoot({
  ttl: 60,
  limit: 5
})

export default throttlerModule
