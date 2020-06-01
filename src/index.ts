import * as t from 'io-ts';
import { ObjectSchema, JSONSchema } from './types';
import * as is from './typeChecks';

function isConvertible(schema: t.Mixed): boolean {
  return !(
    is.undefinedType(schema) ||
    is.functionType(schema) ||
    is.voidType(schema)
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
  if (is.interfaceType(schema)) obj.required = getRequiredProps(schema.props);

  return obj;
}

function extractObj(type: t.Mixed, modifiers: Modifiers): ObjectSchema {
  if (is.partialType(type) || is.interfaceType(type)) {
    return createObj(type, modifiers);
  } else if (is.exactType(type)) {
    return extractObj(type.type, { ...modifiers, exact: true });
  }
  throw new TypeError(
    `Only objects (partial, type or strict) are allowed in intersections, got ${
      (type as any)._tag || type.name
    }`
  );
}

function createIntersectedObj(
  schema: t.IntersectionType<t.Mixed[]>,
  modifiers: Modifiers
) {
  const objects: ObjectSchema = schema.types
    .map((type: any) => {
      if (is.intersectionType(type)) {
        return createIntersectedObj(type, modifiers);
      } else {
        return extractObj(type, modifiers);
      }
    })
    .reduce(
      (acc: ObjectSchema, obj: ObjectSchema) => {
        const newOb = {
          ...acc,
          required: [...acc.required!, ...(obj.required || [])],
          properties: { ...acc.properties, ...obj.properties },
        };

        if (obj.additionalProperties === false) {
          newOb.additionalProperties = false;
        }

        return newOb;
      },
      { type: 'object', required: [], properties: {} }
    );

  return objects;
}

function getRequiredProps(props: t.Props): string[] {
  return Object.entries(props)
    .filter(([_key, value]) => {
      if (is.undefinedType(value)) return false;
      if (
        is.unionType(value) &&
        value.types.some((innerValue: t.Mixed) => is.undefinedType(innerValue))
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
  if (is.unionType(schema)) {
    const convertibles = schema.types.filter(isConvertible);
    if (convertibles.length === 1) {
      return convertType(convertibles[0], modifiers);
    }
    return {
      oneOf: convertibles.map((convertible) =>
        convertType(convertible, modifiers)
      ),
    };
  } else if (is.numberType(schema)) {
    return { type: 'number' };
  } else if (is.nullType(schema)) {
    return { type: 'null' };
  } else if (is.stringType(schema)) {
    return { type: 'string' };
  } else if (is.booleanType(schema)) {
    return { type: 'boolean' };
  } else if (is.tupleType(schema)) {
    return {
      type: 'array',
      items: schema.types.map((type: t.Mixed) => convertType(type, modifiers)),
    };
  } else if (is.keyOfType(schema)) {
    return {
      type: 'string',
      enum: Object.keys(schema.keys),
    };
  } else if (is.arrayType(schema) || is.readonlyArrayType(schema)) {
    return {
      type: 'array',
      items: convertType(schema.type, initialModifiers),
    };
  } else if (is.readonlyType(schema)) {
    return convertType(schema.type, { ...modifiers, readonly: true });
  } else if (is.exactType(schema)) {
    return convertType(schema.type, { ...modifiers, exact: true });
  } else if (is.interfaceType(schema) || is.partialType(schema)) {
    return createObj(schema, modifiers);
  } else if (is.refinementType(schema)) {
    if (schema.name === 'Int') {
      return { type: 'integer' };
    } else {
      return convertType(schema.type, modifiers);
    }
  } else if (is.intersectionType(schema)) {
    return createIntersectedObj(schema, modifiers);
  }

  throw new Error(`Invalid type ${(schema as any)._tag} - ${schema.name}`);
}

export function convert(schema: t.Mixed): JSONSchema {
  return convertType(schema, initialModifiers);
}
