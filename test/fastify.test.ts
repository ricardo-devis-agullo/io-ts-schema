import supertest from 'supertest';
import fastify from 'fastify';
import * as t from 'io-ts';
import test from 'ava';
import { isRight } from 'fp-ts/lib/Either';
import { convert } from '../src';

const IOTS = t.strict({ name: t.string, age: t.number });
type IOTS = t.TypeOf<typeof IOTS>;
const JSONSchema = convert(IOTS);

const sample: IOTS = {
  age: 35,
  name: 'Ricardo',
};

function buildFastify() {
  const app = fastify();

  app.route({
    method: 'POST',
    url: '/',
    schema: {
      body: JSONSchema,
      response: {
        200: JSONSchema,
      },
    },
    handler(request, reply) {
      reply.send(request.body);
    },
  });

  return app;
}

test('test', async (x) => {
  const app = buildFastify();

  x.teardown(() => app.close());

  await app.ready();

  const response = await supertest(app.server)
    .post('/')
    .send(sample)
    .set('Accept', 'application/json')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(200);

  const decoded = IOTS.decode(response.body);

  x.true(isRight(decoded));
});
