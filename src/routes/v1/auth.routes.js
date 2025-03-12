import express from "express";

import { signup } from "../../controllers/auth.controller.js";
import { validateUser } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", validateUser, signup);

export default router;
