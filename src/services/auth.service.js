import User from "../models/user.model.js";
import { AuthRepository } from "../repositories/index.repository.js";

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  async signup(data) {
    try {
      const user = this.authRepository.create(data);
      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;
