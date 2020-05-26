# io-ts-schema

Convert io-ts types to JSON schema

## Installation

Not available yet on NPM.

## Usage

```typescript
import { convert } from 'io-ts-schema';

const type = t.type({
  name: t.string,
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
    required: ['name', 'coordinates', 'tags', 'status', 'age', 'admin', 'links'],
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
