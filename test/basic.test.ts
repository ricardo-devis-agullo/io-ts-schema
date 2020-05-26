import * as t from 'io-ts';
import test from 'ava';
import { convert } from '../src';
import { JSONSchema } from '../src/types';

interface Transformations {
  [testDescription: string]: {
    iots: t.Mixed;
    json: JSONSchema;
  };
}

interface PositiveBrand {
  readonly Positive: unique symbol;
}

const Positive = t.brand(
  t.number,
  (n): n is t.Branded<number, PositiveBrand> => n >= 0,
  'Positive'
);

const transformations: Transformations = {
  'converts strings': {
    iots: t.string,
    json: {
      type: 'string',
    },
  },
  'converts null': {
    iots: t.null,
    json: { type: 'null' },
  },
  'converts numbers': {
    iots: t.number,
    json: { type: 'number' },
  },
  'converts integers': {
    iots: t.Int,
    json: { type: 'integer' },
  },
  'converts booleans': {
    iots: t.boolean,
    json: { type: 'boolean' },
  },
  'converts simple arrays': {
    iots: t.array(t.number),
    json: { type: 'array', items: { type: 'number' } },
  },
  'converts readonly arrays': {
    iots: t.readonlyArray(t.number),
    json: { type: 'array', items: { type: 'number' } },
  },
  'converts enums': {
    iots: t.keyof({
      on: null,
      off: null,
      idle: null,
    }),
    json: {
      type: 'string',
      enum: ['on', 'off', 'idle'],
    },
  },
  'converts tuples': {
    iots: t.tuple([t.number, t.string]),
    json: {
      type: 'array',
      items: [{ type: 'number' }, { type: 'string' }],
    },
  },
  'converts types objects': {
    iots: t.type({
      name: t.string,
      age: t.number,
    }),
    json: {
      type: 'object',
      required: ['name', 'age'],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
  'converts partial objects': {
    iots: t.partial({
      name: t.string,
      age: t.number,
    }),
    json: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
  'converts strict objects': {
    iots: t.strict({
      name: t.string,
      age: t.number,
    }),
    json: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'age'],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
  'converts refinements': {
    iots: Positive,
    json: { type: 'number' },
  },
  'puts values with undefined no required': {
    iots: t.type({
      id: t.string,
      name: t.union([t.string, t.undefined]),
      age: t.union([t.string, t.undefined, t.number]),
    }),
    json: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        age: { oneOf: [{ type: 'string' }, { type: 'number' }] },
      },
    },
  },
  'combines partial and type': {
    iots: t.intersection([
      t.type({ name: t.string }),
      t.partial({ age: t.number }),
    ]),
    json: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
};

for (const [title, { iots, json }] of Object.entries(transformations)) {
  test(title, (x) => {
    x.deepEqual(convert(iots), json);
  });
}
