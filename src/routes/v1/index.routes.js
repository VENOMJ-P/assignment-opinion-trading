import express from "express";

import user from "./auth.routes.js";
import event from "./event.routes.js";

const router = express.Router();

router.use("/auth", user);
router.use("/event", event);

export default router;
