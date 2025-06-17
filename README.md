### Backend README (`server/README.md`)

```markdown
# Aadhaar OCR System - Backend

This is the backend of the Aadhaar OCR System, built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB**. It provides APIs for user authentication, Aadhaar card image uploads, OCR processing, and scan history retrieval. The backend follows the repository pattern and SOLID principles for modularity and maintainability.

## Features
- **User Authentication**: Register and login users with JWT-based authentication.
- **Aadhaar OCR Processing**: Upload Aadhaar card images (front and back), process them using Tesseract.js, and parse data (e.g., name, Aadhaar number, DOB, gender, address, pin code).
- **Scan History**: Store and retrieve Aadhaar scan data for authenticated users.
- **Secure File Uploads**: Validates image types and sizes using Multer.
- **Error Handling**: Robust error handling with custom error messages.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose)
- **OCR**: Tesseract.js
- **Other Libraries**:
  - `jsonwebtoken` for authentication
  - `multer` for file uploads
  - `helmet` for security headers
  - `cors` for cross-origin requests
  - `morgan` for request logging
  - `sharp` for image preprocessing (optional)

## Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher) or **yarn**
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Git** (to clone the repository)
- Tesseract.js language data (`eng.traineddata`) in the `server/` directory

## Project Structure
```
server/
├── src/
│   ├── config/                # Configuration (e.g., env, db, cors)
│   ├── controllers/           # Request handlers (e.g., AadhaarUploadController)
│   ├── interfaces/            # TypeScript interfaces (e.g., AadhaarParserInterface)
│   ├── middleware/            # Middleware (e.g., authMiddleware, fileUpload)
│   ├── models/                # Mongoose models (e.g., AadhaarScan, User)
│   ├── parsers/               # OCR parsing logic (e.g., AadhaarParser)
│   ├── repositories/          # Database access layer (e.g., AadhaarScanRepository)
│   ├── routes/                # Express routes (e.g., authRoutes, aadhaarUploadRoutes)
│   ├── services/              # Business logic (e.g., AadhaarParseService, OCRService)
│   ├── types/                 # Shared TypeScript types (e.g., AadhaarDetails)
│   ├── utils/                 # Utility functions (e.g., logger, errors)
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── uploads/                   # Temporary storage for uploaded images (optional)
├── eng.traineddata            # Tesseract OCR language model
├── .env                       # Environment variables
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/JoyelV/aadhaar-ocr-system-frontend.git
cd aadhaar-ocr-system/server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aadhaar-ocr-system
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
```
> Replace `MONGODB_URI` with your MongoDB connection string and `JWT_SECRET` with a secure key.

### 4. Download Tesseract Language Data
Place `eng.traineddata` in the `server/` directory or configure Tesseract to use a custom path.

### 5. Run the Backend
```bash
npm run dev
```
The backend will run at [http://localhost:5000](http://localhost:5000).

## API Endpoints
- **POST /api/auth/register**: Register a new user.
  - Expects: `{ email: string, password: string }`
  - Response: `{ token: string }`
- **POST /api/auth/login**: Authenticate a user.
  - Expects: `{ email: string, password: string }`
  - Response: `{ token: string }`
- **POST /api/aadhaar/upload**: Upload and process Aadhaar images (requires authentication).
  - Expects: `multipart/form-data` with `front` and `back` fields (JPEG/PNG images)
  - Response: `{ name: string, aadhaarNumber: string, dob: string, gender: string, address: string, pinCode: string }`
- **GET /api/history/scans**: Retrieve scan history (requires authentication).
  - Response: Array of scan objects
- **POST /api/aadhaar/parse**: Parse text from Aadhaar images (requires authentication).
  - Expects: `{ frontText: string, backText: string }`
  - Response: Parsed Aadhaar data

**Example `curl` for Upload**:
```bash
curl -X POST http://localhost:5000/api/aadhaar/upload \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "front=@/path/to/front.jpg" \
  -F "back=@/path/to/back.jpg"
```

## Deployment
### Render / Railway / Heroku
1. Push the `server/` directory to a GitHub repository.
2. Import the repository in your deployment platform.
3. Set environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS`).
4. Deploy the API.
5. Update the frontend’s `REACT_APP_API_URL` to point to the deployed API.

## Development Notes
- **Architecture**: Follows the repository pattern with controllers, services, and repositories for modularity.
- **SOLID Principles**: Dependency injection and interfaces ensure maintainability and extensibility.
- **Error Handling**: Custom error classes (e.g., `AadhaarValidationError`) and global error middleware.
- **Security**: JWT authentication, file type/size validation, and Helmet for HTTP headers.
- **Logging**: Uses `morgan` for request logging; consider Winston for advanced logging.

## Future Improvements
- Store images in cloud storage (e.g., AWS S3) instead of MongoDB.
- Enhance OCR accuracy with image preprocessing (using `sharp`).
- Add rate limiting for API endpoints.
- Implement pagination for scan history.
- Support additional Aadhaar data fields or ID types.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/feature-name`).
3. Commit changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feat/feature-name`).
5. Create a Pull Request.

## License
Licensed under the [MIT License](LICENSE).
```

---