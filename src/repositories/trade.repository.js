import Trade from "../models/trade.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import Option from "../models/option.model.js";
import ClientError from "../utils/errors/client.error.js";
import { StatusCodes } from "http-status-codes";
import handleError from "../utils/handleError.js";
import { CrudRepository } from "./index.repository.js";
import mongoose from "mongoose";

class TradeRepository extends CrudRepository {
  constructor() {
    super(Trade);
  }

  async create(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, amount, potentialReturn } = data;

      // Create trade
      const trade = await Trade.create([data], { session });

      // Update user balance
      const user = await User.findById(userId);
      if (!user) {
        throw new ClientError(
          "ResourceNotFound",
          "User not found",
          [`No user found with ID: ${userId}`],
          StatusCodes.NOT_FOUND
        );
      }

      user.balance -= amount;
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return trade[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw handleError(error, "Trade creation failed");
    }
  }

  async get(id) {
    try {
      const trade = await Trade.findById(id)
        .populate("userId", "username email")
        .populate({
          path: "eventId",
          select: "title startTime endTime status",
          populate: {
            path: "options",
            select: "title odds result",
          },
        })
        .populate("optionId", "title odds result");

      if (!trade) {
        throw new ClientError(
          "ResourceNotFound",
          "Requested trade not found",
          [`No trade found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }
      return trade;
    } catch (error) {
      throw handleError(error, "Get trade operation failed");
    }
  }

  async getAll(filters = {}, pagination = { page: 1, limit: 10 }) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.eventId) query.eventId = filters.eventId;
      if (filters.status) query.status = filters.status;
      if (filters.result !== undefined) query.result = filters.result;

      const trades = await Trade.find(query)
        .populate("userId", "username email")
        .populate("eventId", "title startTime endTime status")
        .populate("optionId", "title odds result")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Trade.countDocuments(query);

      return {
        trades,
        total,
      };
    } catch (error) {
      throw handleError(error, "Fetching trades failed");
    }
  }

  async getUserTrades(
    userId,
    filters = {},
    pagination = { page: 1, limit: 10 }
  ) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const query = { userId };
      if (filters.eventId) query.eventId = filters.eventId;
      if (filters.status) query.status = filters.status;
      if (filters.result !== undefined) query.result = filters.result;

      const trades = await Trade.find(query)
        .populate("eventId", "title startTime endTime status")
        .populate("optionId", "title odds result")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Trade.countDocuments(query);

      return {
        trades,
        total,
      };
    } catch (error) {
      throw handleError(error, "Fetching user trades failed");
    }
  }

  async getEventTrades(
    eventId,
    filters = {},
    pagination = { page: 1, limit: 10 }
  ) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const query = { eventId };
      if (filters.status) query.status = filters.status;
      if (filters.result !== undefined) query.result = filters.result;

      const trades = await Trade.find(query)
        .populate("userId", "username email")
        .populate("optionId", "title odds result")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Trade.countDocuments(query);

      return {
        trades,
        total,
      };
    } catch (error) {
      throw handleError(error, "Fetching event trades failed");
    }
  }

  async updateStatus(id, status) {
    try {
      const trade = await Trade.findById(id);
      if (!trade) {
        throw new ClientError(
          "ResourceNotFound",
          "Trade not found",
          [`No trade found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }

      trade.status = status;
      if (status === "cancelled" && trade.status === "pending") {
        // Refund the user's balance
        const user = await User.findById(trade.userId);
        if (user) {
          user.balance += trade.amount;
          await user.save();
        }
      }

      await trade.save();
      return trade;
    } catch (error) {
      throw handleError(error, "Update trade status failed");
    }
  }

  async settleTrade(id, result) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const trade = await Trade.findById(id).session(session);
      if (!trade) {
        throw new ClientError(
          "ResourceNotFound",
          "Trade not found",
          [`No trade found with ID: ${id}`],
          StatusCodes.NOT_FOUND
        );
      }

      // Set trade result and status
      trade.result = result;
      trade.status = "settled";
      trade.settledAt = new Date();

      // Calculate payout based on result
      if (result === true) {
        trade.payout = trade.potentialReturn;

        // Update user balance with winnings
        const user = await User.findById(trade.userId).session(session);
        if (user) {
          user.balance += trade.potentialReturn;
          await user.save({ session });
        }
      } else {
        trade.payout = 0;
      }

      await trade.save({ session });
      await session.commitTransaction();
      session.endSession();

      return trade;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw handleError(error, "Settle trade failed");
    }
  }
}

export default TradeRepository;
