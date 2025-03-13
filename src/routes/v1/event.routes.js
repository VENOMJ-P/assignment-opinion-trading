import express from "express";

import {
  protectRoute,
  validateIsAdminRequest,
} from "../../middlewares/authenticate.middleware.js";
import {
  createEvent,
  createOption,
  deleteEvent,
  getAllEvents,
  getEvent,
  setOptionResult,
  updateEvent,
} from "../../controllers/event.controller.js";
import {
  validateCreateEvent,
  validateUpdateEvent,
} from "../../middlewares/event-validation.middleware.js";

const router = express.Router();

router.post(
  "/create",
  protectRoute,
  validateIsAdminRequest,
  validateCreateEvent,
  createEvent
);
router.get("/:id", protectRoute, validateIsAdminRequest, getEvent);
router.get("/", protectRoute, validateIsAdminRequest, getAllEvents);
router.patch(
  "/:id",
  protectRoute,
  validateIsAdminRequest,
  validateUpdateEvent,
  updateEvent
);
router.delete("/:id", protectRoute, validateIsAdminRequest, deleteEvent);
router.post("/options", protectRoute, validateIsAdminRequest, createOption);
router.patch(
  "/options/:id/result",
  protectRoute,
  validateIsAdminRequest,
  setOptionResult
);

export default router;
