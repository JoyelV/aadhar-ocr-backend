import express from 'express';
import AuthController from '../controllers/authController.js';
import AuthService from '../services/authService.js';
import UserRepository from '../repositories/userRepository.js';
import { JWT_SECRET } from '../config/env.js';
const router = express.Router();
// Dependency Injection
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, JWT_SECRET);
const authController = new AuthController(authService);
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
export default router;
