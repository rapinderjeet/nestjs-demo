import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { ValidationPipe } from '@nestjs/common';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let uniqueEmail: string;
    let uniqueUsername: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Generate unique email and username for testing
        uniqueEmail = `test${Date.now()}@example.com`;
        uniqueUsername = `testuser${Date.now()}`;
    });

    afterAll(async () => {
        await app.close();
    });

    it('auth register should register a user with unique email, password, and username', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: uniqueEmail,
                password: 'strongpassword',
                username: uniqueUsername,
            })
            .expect(HttpStatus.CREATED);

        expect(response.body).toHaveProperty('token');
    });

    it('auth register should return an error if the email is already in use', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: uniqueEmail,
                password: 'anotherpassword',
                username: 'anotherusername',
            })
            .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty('message', 'Email already exists!');
    });

    it('auth register should return an error if the password is too short', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'test@example.com',
                password: '123',
                username: 'testuser',
            })
            .expect(HttpStatus.BAD_REQUEST);

        console.log("response.body" + JSON.stringify(response.body));

        expect(response.body.message[0]).toBe("password must be longer than or equal to 8 characters");
    });

    it('auth register should return an error if the username is already in use', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'anotheremail@example.com',
                password: 'anotherpassword',
                username: uniqueUsername,
            })
            .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty('message', 'Username already exists!');
    });

    it('auth login should login with correct email and password', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: uniqueEmail, password: 'strongpassword' })
            .expect(200);

        expect(response.body).toHaveProperty('token');
    });

    it('auth login should return an error if email is not found', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'nonexistent@example.com', password: 'password' })
            .expect(404);

        expect(response.body).toHaveProperty('message', 'User not found!');
    });

    it('auth login should return an error if password is incorrect', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: uniqueEmail, password: 'wrongpassword' })
            .expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid email or password!');
    });
});

