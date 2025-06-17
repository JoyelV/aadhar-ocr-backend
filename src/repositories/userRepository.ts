import User from '../models/User.js';
import UserRepositoryInterface from '../interfaces/userRepositoryInterface.js';

class UserRepository implements UserRepositoryInterface {
  async findByEmail(email: string): Promise<any | null> {
    return await User.findOne({ email });
  }

  async create(email: string, hashedPassword: string): Promise<any> {
    const user = new User({ email, password: hashedPassword });
    return await user.save();
  }
}

export default UserRepository;