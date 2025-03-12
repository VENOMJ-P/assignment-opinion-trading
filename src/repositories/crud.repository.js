import ClientError from "../utils/errors/client.error.js";
import { StatusCodes } from "http-status-codes";
import handleError from "../utils/handleError.js";

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      console.log(data);
      return await this.model.create(data);
    } catch (error) {
      throw handleError(error, "Create operation failed");
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
      throw handleError(error, "Get operation failed");
    }
  }

  async getAll() {
    try {
      return await this.model.find({});
    } catch (error) {
      throw handleError(error, "Fetching all records failed");
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
      throw handleError(error, "Update operation failed");
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
      throw handleError(error, "Delete operation failed");
    }
  }
}

export default CrudRepository;
