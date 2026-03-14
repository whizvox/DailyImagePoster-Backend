import { Query } from "express-serve-static-core";
import Parameter from "./parameter";
import ParseError from "./parse-error";

/**
 * Parse a request's query into JavaScript objects. For example, if you're expecting a query such as
 * `name=John&age=30&birthday=1986-01-01`, you can pass the following for `params`:
 * `{ name: stringParameter(), age: numberParameter(), birthday: dateParameter() }`, and expect to receive the following
 * object: `{ name: "John", age: 30, birthday: Date("1986-01-01") }`
 * @param query The request query
 * @param params All parameters to parse
 * @returns An object corresponding to the specified parameters
 */
function parseQuery<T extends { [key: string]: any }>(
  query: Query,
  params: { [Key in keyof T]: Parameter<T[Key]> },
): { [Key in keyof T]?: T[Key] } {
  const result = {} as { [P in keyof T]?: T[P] };
  const missing: string[] = [];
  for (const key in params) {
    const param = params[key]!;
    const value = query[key];
    if (value === undefined) {
      if (param.defaultValue !== null) {
        result[key] = param.defaultValue();
      } else if (!param.required) {
        result[key] = undefined;
      } else if (param.required) {
        missing.push(key);
      }
    } else {
      result[key] = param.parser(value as string, key);
    }
  }
  if (missing.length > 0) {
    throw new ParseError("Missing required parameter(s)", missing.join(", "));
  }
  return result;
}

export default parseQuery;
