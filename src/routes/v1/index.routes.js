import express from "express";

import user from "./auth.routes.js";
import event from "./event.routes.js";
import trade from "./trade.routes.js";


const router = express.Router();

router.use("/auth", user);
router.use("/event", event);
router.use("/trades",trade)

export default router;
