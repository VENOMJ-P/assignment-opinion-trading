import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";
import ClientError from "../utils/errors/client.error.js";
import handleError from "../utils/handleError.js";
import { CrudRepository } from "./index.repository.js";

class AuthRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  async login(data) {
    try {
      const { email, password } = data;
      const user = await User.findOne({ email });
      if (!user) {
        throw new ClientError(
          "InvalidCredential",
          "User not found",
          [`No user found with email: ${email}`],
          StatusCodes.NOT_FOUND
        );
      }

      const isPasswordCorrect = user.comparePassword(password);
      if (!isPasswordCorrect) {
        throw new ClientError(
          "InvalidCredential",
          "Incorrect password",
          ["The provided password is incorrect"],
          StatusCodes.UNAUTHORIZED
        );
      }
      return user;
    } catch (error) {
      handleError(error, "Login Failed");
    }
  }
}

export default AuthRepository;
