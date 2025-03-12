import User from "../models/user.model.js";
import ClientError from "../utils/errors/client.error.js";

const VALID_ROLES = ["user", "admin"];

const validateUser = async (req, res, next) => {
  try {
    const { username, fullName, email, password, role } = req.body;

    if (!username || !email || !password || !fullName) {
      throw new ClientError(
        "MissingRequiredFields",
        "Required fields are missing",
        [
          "Username, email, fullName and password are mandatory.",
          "Please provide all required details to proceed.",
        ]
      );
    }

    if (password.length < 6) {
      throw new ClientError("WeakPassword", "Your password is too short", [
        "Passwords must be at least 6 characters long.",
        "Try using a mix of letters, numbers, and symbols for better security.",
      ]);
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      throw new ClientError("InvalidEmailFormat", "Invalid email format", [
        "Please provide a valid email address (e.g., user@example.com).",
        "A valid email must contain '@' and a proper domain name.",
      ]);
    }

    if (role && !VALID_ROLES.includes(role)) {
      throw new ClientError("InvalidRole", "Invalid role specified", [
        `Allowed roles: ${VALID_ROLES.join(", ")}.`,
        "Please choose a valid role to continue.",
      ]);
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      throw new ClientError(
        "AlreadyExist",
        "Username or email already exists",
        ["Please provide a unique username or email to proceed."]
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { validateUser };
