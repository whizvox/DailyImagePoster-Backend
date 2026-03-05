import { ParseError } from "./query";

class ApiResponse {
  status: number;
  type: string;
  message: string | null;

  constructor(status: number, type: string, message?: string) {
    this.status = status;
    this.type = type;
    this.message = message ?? null;
  }
}

class ApiError extends Error {
  response: ApiResponse;

  constructor(response: ApiResponse) {
    super();
    this.response = response;
  }
}

const badRequest = (message?: string): ApiResponse => new ApiResponse(400, "Bad Request", message);
const unauthorized = (message?: string): ApiResponse => new ApiResponse(401, "Unauthorized", message);
const forebidden = (message?: string): ApiResponse => new ApiResponse(403, "Forebidden", message);
const notFound = (message?: string): ApiResponse => new ApiResponse(404, "Not Found", message);
const conflict = (message?: string): ApiResponse => new ApiResponse(409, "Conflict", message);
const contentTooLarge = (message?: string): ApiResponse => new ApiResponse(413, "Content Too Large", message);
const unsupportedMediaType = (message?: string): ApiResponse => new ApiResponse(415, "Unsupported Media Type", message);
const tooManyRequests = (message?: string): ApiResponse => new ApiResponse(429, "Too Many Requests", message);
const internalServerError = (message?: string): ApiResponse => new ApiResponse(500, "Internal Server Error", message);

const fromParseError = (err: unknown): ApiResponse => {
  if (err instanceof ParseError) {
    return badRequest(err.message);
  }
  return internalServerError(`${err}`);
};

export {
  ApiResponse,
  ApiError,
  badRequest,
  unauthorized,
  forebidden,
  notFound,
  conflict,
  contentTooLarge,
  unsupportedMediaType,
  tooManyRequests,
  internalServerError,
  fromParseError,
};
