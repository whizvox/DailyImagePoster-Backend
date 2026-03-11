class ParseError extends Error {
  constructor(reason: string, field?: string) {
    super(`${field === undefined ? "" : "(" + field + ") "}${reason}`);
  }
}

export default ParseError;
