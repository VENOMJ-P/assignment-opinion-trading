import express from "express";

import { signup, login, logout } from "../../controllers/auth.controller.js";
import {
  validateLoginUser,
  validateSignUpUser,
} from "../../middlewares/auth.middleware.js";
import { protectRoute } from "../../middlewares/authenticate.middleware.js";

const router = express.Router();

router.post("/signup", validateSignUpUser, signup);
router.post("/login", validateLoginUser, login);
router.post("/logout", protectRoute, logout);

export default router;
