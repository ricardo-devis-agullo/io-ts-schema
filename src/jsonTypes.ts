import * as t from 'io-ts';
import { either } from 'fp-ts/lib/Either';

interface JSONStringBrand {
  readonly JSONString: unique symbol;
}

interface StringOptions {
  readonly description?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
}

interface JSONString extends t.BrandC<t.StringC, JSONStringBrand> {
  jsonSchema: StringOptions;
}

export const jsonString = (
  optionsOrDescription: StringOptions | string = {}
): JSONString => {
  const options: StringOptions =
    typeof optionsOrDescription === 'string'
      ? { description: optionsOrDescription }
      : optionsOrDescription;

  return Object.assign(
    t.brand(
      t.string,
      (n): n is t.Branded<string, JSONStringBrand> => {
        const {
          minLength = -1,
          maxLength = Infinity,
          pattern = '.*',
        } = options;
        return (
          n.length >= minLength &&
          n.length <= maxLength &&
          new RegExp(pattern).test(n)
        );
      },
      'JSONString'
    ),
    { jsonSchema: options }
  );
};

interface JSONNumberBrand {
  readonly JSONNumber: unique symbol;
}

interface NumberOptions {
  readonly description?: string;
  readonly multipleOf?: number;
  readonly minimum?: number;
  readonly exclusiveMinimum?: number;
  readonly maximum?: number;
  readonly exclusiveMaximum?: number;
}

interface JSONNumber extends t.BrandC<t.NumberC, JSONNumberBrand> {
  jsonSchema: NumberOptions;
}

export const jsonNumber = (
  optionsOrDescription: NumberOptions | string = {}
): JSONNumber => {
  const options: NumberOptions =
    typeof optionsOrDescription === 'string'
      ? { description: optionsOrDescription }
      : optionsOrDescription;

  return Object.assign(
    t.brand(
      t.number,
      (n): n is t.Branded<number, JSONNumberBrand> => {
        const {
          multipleOf = 1,
          minimum = -Infinity,
          exclusiveMinimum = -Infinity,
          maximum = Infinity,
          exclusiveMaximum = Infinity,
        } = options;

        return (
          n % multipleOf === 0 &&
          n >= minimum &&
          n > exclusiveMinimum &&
          n <= maximum &&
          n < exclusiveMaximum
        );
      },
      'JSONNumber'
    ),
    { jsonSchema: options }
  );
};

export type JSONArray<C extends t.Mixed> = t.Type<
  Array<t.TypeOf<C>>,
  Array<t.OutputOf<C>>,
  unknown
> & { jsonSchema: ArrayJSONOptions };

interface ArrayJSONOptions {
  description?: string;
  minItems?: number;
  maxItems?: number;
}

interface ArrayOptions<C extends t.Mixed> extends ArrayJSONOptions {
  codec: C;
}

export function jsonArray<C extends t.Mixed>(
  options: ArrayOptions<C>
): JSONArray<C> {
  const { codec, ...arrayJsonOptions } = options;
  const { minItems = -Infinity, maxItems = Infinity } = arrayJsonOptions;
  const arr = t.array(codec);
  return Object.assign(
    new t.Type(
      `JSONArray<${codec.name}`,
      (u): u is Array<t.TypeOf<C>> => arr.is(u),
      (u, c) =>
        either.chain(arr.validate(u, c), (as) => {
          return as.length <= maxItems && as.length >= minItems
            ? t.success(as)
            : t.failure(u, c);
        }),
      (nea) => arr.encode(nea)
    ),
    { jsonSchema: arrayJsonOptions }
  );
}
