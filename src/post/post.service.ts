import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Post } from './post.schema';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../auth/user.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name)
        private postModel: mongoose.Model<Post>
    ) { }

    async getUserPosts(user): Promise<Post[]> {
        return await this.postModel.find({user: user._id});
    }

    async create(post: CreatePostDto, user: User): Promise<Post> {
        const data = Object.assign(post, { user: user._id });
        return await this.postModel.create(post);
    }

    async deleteById(id: string, user): Promise<Post> {
        if (!mongoose.isValidObjectId(id)) {
            throw new NotFoundException('Post not found!');
        }

        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new NotFoundException('Post not found!');
        }

        if (post.user.valueOf() != user._id) {
            throw new UnauthorizedException('Unauthorized you cannot delete this post!');
        }

        return await this.postModel.findByIdAndDelete(id);
    }
}
