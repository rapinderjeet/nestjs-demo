import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

let jwtToken;
describe('PostsController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /posts', () => {
        it('post create should create a post with a valid JWT and valid post data', async () => {
            const resn = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: `test${Date.now()}@gmail.com`,
                    password: '12345678',
                    username: `test${Date.now()}`,
                })

            jwtToken = resn.body.token;

            const postData = {
                title: 'Test Post',
                text: 'This is a test post.',
            };

            const response = await request(app.getHttpServer())
                .post('/posts')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(postData);

            expect(response.status).toBe(HttpStatus.CREATED);
            expect(response.body).toMatchObject(postData);
        });

        it('post create should return a 401 error if the user does not include a valid JWT', async () => {
            const postData = {
                title: 'Test Post',
                text: 'This is a test post.',
            };

            const response = await request(app.getHttpServer())
                .post('/posts')
                .send(postData);

            expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it('post create should return an error if the post data is invalid', async () => {
            const resn = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: `test${Date.now()}@gmail.com`,
                    password: '12345678',
                    username: `test${Date.now()}`,
                })

            jwtToken = resn.body.token;

            const response = await request(app.getHttpServer())
                .post('/posts')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({ text: 'This is a test post.' })
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message[0]).toBe("title must be a string");
        });

        it('post delete should delete a user\'s own post with a valid JWT', async () => {
            const resn = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: `test${Date.now()}@gmail.com`,
                    password: '12345678',
                    username: `test${Date.now()}`,
                })

            jwtToken = resn.body.token;

            const createPostResponse = await request(app.getHttpServer())
                .post('/posts')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    title: 'Test Post',
                    text: 'This is a test post',
                });

            const postId = createPostResponse.body._id;

            const response = await request(app.getHttpServer())
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(response.status).toBe(200);
        });

        it('should return a 404 error if the post does not exist', async () => {
            const resn = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: `test${Date.now()}@gmail.com`,
                    password: '12345678',
                    username: `test${Date.now()}`,
                })

            jwtToken = resn.body.token;

            const response = await request(app.getHttpServer())
                .delete(`/posts/0000001ec7e3b49ba240eaa8`)
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Post not found!');
        });

        it('should return a 401 error if the user does not have permission to delete the post', async () => {
            const resn = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: `test${Date.now()}@gmail.com`,
                    password: '12345678',
                    username: `test${Date.now()}`,
                })

            jwtToken = resn.body.token;

            const createPostResponse = await request(app.getHttpServer())
                .post('/posts')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    title: 'Other User\'s Post',
                    text: 'This is another user\'s post',
                });

            const otherUserPostId = createPostResponse.body._id;

            const newUser = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: `test${Date.now()}@gmail.com`,
                    password: '12345678',
                    username: `test${Date.now()}`,
                });

            const newUserToken = newUser.body.token;

            const response = await request(app.getHttpServer())
                .delete(`/posts/${otherUserPostId}`)
                .set('Authorization', `Bearer ${newUserToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized you cannot delete this post!');
        });
    });
});