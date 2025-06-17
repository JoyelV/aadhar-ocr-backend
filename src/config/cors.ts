export function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV || 'development';
  const origins: { [key: string]: string[] } = {
    development: ['http://localhost:3000', 'http://localhost:5173'],
    production: ['https://aadhaar-ocr-system-frontend-sand.vercel.app'],
  };
  return origins[env] || origins.development;
}