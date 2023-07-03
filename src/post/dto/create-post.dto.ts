import { IsNotEmpty, IsString, IsEmpty } from "class-validator";
import { User } from "../../auth/user.schema";

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    readonly text: string;

    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsEmpty({ message: "Invalid request!" })
    readonly user: User;
}