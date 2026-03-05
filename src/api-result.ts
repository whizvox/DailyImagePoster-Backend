interface AdditionalProperties {
  data?: unknown;
  message?: string | undefined;
}

class ApiResponse {
  status: number;
  type: string;
  data?: unknown;
  message?: string;

  constructor(status: number, type: string, props: AdditionalProperties = {}) {
    this.status = status;
    this.type = type;
    if (props.data !== undefined) {
      this.data = props.data;
    }
    if (props.message !== undefined) {
      this.message = props.message;
    }
  }
}

class ApiError extends Error {
  response: ApiResponse;

  constructor(response: ApiResponse) {
    super();
    this.response = response;
  }
}

const ok = (data?: unknown): ApiResponse => new ApiResponse(200, "Ok", { data });
const created = (data?: unknown): ApiResponse => new ApiResponse(201, "Created", { data });
const badRequest = (message?: string): ApiResponse => new ApiResponse(400, "Bad Request", { message });
const unauthorized = (message?: string): ApiResponse => new ApiResponse(401, "Unauthorized", { message });
const forebidden = (message?: string): ApiResponse => new ApiResponse(403, "Forebidden", { message });
const notFound = (message?: string): ApiResponse => new ApiResponse(404, "Not Found", { message });
const conflict = (message?: string): ApiResponse => new ApiResponse(409, "Conflict", { message });
const contentTooLarge = (message?: string): ApiResponse => new ApiResponse(413, "Content Too Large", { message });
const unsupportedMediaType = (message?: string): ApiResponse =>
  new ApiResponse(415, "Unsupported Media Type", { message });
const tooManyRequests = (message?: string): ApiResponse => new ApiResponse(429, "Too Many Requests", { message });
const internalServerError = (message?: string): ApiResponse =>
  new ApiResponse(500, "Internal Server Error", { message });

export {
  ApiResponse,
  ApiError,
  ok,
  created,
  badRequest,
  unauthorized,
  forebidden,
  notFound,
  conflict,
  contentTooLarge,
  unsupportedMediaType,
  tooManyRequests,
  internalServerError,
};
