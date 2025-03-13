import Trade from "../models/trade.model.js";
import User from "../models/user.model.js";
import ClientError from "../utils/errors/client.error.js";
import { StatusCodes } from "http-status-codes";
import handleError from "../utils/handleError.js";
import { CrudRepository } from "./index.repository.js";

class TradeRepository extends CrudRepository {
  constructor() {
    super(Trade);
  }

  async create(data) {
    try {
      const { userId, amount } = data;

      // Find user before creating trade
      const user = await User.findById(userId);
      if (!user) {
        throw new ClientError(
          "ResourceNotFound",
          "User not found",
          [`No user found with ID: ${userId}`],
          StatusCodes.NOT_FOUND
        );
      }

      // Deduct balance before trade creation
      if (user.balance < amount) {
        throw new ClientError(
          "InsufficientFunds",
          "User does not have enough balance",
          [`User balance: ${user.balance}, required: ${amount}`],
          StatusCodes.BAD_REQUEST
        );
      }
      user.balance -= amount;
      await user.save();

      // Create trade
      const trade = await Trade.create(data);
      return trade;
    } catch (error) {
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
        .populate("optionId", "title odds result")
        .lean();

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

      const query = { ...filters };

      const trades = await Trade.find(query)
        .populate("userId", "username email")
        .populate("eventId", "title startTime endTime status")
        .populate("optionId", "title odds result")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Trade.countDocuments(query);

      return { trades, total };
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

      const query = { userId, ...filters };

      const trades = await Trade.find(query)
        .populate("eventId", "title startTime endTime status")
        .populate("optionId", "title odds result")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Trade.countDocuments(query);

      return { trades, total };
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

      const query = { eventId, ...filters };

      const trades = await Trade.find(query)
        .populate("userId", "username email")
        .populate("optionId", "title odds result")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Trade.countDocuments(query);

      return { trades, total };
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

      const originalStatus = trade.status; // Store original status before updating
      trade.status = status;
      await trade.save();

      // If cancelled and was originally pending, refund user
      if (status === "cancelled" && originalStatus === "pending") {
        const user = await User.findById(trade.userId);
        if (user) {
          user.balance += trade.amount;
          await user.save();
        }
      }

      return trade;
    } catch (error) {
      throw handleError(error, "Update trade status failed");
    }
  }

  async settleTrade(id, result) {
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

      // Set trade result and status
      trade.result = result;
      trade.status = "settled";
      trade.settledAt = new Date();

      // Handle payout
      trade.payout = result ? trade.potentialReturn : 0;

      // Update user balance if trade is won
      if (result) {
        const user = await User.findById(trade.userId);
        if (user) {
          user.balance += trade.potentialReturn;
          await user.save();
        }
      }

      await trade.save();
      return trade;
    } catch (error) {
      throw handleError(error, "Settle trade failed");
    }
  }
}

export default TradeRepository;
