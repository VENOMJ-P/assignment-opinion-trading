import express from "express";

import {
  protectRoute,
  validateIsAdminRequest,
} from "../../middlewares/authenticate.middleware.js";

import {
  createTrade,
  getTrade,
  getAllTrades,
  updateTradeStatus,
  settleTrade,
  getUserTrades,
  getEventTrades,
} from "../../controllers/trade.controller.js";

import {
  validateCreateTrade,
  validateUpdateTradeStatus,
  validateSettleTrade,
} from "../../middlewares/trade-validation.middleware.js";

const router = express.Router();

router.post(
  "/create",
  protectRoute,

  validateCreateTrade,
  createTrade
);
router.get("/:id", protectRoute, getTrade);
router.get("/", protectRoute, getAllTrades);
router.get(
  "/user/:userId",
  protectRoute,
  validateIsAdminRequest,
  getUserTrades
);
router.get(
  "/event/:eventId",
  protectRoute,
  validateIsAdminRequest,
  getEventTrades
);
router.patch(
  "/:id/status",
  protectRoute,
  validateIsAdminRequest,
  validateUpdateTradeStatus,
  updateTradeStatus
);
router.patch(
  "/:id/settle",
  protectRoute,
  validateIsAdminRequest,
  validateSettleTrade,
  settleTrade
);

export default router;
