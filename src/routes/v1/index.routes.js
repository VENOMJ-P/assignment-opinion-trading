import express from "express";

import user from "./auth.routes.js";

const router = express.Router();

router.use("/auth", user);

export default router;
