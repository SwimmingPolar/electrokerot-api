import { Module } from '@nestjs/common'
import ConfigModule from './common/modules/ConfigModule'
import DatabaseModule from './common/modules/MongoDbDriverModule'
import { UsersModule } from './users/users.module'
import { BuildsModule } from './builds/builds.module'
import { PartsModule } from './parts/parts.module'
import { CommentsModule } from './comments/comments.module'
import { PostsModule } from './posts/posts.module'
import { ReviewsModule } from './reviews/reviews.module'
import { LinksModule } from './links/links.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    // config
    ConfigModule,
    DatabaseModule,
    // features
    UsersModule,
    BuildsModule,
    PartsModule,
    CommentsModule,
    PostsModule,
    ReviewsModule,
    LinksModule,
    AuthModule
  ]
})
export class AppModule {}
