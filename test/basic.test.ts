import * as t from 'io-ts';
import test from 'ava';
import { convert } from '../src';
import { JSONSchema } from '../src/types';

interface Transformations {
  [testDescription: string]: {
    input: t.Mixed;
    output: JSONSchema;
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
    input: t.string,
    output: {
      type: 'string',
    },
  },
  'converts null': {
    input: t.null,
    output: { type: 'null' },
  },
  'converts numbers': {
    input: t.number,
    output: { type: 'number' },
  },
  'converts integers': {
    input: t.Int,
    output: { type: 'integer' },
  },
  'converts booleans': {
    input: t.boolean,
    output: { type: 'boolean' },
  },
  'converts simple arrays': {
    input: t.array(t.number),
    output: { type: 'array', items: { type: 'number' } },
  },
  'converts readonly arrays': {
    input: t.readonlyArray(t.number),
    output: { type: 'array', items: { type: 'number' } },
  },
  'converts enums': {
    input: t.keyof({
      on: null,
      off: null,
      idle: null,
    }),
    output: {
      type: 'string',
      enum: ['on', 'off', 'idle'],
    },
  },
  'converts tuples': {
    input: t.tuple([t.number, t.string]),
    output: {
      type: 'array',
      items: [{ type: 'number' }, { type: 'string' }],
    },
  },
  'converts types objects': {
    input: t.type({
      name: t.string,
      age: t.number,
    }),
    output: {
      type: 'object',
      required: ['name', 'age'],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
  'converts partial objects': {
    input: t.partial({
      name: t.string,
      age: t.number,
    }),
    output: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
  'converts strict objects': {
    input: t.strict({
      name: t.string,
      age: t.number,
    }),
    output: {
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
    input: Positive,
    output: { type: 'number' },
  },
  'puts values with undefined no required': {
    input: t.type({
      id: t.string,
      name: t.union([t.string, t.undefined]),
      age: t.union([t.string, t.undefined, t.number]),
    }),
    output: {
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
    input: t.intersection([
      t.type({ name: t.string }),
      t.partial({ age: t.number }),
    ]),
    output: {
      allOf: [
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        },
        { type: 'object', properties: { age: { type: 'number' } } },
      ],
    },
  },
  'combines partial and strict': {
    input: t.intersection([
      t.strict({ name: t.string }),
      t.partial({ age: t.number }),
    ]),
    output: {
      allOf: [
        {
          additionalProperties: false,
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        },
        { type: 'object', properties: { age: { type: 'number' } } },
      ],
    },
  },
};

for (const [title, { input: iots, output: json }] of Object.entries(
  transformations
)) {
  test(title, (x) => {
    x.deepEqual(convert(iots), json);
  });
}
