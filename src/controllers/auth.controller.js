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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login({ email, password });
    user.genJwt(res);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully login user",
      data: user,
      error: {},
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully logout user",
      data: {},
      error: {},
    });
  } catch (error) {
    next(error);
  }
};
