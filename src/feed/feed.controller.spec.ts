import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ValidationPipe } from '@nestjs/common';

describe('FeedController (GET /feed)', () => {
  let app: INestApplication;
  let jwtToken: string;

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

  it('feed should return the user feed with a valid JWT', async () => {
    const resn = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test${Date.now()}@gmail.com`,
        password: '12345678',
        username: `test${Date.now()}`,
      })

    jwtToken = resn.body.token;

    await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: 'Test Post',
        text: 'This is a test post.',
      });

    const response = await request(app.getHttpServer())
      .get('/feed')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('feed should return a 401 error if no valid JWT is provided', async () => {
    return request(app.getHttpServer())
      .get('/feed')
      .expect(401);
  });
});
