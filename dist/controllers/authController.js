import { AadhaarValidationError } from '../utlis/errors.js';
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new AadhaarValidationError('Email and password are required');
            }
            if (!/\S+@\S+\.\S+/.test(email)) {
                throw new AadhaarValidationError('Invalid email format');
            }
            if (password.length < 6) {
                throw new AadhaarValidationError('Password must be at least 6 characters');
            }
            await this.authService.register(email, password);
            res.status(201).json({ message: 'User registered successfully' });
        }
        catch (error) {
            res.status(400).json({ message: error.message || 'Server error' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const token = await this.authService.login(email, password);
            res.json({ token });
        }
        catch (error) {
            res.status(400).json({ message: error.message || 'Server error' });
        }
    }
}
export default AuthController;
