import { Controller, Post, Body, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostSchema } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostController {
    constructor(private postService: PostService) { }

    @Post()
    @UseGuards(AuthGuard())
    async createPost(
        @Body()
        post: CreatePostDto,
        @Req() req
    ): Promise<PostSchema> {
        return this.postService.create(post, req.user);
    }

    @Delete(':id')
    @UseGuards(AuthGuard())
    async deletePost(
        @Param('id')
        id: string,
        @Req() req
    ): Promise<PostSchema> {
        return this.postService.deleteById(id, req.user);
    }
}
