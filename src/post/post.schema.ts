import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "../auth/user.schema";
import { Document } from "mongoose";

@Schema({
    timestamps: true
})
export class Post extends Document {
    @Prop()
    text: string;

    @Prop()
    title: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);