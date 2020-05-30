# io-ts-schema

Convert io-ts types to JSON schema

## Installation

`npm install io-ts-json-schema`

## Usage

```typescript
import { convert } from 'io-ts-schema';

const type = t.strict({
  name: t.union([t.string, t.undefined]),
  coordinates: t.array(t.number),
  tags: t.readonlyArray(t.string),
  status: t.keyof({
    on: null,
    off: null,
    idle: null,
  }),
  age: t.union([t.number, t.string]),
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
    required: ['coordinates', 'tags', 'status', 'age', 'admin', 'links'],
    additionalProperties: false,
    properties: {
      name: { type: 'string' },
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
        oneOf: [{ type: 'number' }, { type: 'string' }]
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

You could take your types and use them on [Fastify](https://github.com/fastify/fastify) for [validation](https://www.fastify.io/docs/latest/Validation-and-Serialization/).

## Notes

- `t.Function`, `t.Void` and `t.Undefined` will be ignored, but `t.Undefined` will be used if its in a `t.union` to mark object properties as not required.

## Limitations

It won't work with [custom types](https://github.com/gcanti/io-ts/blob/master/index.md#custom-types), and will work with [branded types](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements), but only will take the base type (with the exception of `t.Int`).
