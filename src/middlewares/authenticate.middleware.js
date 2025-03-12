import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/errors/app.error.js";
import { StatusCodes } from "http-status-codes";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      throw new AppError(
        "UnauthorizedError",
        "Unauthorized - No Token Provided",
        ["You must be logged in to access this resource"],
        StatusCodes.UNAUTHORIZED
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new AppError(
        "UnauthorizedError",
        "Unauthorized - Invalid Token",
        ["Your session has expired or the token is invalid"],
        StatusCodes.NOT_FOUND
      );
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new AppError(
        "NotFoundError",
        "User not found",
        ["The user associated with this token no longer exists"],
        StatusCodes.UNAUTHORIZED
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateIsAdminRequest = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new AppError(
      "UnauthorizedError",
      "Unauthorized - Invalid access",
      ["You do not have permission to perform this action"],
      StatusCodes.FORBIDDEN
    );
  }
  next();
};
