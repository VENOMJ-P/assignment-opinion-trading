import { StatusCodes } from "http-status-codes";
import AppError from "./app.error.js";

class ClientError extends AppError {
  constructor(
    name,
    message,
    explanation,
    statusCode = StatusCodes.BAD_REQUEST
  ) {
    super(name, message, explanation, statusCode);
  }
}

export default ClientError;
