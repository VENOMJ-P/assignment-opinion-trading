import ValidationError from "../utils/errors/validation.error.js";
import ClientError from "../utils/errors/client.error.js";
import AppError from "../utils/errors/app.error.js";
import { StatusCodes } from "http-status-codes";

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      console.log(data);
      return await this.model.create(data);
    } catch (error) {
      throw this.handleError(error, "Create operation failed");
    }
  }

  async get(id) {
    try {
      const response = await this.model.findById(id);
      if (!response) {
        throw new ClientError(
          "ResourceNotFound",
          "Requested resource not found",
          [`No record found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      throw this.handleError(error, "Get operation failed");
    }
  }

  async getAll() {
    try {
      return await this.model.find({});
    } catch (error) {
      throw this.handleError(error, "Fetching all records failed");
    }
  }

  async update(id, data) {
    try {
      const response = await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!response) {
        throw new ClientError(
          "ResourceNotFound",
          "Cannot update non-existing record",
          [`No record found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      throw this.handleError(error, "Update operation failed");
    }
  }

  async destroy(id) {
    try {
      const response = await this.model.findByIdAndDelete(id);
      if (!response) {
        throw new ClientError(
          "ResourceNotFound",
          "Cannot delete non-existing record",
          [`No record found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      throw this.handleError(error, "Delete operation failed");
    }
  }

  handleError(error, contextMessage) {
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
        contextMessage,
        [error.message || "Unexpected database error occurred."],
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default CrudRepository;
