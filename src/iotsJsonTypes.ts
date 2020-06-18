import * as t from 'io-ts';
import { either } from 'fp-ts/lib/Either';

interface StringOptions {
  readonly description?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
}

export type JSONString = t.Type<string, string, unknown> & {
  jsonSchema: StringOptions;
};

export const string = (
  optionsOrDescription: StringOptions | string = {}
): JSONString => {
  const options: StringOptions =
    typeof optionsOrDescription === 'string'
      ? { description: optionsOrDescription }
      : optionsOrDescription;
  const { minLength = -1, maxLength = Infinity, pattern = '.*' } = options;

  return Object.assign(
    new t.Type<string, string, unknown>(
      'JSONString',
      (u): u is string => typeof u === 'string',
      (u, c) =>
        either.chain(t.string.validate(u, c), (as) => {
          return as.length >= minLength &&
            as.length <= maxLength &&
            new RegExp(pattern).test(as)
            ? t.success(as)
            : t.failure(u, c);
        }),
      (nea) => nea
    ),
    { jsonSchema: options }
  );
};

interface NumberOptions {
  readonly description?: string;
  readonly multipleOf?: number;
  readonly minimum?: number;
  readonly exclusiveMinimum?: number;
  readonly maximum?: number;
  readonly exclusiveMaximum?: number;
}

export type JSONNumber = t.Type<number, number, unknown> & {
  jsonSchema: StringOptions;
};

export const number = (
  optionsOrDescription: NumberOptions | string = {}
): JSONNumber => {
  const options: NumberOptions =
    typeof optionsOrDescription === 'string'
      ? { description: optionsOrDescription }
      : optionsOrDescription;
  const {
    multipleOf = 1,
    minimum = -Infinity,
    exclusiveMinimum = -Infinity,
    maximum = Infinity,
    exclusiveMaximum = Infinity,
  } = options;

  return Object.assign(
    new t.Type(
      'JSONNumber',
      (u): u is number => typeof u === 'number',
      (u, c) =>
        either.chain(t.number.validate(u, c), (as) => {
          return as % multipleOf === 0 &&
            as >= minimum &&
            as > exclusiveMinimum &&
            as <= maximum &&
            as < exclusiveMaximum
            ? t.success(as)
            : t.failure(u, c);
        }),
      (nea) => nea
    ),
    { jsonSchema: options }
  );
};

export type JSONArray<C extends t.Mixed = t.UnknownC> = t.Type<
  Array<t.TypeOf<C>>,
  Array<t.OutputOf<C>>,
  unknown
> & { jsonSchema: ArrayJSONOptions; type: C };

interface ArrayJSONOptions {
  description?: string;
  minItems?: number;
  maxItems?: number;
}

interface ArrayOptions<C extends t.Mixed> extends ArrayJSONOptions {
  codec: C;
}

export function array<C extends t.Mixed>(
  options: ArrayOptions<C>
): JSONArray<C> {
  const { codec, ...arrayJsonOptions } = options;
  const { minItems = -Infinity, maxItems = Infinity } = arrayJsonOptions;
  const arr = t.array(codec);
  return Object.assign(
    new t.Type(
      `JSONArray<${codec.name}>`,
      (u): u is Array<t.TypeOf<C>> => arr.is(u),
      (u, c) =>
        either.chain(arr.validate(u, c), (as) => {
          return as.length <= maxItems && as.length >= minItems
            ? t.success(as)
            : t.failure(u, c);
        }),
      (nea) => arr.encode(nea)
    ),
    { jsonSchema: arrayJsonOptions, type: codec }
  );
}
