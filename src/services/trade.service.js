import TradeRepository from "../repositories/trade.repository.js";
import AuthRepository from "../repositories/auth.repository.js";
import EventRepository from "../repositories/event.repository.js";
import OptionRepository from "../repositories/option.repository.js";
import ClientError from "../utils/errors/client.error.js";
import { StatusCodes } from "http-status-codes";

class TradeService {
  constructor() {
    this.tradeRepository = new TradeRepository();
    this.userRepository = new AuthRepository();
    this.eventRepository = new EventRepository();
    this.optionRepository = new OptionRepository();
  }

  async createTrade(data) {
    const { userId, eventId, optionId, amount } = data;

    // Validate user
    const user = await this.userRepository.get(userId);
    if (!user) {
      throw new ClientError(
        "ResourceNotFound",
        "User not found",
        [`User ID: ${userId}`],
        StatusCodes.NOT_FOUND
      );
    }

    if (user.balance < amount) {
      throw new ClientError(
        "InsufficientBalance",
        "Not enough balance",
        [`Balance: ${user.balance}, Required: ${amount}`],
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate event
    const event = await this.eventRepository.get(eventId);
    if (!event || (event.status !== "upcoming" && event.status !== "live")) {
      throw new ClientError(
        "InvalidEvent",
        "Event not available for trading",
        [`Event status: ${event?.status}`],
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate option
    const option = await this.optionRepository.get(optionId);
    if (!option || !option.eventId.equals(eventId)) {
      throw new ClientError(
        "InvalidOption",
        "Option not valid",
        ["Option must belong to the specified event"],
        StatusCodes.BAD_REQUEST
      );
    }

    // Calculate potential return
    const potentialReturn = amount * option.odds;
    data.potentialReturn = potentialReturn;

    // Create trade
    return await this.tradeRepository.create(data);
  }

  async getTrade(id) {
    return await this.tradeRepository.get(id);
  }

  async getAllTrades(filters, pagination) {
    return await this.tradeRepository.getAll(filters, pagination);
  }

  async getUserTrades(userId, filters, pagination) {
    return await this.tradeRepository.getUserTrades(
      userId,
      filters,
      pagination
    );
  }

  async getEventTrades(eventId, filters, pagination) {
    return await this.tradeRepository.getEventTrades(
      eventId,
      filters,
      pagination
    );
  }

  async updateTradeStatus(id, status) {
    return await this.tradeRepository.updateStatus(id, status);
  }

  async settleTrade(id, result) {
    return await this.tradeRepository.settleTrade(id, result);
  }
}

export default TradeService;
