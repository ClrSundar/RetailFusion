import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./handlers/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Base route
app.get("/", (req, res) => res.send("Hello from Serverless API!"));

// Auth routes
app.use("/auth", authRouter);

// Export the Lambda handler
export const handler = serverless(app);
