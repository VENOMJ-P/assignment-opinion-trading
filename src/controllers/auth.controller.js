import { StatusCodes } from "http-status-codes";

import { AuthService } from "../services/index.service.js";

const authService = new AuthService();

export const signup = async (req, res, next) => {
  const { username, email, fullName, password, balance, role } = req.body;
  try {
    const user = await authService.signup({
      username,
      email,
      fullName,
      password,
      balance,
      role,
    });

    user.genJwt(res);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Successfully create user",
      data: user,
      error: {},
    });
  } catch (error) {
    next(error);
  }
};
