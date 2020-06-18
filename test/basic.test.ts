import * as t from 'io-ts';
import { DateFromUnixTime } from 'io-ts-types/lib/DateFromUnixTime';
import test, { Constructor } from 'ava';
import * as io from '../src';
import { JSONSchema } from '../src/jsonSchema';

interface Transformations {
  [testDescription: string]: {
    input: t.Mixed;
    output: Error | JSONSchema;
    only?: boolean;
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
  'converts custom string': {
    input: io.string(),
    output: {
      type: 'string',
    },
  },
  'converts custom string with description': {
    input: io.string('Simple description'),
    output: {
      description: 'Simple description',
      type: 'string',
    },
  },
  'converts custom string with options': {
    input: io.string({
      description: 'Long description',
      maxLength: 10,
      minLength: 5,
      pattern: '.+',
    }),
    output: {
      description: 'Long description',
      maxLength: 10,
      minLength: 5,
      pattern: '.+',
      type: 'string',
    },
  },
  'converts custom number': {
    input: io.number(),
    output: {
      type: 'number',
    },
  },
  'converts custom number with description': {
    input: io.number('Simple description'),
    output: {
      description: 'Simple description',
      type: 'number',
    },
  },
  'converts custom number with options': {
    input: io.number({
      description: 'Long description',
      minimum: 5,
      maximum: 10,
    }),
    output: {
      description: 'Long description',
      minimum: 5,
      maximum: 10,
      type: 'number',
    },
  },
  'converts custom number with exclusive options': {
    input: io.number({
      description: 'Long description',
      exclusiveMinimum: 5,
      exclusiveMaximum: 10,
    }),
    output: {
      description: 'Long description',
      exclusiveMinimum: 5,
      exclusiveMaximum: 10,
      type: 'number',
    },
  },
  'converts custom arrays': {
    input: io.array({
      codec: t.number,
      description: 'Array description',
      minItems: 5,
      maxItems: 10,
    }),
    output: {
      type: 'array',
      description: 'Array description',
      minItems: 5,
      maxItems: 10,
      items: { type: 'number' },
    },
  },
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
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    },
  },
  'combines partial and strict': {
    input: t.intersection([
      t.strict({ name: t.string }),
      t.partial({ age: t.number }),
    ]),
    output: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    },
  },
  'combines nested intersections': {
    input: t.intersection([
      t.type({ name: t.string }),
      t.intersection([
        t.type({ age: t.number }),
        t.partial({ isAdmin: t.boolean }),
      ]),
    ]),
    output: {
      type: 'object',
      required: ['name', 'age'],
      properties: {
        name: { type: 'string' },

        age: { type: 'number' },
        isAdmin: { type: 'boolean' },
      },
    },
  },
  'throws if the intersection has anything other than objects': {
    input: t.intersection([t.type({ name: t.string }), t.number]),
    output: new Error(
      'Only objects (partial, type or strict) are allowed in intersections, got NumberType'
    ),
  },
  'throws if trying to pass a new type': {
    input: DateFromUnixTime,
    output: new Error('Invalid type undefined - DateFromUnixTime'),
  },
};

for (const [title, { input, output, only }] of Object.entries(
  transformations
)) {
  const testFn = only ? test.only.bind(test) : test;

  testFn(title, (x) => {
    if (output instanceof Error) {
      const error = x.throws(
        () => {
          io.convert(input);
        },
        { instanceOf: output.constructor as Constructor }
      );

      x.is(error.message, output.message);
    } else {
      x.deepEqual(io.convert(input), output);
    }
  });
}
