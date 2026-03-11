import { validate as uuidValidate, version as uuidVersion } from "uuid";
import ParseError from "./query/parse-error";

type QueryValue = string | undefined;

const parse = <Type>(value: QueryValue, parser: (param: string) => Type): Type | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return parser(value);
};

const parseTrimmedString = (value: QueryValue, field?: string): string | undefined => {
  return parse(value, (v) => v.trim());
};

const parseNumber = (value: QueryValue, field?: string): number | undefined => {
  return parse(value, (v) => {
    const result = Number(v);
    if (Number.isNaN(result)) {
      throw new ParseError("Invalid number", field);
    }
    return result;
  });
};

const parseBoolean = (value: QueryValue, field?: string): boolean | undefined => {
  return parse(value, (v) => {
    if (v === "0") {
      return false;
    }
    if (v === "1") {
      return true;
    }
    throw new ParseError("Invalid boolean, must be 0 or 1", field);
  });
};

const parseDate = (value: QueryValue, field?: string): Date | undefined => {
  return parse(value, (v) => {
    const result = new Date(v);
    if (Number.isNaN(result.getTime())) {
      throw new ParseError("Invalid date, must be ISO-8601 format", field);
    }
    return result;
  });
};

const parseUuid = (value: QueryValue, field?: string): string | undefined => {
  return parse(value, (v) => {
    const valid = uuidValidate(v) && uuidVersion(v) === 4;
    if (!valid) {
      throw new ParseError("Invalid UUID, either malformed or not v4", field);
    }
    return v;
  });
};

export { ParseError, parse, parseTrimmedString, parseNumber, parseBoolean, parseDate, parseUuid };
