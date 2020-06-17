import * as t from 'io-ts';
import { either } from 'fp-ts/lib/Either';

interface JSONStringBrand {
  readonly JSONString: unique symbol;
}

interface StringOptions {
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
}

export const jsonString = ({
  minLength = -1,
  maxLength = Infinity,
  pattern = '.*',
}: StringOptions): t.BrandC<t.StringC, JSONStringBrand> =>
  t.brand(
    t.string,
    (n): n is t.Branded<string, JSONStringBrand> => {
      return (
        n.length >= minLength &&
        n.length <= maxLength &&
        new RegExp(pattern).test(n)
      );
    },
    'JSONString'
  );

interface JSONNumberBrand {
  readonly JSONNumber: unique symbol;
}

interface NumberOptions {
  readonly multipleOf?: number;
  readonly minimum?: number;
  readonly exclusiveMinimum?: number;
  readonly maximum?: number;
  readonly exclusiveMaximum?: number;
}

export const jsonNumber = ({
  multipleOf = 1,
  minimum = -Infinity,
  exclusiveMinimum = -Infinity,
  maximum = Infinity,
  exclusiveMaximum = Infinity,
}: NumberOptions): t.BrandC<t.NumberC, JSONStringBrand> =>
  t.brand(
    t.number,
    (n): n is t.Branded<number, JSONNumberBrand> => {
      return (
        n % multipleOf === 0 &&
        n >= minimum &&
        n > exclusiveMinimum &&
        n <= maximum &&
        n < exclusiveMaximum
      );
    },
    'JSONNumber'
  );

export type JSONArray<C extends t.Mixed> = t.Type<
  Array<t.TypeOf<C>>,
  Array<t.OutputOf<C>>,
  unknown
>;

interface ArrayOptions<C extends t.Mixed> {
  codec: C;
  minItems?: number;
  maxItems?: number;
}

export function jsonArray<C extends t.Mixed>({
  codec,
  minItems = -Infinity,
  maxItems = Infinity,
}: ArrayOptions<C>): JSONArray<C> {
  const arr = t.array(codec);
  return new t.Type(
    `JSONArray<${codec.name}`,
    (u): u is Array<t.TypeOf<C>> => arr.is(u),
    (u, c) =>
      either.chain(arr.validate(u, c), (as) => {
        return as.length <= maxItems && as.length >= minItems
          ? t.success(as)
          : t.failure(u, c);
      }),
    (nea) => arr.encode(nea)
  );
}
