import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import Option from "../models/option.model.js";
import Trade from "../models/trade.model.js";
import ClientError from "../utils/errors/client.error.js";
import { StatusCodes } from "http-status-codes";

const validateCreateTrade = async (req, res, next) => {
  try {
    const { userId, eventId, optionId, amount } = req.body;

    if (!userId || !eventId || !optionId || amount === undefined) {
      throw new ClientError(
        "MissingRequiredFields",
        "Required fields are missing",
        [
          "UserId, eventId, optionId, and amount are mandatory.",
          "Please provide all required details to proceed.",
        ]
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      throw new ClientError("InvalidAmount", "Invalid amount value", [
        "Amount must be a positive number.",
        "Please provide a valid amount to proceed.",
      ]);
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ClientError(
        "ResourceNotFound",
        "User not found",
        [`No user found with ID: ${userId}`],
        StatusCodes.NOT_FOUND
      );
    }

    // Check if user has enough balance
    if (user.balance < amount) {
      throw new ClientError(
        "InsufficientBalance",
        "Insufficient balance",
        ["You don't have enough balance to place this trade."],
        StatusCodes.BAD_REQUEST
      );
    }

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

    // Check if event is open for trading
    if (event.status !== "upcoming" && event.status !== "live") {
      throw new ClientError(
        "InvalidEventStatus",
        "Event is not open for trading",
        ["Trades can only be placed on upcoming or live events."],
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if option exists and belongs to the event
    const option = await Option.findById(optionId);
    if (!option) {
      throw new ClientError(
        "ResourceNotFound",
        "Option not found",
        [`No option found with ID: ${optionId}`],
        StatusCodes.NOT_FOUND
      );
    }

    if (!option.eventId.equals(event._id)) {
      throw new ClientError(
        "InvalidRelation",
        "Option does not belong to this event",
        ["The specified option is not associated with the given event."],
        StatusCodes.BAD_REQUEST
      );
    }

    // Add calculated potential return to the request
    req.calculatedValues = {
      potentialReturn: amount * option.odds,
      option,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const validateUpdateTradeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ClientError("MissingRequiredFields", "Status is required", [
        "Please provide a status to update.",
      ]);
    }

    const validStatuses = ["pending", "settled", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new ClientError("InvalidStatus", "Invalid status specified", [
        `Allowed statuses: ${validStatuses.join(", ")}.`,
        "Please choose a valid status to continue.",
      ]);
    }

    const trade = await Trade.findById(id);
    if (!trade) {
      throw new ClientError(
        "ResourceNotFound",
        "Trade not found",
        [`No trade found with ID: ${id}`],
        StatusCodes.NOT_FOUND
      );
    }

    // Can't update a settled trade
    if (trade.status === "settled" && status !== "settled") {
      throw new ClientError(
        "InvalidOperation",
        "Cannot update a settled trade",
        ["A trade that has been settled cannot be modified."],
        StatusCodes.BAD_REQUEST
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateSettleTrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    if (result === undefined || typeof result !== "boolean") {
      throw new ClientError("InvalidResult", "Invalid result value", [
        "Result must be a boolean value (true or false).",
        "Please provide a valid result to proceed.",
      ]);
    }

    const trade = await Trade.findById(id).populate("optionId eventId");
    if (!trade) {
      throw new ClientError(
        "ResourceNotFound",
        "Trade not found",
        [`No trade found with ID: ${id}`],
        StatusCodes.NOT_FOUND
      );
    }

    // Check if trade is still pending
    if (trade.status !== "pending") {
      throw new ClientError(
        "InvalidOperation",
        "Cannot settle a non-pending trade",
        ["Only pending trades can be settled."],
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if event is completed
    if (trade.eventId.status !== "completed") {
      throw new ClientError(
        "InvalidOperation",
        "Cannot settle trade for incomplete event",
        ["Event must be completed before settling trades."],
        StatusCodes.BAD_REQUEST
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { validateCreateTrade, validateUpdateTradeStatus, validateSettleTrade };
