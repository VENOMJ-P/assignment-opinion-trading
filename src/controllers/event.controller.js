import { StatusCodes } from "http-status-codes";
import { EventService } from "../services/index.service.js";

const eventService = new EventService();

export const createEvent = async (req, res, next) => {
  try {
    const eventData = req.body;
    const event = await eventService.createEvent(eventData);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Successfully created event",
      data: event,
      error: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEvent(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully retrieved event",
      data: event,
      error: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      startAfter,
      endBefore,
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (startAfter) filters.startTime = { $gte: new Date(startAfter) };
    if (endBefore) filters.endTime = { $lte: new Date(endBefore) };

    const paginationOptions = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const result = await eventService.getAllEvents(filters, paginationOptions);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully retrieved events",
      data: result.events,
      pagination: result.pagination,
      error: {},
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = Date.now();

    const event = await eventService.updateEvent(id, updateData);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully updated event",
      data: event,
      error: {},
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully deleted event",
      data: {},
      error: {},
    });
  } catch (error) {
    next(error);
  }
};

export const createOption = async (req, res, next) => {
  try {
    const option = await eventService.createOption(req.body);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Option created successfully",
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

export const setOptionResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    const option = await eventService.setOptionResult(id, result);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Option result set successfully",
      data: option,
    });
  } catch (error) {
    next(error);
  }
};
