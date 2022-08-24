import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { BuildsModule } from './builds/builds.module'
import { CommentsModule } from './comments/comments.module'
import ConfigModule from './common/modules/ConfigModule'
import MongoDbModule from './common/modules/MongoDbModule'
import { PartsModule } from './parts/parts.module'
import { PostsModule } from './posts/posts.module'
import { ReviewsModule } from './reviews/reviews.module'
import { TokensModule } from './tokens/tokens.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    // config
    ConfigModule,
    MongoDbModule,

    // features
    UsersModule,
    BuildsModule,
    PartsModule,
    CommentsModule,
    PostsModule,
    ReviewsModule,
    AuthModule,
    TokensModule
  ]
})
export class AppModule {}
