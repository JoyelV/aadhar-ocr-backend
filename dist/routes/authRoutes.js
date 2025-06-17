import express from 'express';
import AuthController from '../controllers/authController.js';
import AuthService from '../services/authService.js';
import UserRepository from '../repositories/userRepository.js';
import { JWT_SECRET } from '../config/env.js';
import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utlis/errors.js';
const router = express.Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    handler: (req, res, next) => {
        next(new RateLimitError('Too many authentication attempts, please try again later.'));
    },
});
// Dependency Injection
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, JWT_SECRET);
const authController = new AuthController(authService);
router.post('/register', authLimiter, (req, res) => authController.register(req, res));
router.post('/login', authLimiter, (req, res) => authController.login(req, res));
export default router;
