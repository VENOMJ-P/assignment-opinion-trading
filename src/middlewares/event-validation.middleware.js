import Event from "../models/event.model.js";
import Option from "../models/option.model.js";
import ClientError from "../utils/errors/client.error.js";

const VALID_STATUSES = ["upcoming", "live", "completed", "cancelled"];

const validateCreateEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      startTime,
      endTime,
      status,
      options,
    } = req.body;

    if (!title || !category || !startTime || !endTime) {
      throw new ClientError(
        "MissingRequiredFields",
        "Required fields are missing",
        [
          "Title, category, startTime, and endTime are mandatory.",
          "Please provide all required details to proceed.",
        ]
      );
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ClientError("InvalidDateFormat", "Invalid date format", [
        "Please provide valid date formats for startTime and endTime.",
      ]);
    }

    if (start >= end) {
      throw new ClientError("InvalidTimeRange", "Invalid time range", [
        "The startTime must be before the endTime.",
      ]);
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      throw new ClientError("InvalidStatus", "Invalid status specified", [
        `Allowed statuses: ${VALID_STATUSES.join(", ")}.`,
      ]);
    }

    // Validate options if provided
    if (options && Array.isArray(options)) {
      for (const option of options) {
        if (!option.title || option.odds === undefined) {
          throw new ClientError("InvalidOption", "Invalid option data", [
            "Each option must have a title and odds.",
          ]);
        }

        if (isNaN(option.odds) || option.odds <= 0) {
          throw new ClientError("InvalidOdds", "Invalid odds value", [
            "Odds must be a positive number.",
          ]);
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateUpdateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, status, options } = req.body;

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new ClientError("ResourceNotFound", "Event not found", [
        `No event found with ID: ${id}`,
      ]);
    }

    // Validate dates if provided
    if (startTime || endTime) {
      const start = new Date(startTime || event.startTime);
      const end = new Date(endTime || event.endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ClientError("InvalidDateFormat", "Invalid date format", [
          "Please provide valid date formats for startTime and endTime.",
        ]);
      }

      if (start >= end) {
        throw new ClientError("InvalidTimeRange", "Invalid time range", [
          "The startTime must be before the endTime.",
        ]);
      }
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      throw new ClientError("InvalidStatus", "Invalid status specified", [
        `Allowed statuses: ${VALID_STATUSES.join(", ")}.`,
      ]);
    }

    // Validate options if provided
    if (options && Array.isArray(options)) {
      for (const option of options) {
        if (!option.title || option.odds === undefined) {
          throw new ClientError("InvalidOption", "Invalid option data", [
            "Each option must have a title and odds.",
          ]);
        }

        if (isNaN(option.odds) || option.odds <= 0) {
          throw new ClientError("InvalidOdds", "Invalid odds value", [
            "Odds must be a positive number.",
          ]);
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateOptionResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    if (result === undefined || typeof result !== "boolean") {
      throw new ClientError("InvalidResultValue", "Invalid result value", [
        "Result must be a boolean value (true or false).",
      ]);
    }

    // Check if option exists
    const option = await Option.findById(id);
    if (!option) {
      throw new ClientError("ResourceNotFound", "Option not found", [
        `No option found with ID: ${id}`,
      ]);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { validateCreateEvent, validateUpdateEvent, validateOptionResult };
