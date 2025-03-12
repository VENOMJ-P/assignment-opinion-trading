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

  async login(data) {
    try {
      const user = this.authRepository.login(data);
      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;
