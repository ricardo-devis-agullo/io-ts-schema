export type JSONSchema =
  | NullSchema
  | ObjectSchema
  | NumberSchema
  | StringSchema
  | BooleanSchema
  | ArraySchema
  | UnionSchema
  | IntegerSchema;

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
  description?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  type: 'number';
}

interface IntegerSchema {
  type: 'integer';
}

interface StringSchema {
  description?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  type: 'string';
  enum?: string[];
}

interface BooleanSchema {
  type: 'boolean';
}

interface ArraySchema {
  description?: string;
  minItems?: number;
  maxItems?: number;
  type: 'array';
  items: JSONSchema | JSONSchema[];
}

interface UnionSchema {
  oneOf: JSONSchema[];
}
