import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
    ) {

    }

    async signUp(signUpDto): Promise<{ token: string }> {
        const { username, email, password } = signUpDto;
        const hashedPassword = await bcrypt.hash(password, 10);

        const search_user_name = await this.userModel.findOne({ username: username });
        if (search_user_name) {
            throw new BadRequestException('Username already exists!');
        }

        const search_email = await this.userModel.findOne({ email: email });
        if (search_email) {
            throw new BadRequestException('Email already exists!');
        }

        const user = await this.userModel.create(
            {
                username,
                email,
                password: hashedPassword
            }
        );

        const token = this.jwtService.sign({ id: user._id });
        return { token };
    }

    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { email, password } = loginDto;

        const user = await this.userModel.findOne({ email: email });
        if (!user) {
            throw new NotFoundException('User not found!');
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            throw new UnauthorizedException('Invalid email or password!');
        }

        const token = this.jwtService.sign({ id: user._id });
        return { token };
    }
}
