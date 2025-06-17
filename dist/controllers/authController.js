class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(req, res) {
        try {
            const { email, password } = req.body;
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
