import { Request, Response } from 'express';
import AuthService from '../services/authService.js';

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
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