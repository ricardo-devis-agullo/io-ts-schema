import supertest from 'supertest';
import fastify from 'fastify';
import * as t from 'io-ts';
import test from 'ava';
import { isRight } from 'fp-ts/lib/Either';
import { convert } from '../src';
import { JSONSchema } from '../src/jsonSchema';

type TestData<a extends Record<string, unknown>> = {
  title: string;
  type: t.Type<a, unknown, t.mixed>;
  data: a;
  only?: boolean;
};

function buildFastify(jsonSchema: JSONSchema) {
  const app = fastify();

  app.route({
    method: 'POST',
    url: '/',
    schema: {
      body: jsonSchema,
      response: {
        200: jsonSchema,
      },
    },
    handler(request, reply) {
      reply.send(request.body);
    },
  });

  return app;
}

function apiTest<a extends Record<string, unknown>>(testData: TestData<a>) {
  const testFn = testData.only ? test.only.bind(test) : test;

  testFn(testData.title, async (x) => {
    const app = buildFastify(convert(testData.type));

    x.teardown(() => app.close());

    await app.ready();

    const response = await supertest(app.server)
      .post('/')
      .send(testData.data)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    const decoded = testData.type.decode(response.body);

    x.true(isRight(decoded));
  });
}

apiTest({
  title: 'converts data back and forth',
  type: t.strict({ name: t.string, age: t.number }),
  data: { age: 35, name: 'Ricardo' },
});

apiTest({
  title: 'works with optional data',
  type: t.intersection([
    t.type({ name: t.string }),
    t.partial({ age: t.number }),
  ]),
  data: { name: 'Ricardo' },
});
