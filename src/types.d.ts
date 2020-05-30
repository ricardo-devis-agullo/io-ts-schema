export type JSONSchema =
  | NullSchema
  | ObjectSchema
  | NumberSchema
  | StringSchema
  | BooleanSchema
  | ArraySchema
  | UnionSchema
  | IntegerSchema
  | IntersectionSchema;

export interface ObjectSchema {
  type: 'object';
  required?: string[];
  additionalProperties?: boolean;
  properties: Record<string, JSONSchema>;
}

interface NullSchema {
  type: 'null';
}

interface NumberSchema {
  type: 'number';
}

interface IntegerSchema {
  type: 'integer';
}

interface StringSchema {
  type: 'string';
  enum?: string[];
}

interface BooleanSchema {
  type: 'boolean';
}

interface ArraySchema {
  type: 'array';
  items: JSONSchema | JSONSchema[];
}

interface UnionSchema {
  oneOf: JSONSchema[];
}

interface IntersectionSchema {
  type: 'object';
  allOf: JSONSchema[];
}
