/**
 * 커스텀 에러 클래스 정의 파일
 */
export class HttpError extends Error {
  status: number;
  data?: any;

  constructor(status: number = 500, message?: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message?: string, data?: any) {
    super(400, message, data);
    this.name = "Bad Request";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message?: string, data?: any) {
    super(401, message, data);
    this.name = "Unauthorized";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message?: string, data?: any) {
    super(403, message, data);
    this.name = "Forbidden";
  }
}

export class NotFoundError extends HttpError {
  constructor(message?: string, data?: any) {
    super(404, message, data);
    this.name = "Not Found";
  }
}

export class ConflictError extends HttpError {
  constructor(message?: string, data?: any) {
    super(409, message, data);
    this.name = "Conflict";
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, data?: any) {
    super(422, message, data);
    this.name = "ValidationError";
  }
}

export class ServerError extends HttpError {
  constructor(message: string, data?: any) {
    super(500, message, data);
    this.name = "ServerError";
  }
}
