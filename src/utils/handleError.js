import AppError from "./errors/app.error.js";
import ClientError from "./errors/client.error.js";
import ValidationError from "./errors/validation.error.js";
import { StatusCodes } from "http-status-codes";

const handleError = (error, contextMessage) => {
  console.log(error);
  if (error.name === "ValidationError") {
    throw new ValidationError(error);
  } else if (error.name === "CastError") {
    throw new ClientError(
      "InvalidObjectId",
      "Invalid ID format",
      [`The provided ID is not a valid MongoDB ObjectId.`],
      StatusCodes.BAD_REQUEST
    );
  } else {
    throw new AppError(
      "DatabaseError",
      error.message || contextMessage,
      [error.explanation || "Unexpected database error occurred."],
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export default handleError;
