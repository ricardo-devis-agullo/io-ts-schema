import * as t from 'io-ts';
import { ObjectSchema, JSONSchema } from './types';

function isConvertible(schema: t.Mixed): boolean {
  return !(
    schema instanceof t.UndefinedType ||
    schema instanceof t.FunctionType ||
    schema instanceof t.VoidType
  );
}

function getObjectProps(props: t.Props, modifiers: Modifiers) {
  return Object.fromEntries(
    Object.entries(props)
      .filter(([_key, value]) => isConvertible(value as t.Mixed))
      .map(([key, value]) => [key, convertType(value as t.Mixed, modifiers)])
  );
}

function createObj(
  schema: t.TypeC<any> | t.PartialC<any>,
  modifiers: Modifiers
): ObjectSchema {
  const obj: ObjectSchema = {
    type: 'object',
    properties: getObjectProps(schema.props, modifiers),
  };
  if (modifiers.exact) obj.additionalProperties = false;
  if (schema instanceof t.InterfaceType)
    obj.required = getRequiredProps(schema.props);

  return obj;
}

function getRequiredProps(props: t.Props): string[] {
  return Object.entries(props)
    .filter(([_key, value]) => {
      if (value instanceof t.UndefinedType) return false;
      if (
        value instanceof t.UnionType &&
        value.types.some(
          (innerValue: t.Mixed) => innerValue instanceof t.UndefinedType
        )
      ) {
        return false;
      }
      return true;
    })
    .map(([key]) => key);
}

interface Modifiers {
  exact: boolean;
  readonly: boolean;
}

const initialModifiers: Modifiers = {
  exact: false,
  readonly: false,
};

function convertType(schema: t.Mixed, modifiers: Modifiers): JSONSchema {
  if (schema instanceof t.UnionType) {
    const convertibles = schema.types.filter(isConvertible);
    if (convertibles.length === 1) {
      return convertType(convertibles[0], modifiers);
    }
    return { oneOf: convertibles.map(convertType) };
  } else if (schema instanceof t.NumberType) {
    return { type: 'number' };
  } else if (schema instanceof t.NullType) {
    return { type: 'null' };
  } else if (schema instanceof t.StringType) {
    return { type: 'string' };
  } else if (schema instanceof t.BooleanType) {
    return { type: 'boolean' };
  } else if (schema instanceof t.TupleType) {
    return {
      type: 'array',
      items: schema.types.map((type: t.Mixed) => convertType(type, modifiers)),
    };
  } else if (schema instanceof t.KeyofType) {
    return {
      type: 'string',
      enum: Object.keys(schema.keys),
    };
  } else if (
    schema instanceof t.ArrayType ||
    schema instanceof t.ReadonlyArrayType
  ) {
    return {
      type: 'array',
      items: convertType(schema.type, initialModifiers),
    };
  } else if (schema instanceof t.ReadonlyType) {
    return convertType(schema.type, { ...modifiers, readonly: true });
  } else if (schema instanceof t.ExactType) {
    return convertType(schema.type, { ...modifiers, exact: true });
  } else if (
    schema instanceof t.InterfaceType ||
    schema instanceof t.PartialType
  ) {
    return createObj(schema, modifiers);
  } else if (schema instanceof t.RefinementType) {
    if (schema.name === 'Int') {
      return { type: 'integer' };
    } else {
      return convertType(schema.type, modifiers);
    }
  } else if (schema instanceof t.IntersectionType) {
    return {
      type: 'object',
      allOf: schema.types.map((type: t.Mixed) => convertType(type, modifiers)),
    };
  }

  throw new Error(`Invalid type ${(schema as any)._tag} - ${schema.name}`);
}

export function convert(schema: t.Mixed): JSONSchema {
  return convertType(schema, initialModifiers);
}
