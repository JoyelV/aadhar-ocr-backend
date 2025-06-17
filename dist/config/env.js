import dotenv from 'dotenv';
dotenv.config();
export function validateEnv() {
    const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    return {
        MONGODB_URI: process.env.MONGODB_URI,
        PORT: parseInt(process.env.PORT || '5001', 10),
        JWT_SECRET: process.env.JWT_SECRET,
    };
}
// Initialize environment variables once
const env = validateEnv();
export const MONGODB_URI = env.MONGODB_URI;
export const PORT = env.PORT;
export const JWT_SECRET = env.JWT_SECRET;
