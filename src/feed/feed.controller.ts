import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { PostService } from '../post/post.service';
import { AuthGuard } from '@nestjs/passport';
import { Post } from '../post/post.schema';

@Controller('feed')
export class FeedController {
    constructor(private postService: PostService) { }

    @Get()
    @UseGuards(AuthGuard())
    async getUserPosts(
        @Req() req
    ): Promise<Post[]> {
        return this.postService.getUserPosts(req.user);
    }
}
