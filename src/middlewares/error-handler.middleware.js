import { StatusCodes } from "http-status-codes";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const errorResponse = {
    success: false,
    error: {
      name: err.name || "InternalServerError",
      message: err.message || "Something went wrong",
      details: err.details || err.explanation || [],
    },
  };

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
