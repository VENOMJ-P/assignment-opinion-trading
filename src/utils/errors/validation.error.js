import { StatusCodes } from "http-status-codes";
import AppError from "./app.error.js";

class ValidationError extends AppError {
  constructor(error) {
    const errorName = error.name || "ValidationError";
    const explanation = Array.isArray(error.errors)
      ? error.errors.map((err) => err.message)
      : [error.message || "Validation failed."];

    super(
      errorName,
      "Validation failed for the provided data",
      explanation,
      StatusCodes.BAD_REQUEST
    );
  }
}

export default ValidationError;
