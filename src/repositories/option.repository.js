import { StatusCodes } from "http-status-codes";
import Option from "../models/option.model.js";
import Event from "../models/event.model.js";
import ClientError from "../utils/errors/client.error.js";
import handleError from "../utils/handleError.js";
import { CrudRepository } from "./index.repository.js";

class OptionRepository extends CrudRepository {
  constructor() {
    super(Option);
  }

  async create(data) {
    try {
      const { eventId } = data;

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        throw new ClientError(
          "ResourceNotFound",
          "Event not found",
          [`No event found with ID: ${eventId}`],
          StatusCodes.NOT_FOUND
        );
      }

      // Create the option
      const option = await Option.create(data);

      // Add option to the event
      event.options.push(option._id);
      await event.save();

      return option;
    } catch (error) {
      throw handleError(error, "Create option operation failed");
    }
  }

  async setOptionResult(id, result) {
    try {
      const option = await Option.findByIdAndUpdate(
        id,
        { result },
        { new: true, runValidators: true }
      );

      if (!option) {
        throw new ClientError(
          "ResourceNotFound",
          "Option not found",
          [`No option found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }

      // Get the event to check if we should update its status
      const event = await Event.findById(option.eventId).populate("options");

      // Check if all options have results
      const allOptionsHaveResults = event.options.every(
        (opt) => opt.result !== null
      );

      // If all options have results, update the event status to completed
      if (allOptionsHaveResults && event.status !== "completed") {
        event.status = "completed";
        event.updatedAt = Date.now();
        await event.save();
      }

      return option;
    } catch (error) {
      throw handleError(error, "Set option result operation failed");
    }
  }
}

export default OptionRepository;
