import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from '../post/post.schema';
import { PostService } from '../post/post.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }])
  ],
  controllers: [FeedController],
  providers: [PostService]
})
export class FeedModule { }
