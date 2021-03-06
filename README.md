# io-ts-schema

Convert io-ts types to JSON schema

## Installation

`npm install io-ts-schema`

## Usage

```typescript
import * as t from 'io-ts';
import * as i from 'io-ts-schema';

const type = t.strict({
  name: t.union([t.string, t.undefined]),
  rank: i.string('One parameter is a description'),
  quote: i.string({
    description: 'Object for more fields',
    minLength: 5,
    maxLenth: 10,
    pattern: 'w+',
  }),
  coordinates: t.array(t.number),
  tags: t.readonlyArray(t.string),
  status: t.keyof({
    on: null,
    off: null,
    idle: null,
  }),
  age: t.union([t.Int, t.string]),
  admin: t.boolean,
  links: t.type({
    facebook: t.string,
    twitter: t.string,
  }),
});

const json = convert(type);
/*
{
    type: 'object',
    required: ['coordinates', 'tags', 'status', 'age', 'admin', 'links', 'rank', 'quote'],
    additionalProperties: false,
    properties: {
      name: { type: 'string' },
      rank: { type: 'string', description: 'One parameter is a description' },
      quote: { 
        type: 'string', 
        description: 'Object for more fields',
        minLength: 5,
        maxLenth: 10,
        pattern: '\w+
      },
      status: {
        type: 'string',
        enum: ['on', 'off', 'idle']
      },
      coordinates: {
        type: 'array',
        items: { type: 'number' }
      },
      tags: {
        type: 'array',
        items: { type: 'string' }
      },
      age: {
        oneOf: [{ type: 'integer' }, { type: 'string' }]
      },
      admin: { type: 'boolean' },
      links: {
        type: 'object',
        required: ['facebook', 'twitter'],
        properties: {
          facebook: { type: 'string' },
          twitter: { type: 'string' }
        }
      }
    }
  }
*/
```

## Why?

You could take your types and use them on [Fastify](https://github.com/fastify/fastify) for [validation](https://www.fastify.io/docs/latest/Validation-and-Serialization/). This is useful if you have already iots types in your system and/or don't want to have a build step to generate interfaces from the JSON schemas.

## Notes

- `t.Function`, `t.Void` and `t.Undefined` will be ignored, but `t.Undefined` will be used if its in a `t.union` to mark object properties as not required.

## Limitations

It won't work with [custom types](https://github.com/gcanti/io-ts/blob/master/index.md#custom-types), and will work with [branded types](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements), but only will take the base type (with the exception of `t.Int`).

You can only add objects in intersections (t.partial, t.type and t.strict will work). Nested intersections are fine as long as its objects all the way down. It will throw with a TypeError if not.
