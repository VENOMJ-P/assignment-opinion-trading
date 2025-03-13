import TradeService from "../services/trade.service.js";
import { StatusCodes } from "http-status-codes";

const tradeServices = new TradeService();

export const createTrade = async (req, res, next) => {
  try {
    const trade = await tradeServices.createTrade(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, trade });
  } catch (error) {
    next(error);
  }
};

export const getTrade = async (req, res, next) => {
  try {
    const trade = await tradeServices.getTrade(req.params.id);
    res.status(StatusCodes.OK).json({ success: true, trade });
  } catch (error) {
    next(error);
  }
};

export const getAllTrades = async (req, res, next) => {
  try {
    const filters = req.query;
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await tradeServices.getAllTrades(filters, pagination);
    res.status(StatusCodes.OK).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getUserTrades = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const filters = req.query;
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await tradeServices.getUserTrades(
      userId,
      filters,
      pagination
    );
    res.status(StatusCodes.OK).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getEventTrades = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const filters = req.query;
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await tradeServices.getEventTrades(
      eventId,
      filters,
      pagination
    );
    res.status(StatusCodes.OK).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateTradeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const trade = await tradeServices.updateTradeStatus(id, status);
    res.status(StatusCodes.OK).json({ success: true, trade });
  } catch (error) {
    next(error);
  }
};

export const settleTrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    const trade = await tradeServices.settleTrade(id, result);
    res.status(StatusCodes.OK).json({ success: true, trade });
  } catch (error) {
    next(error);
  }
};
