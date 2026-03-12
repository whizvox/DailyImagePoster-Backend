import { v4 as uuidv4, validate as validateUuid } from "uuid";
import Parameter from "./parameter";
import ParseError from "./parse-error";

interface Options<Type> {
  defaultValue?: Type | (() => Type);
  required?: boolean;
}

/**
 * @param options.trim Whether to trim the resulting string (default: true)
 * @param options.notBlank Whether to not allow blank strings (default: true)
 * @param options.defaultValue The default value if not present in the query (default: null)
 * @param options.required Whether this parameter is required (default: false)
 * @returns
 */
const stringParameter = (
  options: Options<string> & { trim?: boolean; notBlank?: boolean } = {},
): Parameter<string> => {
  if (options.trim === undefined) {
    options.trim = false;
  }
  if (options.notBlank === undefined) {
    options.notBlank = false;
  }
  return new Parameter(
    (value, name) => {
      let result: string;
      if (options.trim) {
        result = value.trim();
      } else {
        result = value;
      }
      if (options.notBlank && result.length === 0) {
        throw new ParseError("Cannot be blank", name);
      }
      return result;
    },
    options.defaultValue,
    options.required,
  );
};

const numberParameter = (
  options: Options<number> & { min?: number; max?: number } = {},
): Parameter<number> => {
  return new Parameter(
    (value, name) => {
      const n = Number(value);
      if (Number.isNaN(n)) {
        throw new ParseError(`Not a valid number: ${value}`, name);
      }
      if (options.min !== undefined && n < options.min) {
        throw new ParseError(`Number cannot be less than ${options.min}`, name);
      }
      if (options.max !== undefined && n > options.max) {
        throw new ParseError(`Number cannot be greater than ${options.max}`, name);
      }
      return n;
    },
    options.defaultValue,
    options.required,
  );
};

const booleanParameter = (options: Options<boolean> = {}): Parameter<boolean> => {
  return new Parameter(
    (value, name) => {
      if (value === "0") {
        return false;
      }
      if (value === "1") {
        return true;
      }
      throw new ParseError("Not a valid boolean", name);
    },
    options.defaultValue,
    options.required,
  );
};

const uuidParameter = (
  options: Options<string> & { defaultGenerate?: boolean } = {},
): Parameter<string> => {
  if (options.defaultGenerate && options.defaultValue === undefined) {
    options.defaultValue = () => uuidv4();
  }
  return new Parameter(
    (value, name) => {
      if (!validateUuid(value)) {
        throw new ParseError(`Not a valid UUID: ${value}`, name);
      }
      return value;
    },
    options.defaultValue,
    options.required,
  );
};

const dateParameter = (options: Options<Date> & { defaultNow?: boolean } = {}): Parameter<Date> => {
  if (options.defaultNow && options.defaultValue === undefined) {
    options.defaultValue = () => new Date();
  }
  return new Parameter(
    (value, name) => {
      const result = new Date(value);
      if (Number.isNaN(result.getTime())) {
        throw new ParseError("Invalid date, must be ISO-8601 format", name);
      }
      return result;
    },
    options.defaultValue,
    options.required,
  );
};

const enumParameter = (
  values: string[],
  options: Options<string> & { ignoreCase?: boolean } = {},
): Parameter<string> => {
  options = { ignoreCase: false, ...options };
  return new Parameter(
    (value, name) => {
      for (const enumValue of values) {
        if (options.ignoreCase) {
          if (enumValue.toLowerCase() === value.toLowerCase()) {
            return enumValue;
          }
        } else {
          if (enumValue === value) {
            return enumValue;
          }
        }
      }
      throw new ParseError(`Invalid value, must be one of [${values.join(", ")}]`, name);
    },
    options.defaultValue,
    options.required,
  );
};

export {
  booleanParameter,
  dateParameter,
  numberParameter,
  stringParameter,
  uuidParameter,
  enumParameter,
  type Options,
};
