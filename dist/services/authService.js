import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AadhaarValidationError } from '../utlis/errors.js';
class AuthService {
    constructor(userRepository, jwtSecret) {
        this.userRepository = userRepository;
        this.jwtSecret = jwtSecret;
    }
    async register(email, password) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new AadhaarValidationError('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userRepository.create(email, hashedPassword);
    }
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AadhaarValidationError('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AadhaarValidationError('Invalid credentials');
        }
        return jwt.sign({ userId: user._id }, this.jwtSecret, { expiresIn: '1h' });
    }
}
export default AuthService;
