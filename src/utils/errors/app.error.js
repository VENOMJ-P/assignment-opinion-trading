import { StatusCodes } from "http-status-codes";

class AppError extends Error {
  constructor(
    name = "AppError",
    message = "Something went wrong",
    explanation = "An unexpected error occurred",
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = name;
    this.explanation = explanation;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
