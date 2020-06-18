import * as t from 'io-ts';
import { JSONString, JSONNumber, JSONArray } from './iotsJsonTypes';

export function numberType(x: t.Mixed): x is t.NumberType {
  return (x as any)._tag === 'NumberType';
}

export function nullType(x: t.Mixed): x is t.NullType {
  return (x as any)._tag === 'NullType';
}

export function stringType(x: t.Mixed): x is t.StringType {
  return (x as any)._tag === 'StringType';
}

export function booleanType(x: t.Mixed): x is t.BooleanType {
  return (x as any)._tag === 'BooleanType';
}

export function tupleType(x: t.Mixed): x is t.TupleType<t.Mixed[]> {
  return (x as any)._tag === 'TupleType';
}

export function arrayType(x: t.Mixed): x is t.ArrayType<t.Mixed> {
  return (x as any)._tag === 'ArrayType';
}

export function readonlyArrayType(
  x: t.Mixed
): x is t.ReadonlyArrayType<t.Mixed> {
  return (x as any)._tag === 'ReadonlyArrayType';
}

export function keyOfType(
  x: t.Mixed
): x is t.KeyofType<Record<string, unknown>> {
  return (x as any)._tag === 'KeyofType';
}

export function exactType(x: t.Mixed): x is t.ExactType<t.Mixed> {
  return (x as any)._tag === 'ExactType';
}

export function interfaceType(
  x: t.Mixed
): x is t.InterfaceType<Record<string, t.Mixed>> {
  return (x as any)._tag === 'InterfaceType';
}

export function partialType(
  x: t.Mixed
): x is t.PartialType<Record<string, t.Mixed>> {
  return (x as any)._tag === 'PartialType';
}

export function refinementType(x: t.Mixed): x is t.RefinementType<t.Mixed> {
  return (x as any)._tag === 'RefinementType';
}

export function intersectionType(
  x: t.Mixed
): x is t.IntersectionType<t.Mixed[]> {
  return (x as any)._tag === 'IntersectionType';
}

export function readonlyType(x: t.Mixed): x is t.ReadonlyType<t.Mixed> {
  return (x as any)._tag === 'ReadonlyType';
}

export function unionType(x: t.Mixed): x is t.UnionType<t.Mixed[]> {
  return (x as any)._tag === 'UnionType';
}

export function undefinedType(x: t.Mixed): x is t.UndefinedType {
  return (x as any)._tag === 'UndefinedType';
}

export function functionType(x: t.Mixed): x is t.FunctionType {
  return (x as any)._tag === 'FunctionType';
}

export function voidType(x: t.Mixed): x is t.VoidType {
  return (x as any)._tag === 'VoidType';
}

export function jsonStringType(x: t.Mixed): x is JSONString {
  return x.name === 'JSONString';
}

export function jsonNumberType(x: t.Mixed): x is JSONNumber {
  return x.name === 'JSONNumber';
}

export function jsonArrayType(x: t.Mixed): x is JSONArray {
  return !!x.name.match(/^JSONArray<\w+>$/);
}
