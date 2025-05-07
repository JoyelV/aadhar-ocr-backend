import express from "express";
import cors from "cors";
import ocrRoutes from "./routes/orcRoutes.js";
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use("/api", ocrRoutes);
export default app;
