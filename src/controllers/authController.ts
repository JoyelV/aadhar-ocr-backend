import { Request, Response } from 'express';
import AuthService from '../services/authService.js';
import { AadhaarValidationError } from '../utlis/errors.js';

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(req: Request, res: Response): Promise<void> {
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
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const token = await this.authService.login(email, password);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Server error' });
    }
  }
}

export default AuthController;