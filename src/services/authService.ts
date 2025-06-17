import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepositoryInterface from '../interfaces/userRepositoryInterface.js';

class AuthService {
  private userRepository: UserRepositoryInterface;
  private jwtSecret: string;

  constructor(userRepository: UserRepositoryInterface, jwtSecret: string) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
  }

  async register(email: string, password: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.create(email, hashedPassword);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return jwt.sign({ userId: user._id }, this.jwtSecret, { expiresIn: '1h' });
  }
}

export default AuthService;