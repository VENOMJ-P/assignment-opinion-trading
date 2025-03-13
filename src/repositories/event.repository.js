import { StatusCodes } from "http-status-codes";
import Event from "../models/event.model.js";
import Option from "../models/option.model.js";
import ClientError from "../utils/errors/client.error.js";
import handleError from "../utils/handleError.js";
import { CrudRepository } from "./index.repository.js";

class EventRepository extends CrudRepository {
  constructor() {
    super(Event);
  }

  async create(data) {
    try {
      const { options, ...eventData } = data;

      // Create the event
      const event = await Event.create(eventData);

      // Create options if provided
      if (options && Array.isArray(options) && options.length > 0) {
        const optionDocs = await Option.insertMany(
          options.map((option) => ({
            ...option,
            eventId: event._id,
          }))
        );

        // Add option IDs to the event
        event.options = optionDocs.map((doc) => doc._id);
        await event.save();
      }

      return event;
    } catch (error) {
      throw handleError(error, "Create event operation failed");
    }
  }

  async get(id) {
    try {
      const event = await Event.findById(id).populate("options");
      if (!event) {
        throw new ClientError(
          "ResourceNotFound",
          "Event not found",
          [`No event found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }
      return event;
    } catch (error) {
      throw handleError(error, "Get event operation failed");
    }
  }

  async getAll(filters = {}, paginationOptions = {}) {
    try {
      const { page = 1, limit = 10 } = paginationOptions;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { startTime: 1 },
        populate: "options",
      };

      console.log(filters);

      const events = await Event.find(filters)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .sort(options.sort)
        .populate("options");

      const total = await Event.countDocuments(filters);

      return {
        events,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil(total / options.limit),
          hasNext: options.page < Math.ceil(total / options.limit),
          hasPrev: options.page > 1,
        },
      };
    } catch (error) {
      throw handleError(error, "Get all events operation failed");
    }
  }

  async update(id, data) {
    try {
      const { options, ...eventData } = data;

      // Update the event itself
      const event = await Event.findByIdAndUpdate(
        id,
        { ...eventData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!event) {
        throw new ClientError(
          "ResourceNotFound",
          "Event not found",
          [`No event found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }

      // Update options if provided
      if (options && Array.isArray(options)) {
        // Remove existing options
        await Option.deleteMany({ eventId: id });

        // Create new options
        const optionDocs = await Option.insertMany(
          options.map((option) => ({
            ...option,
            eventId: event._id,
          }))
        );

        // Update event with new option IDs
        event.options = optionDocs.map((doc) => doc._id);
        await event.save();
      }

      return event.populate("options");
    } catch (error) {
      throw handleError(error, "Update event operation failed");
    }
  }

  async destroy(id) {
    try {
      const event = await Event.findById(id);
      if (!event) {
        throw new ClientError(
          "ResourceNotFound",
          "Event not found",
          [`No event found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }

      // Delete all associated options
      await Option.deleteMany({ eventId: id });

      // Delete the event
      await Event.findByIdAndDelete(id);

      return { message: "Event and associated options successfully deleted" };
    } catch (error) {
      throw handleError(error, "Delete event operation failed");
    }
  }

  async updateEventStatus(id, status) {
    try {
      const event = await Event.findByIdAndUpdate(
        id,
        { status, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!event) {
        throw new ClientError(
          "ResourceNotFound",
          "Event not found",
          [`No event found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }

      return event;
    } catch (error) {
      throw handleError(error, "Update event status operation failed");
    }
  }
}

export default EventRepository;
