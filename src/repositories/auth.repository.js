import User from "../models/user.model.js";
import { CrudRepository } from "./index.repository.js";

class AuthRepository extends CrudRepository {
  constructor() {
    super(User);
  }
}

export default AuthRepository;
