// src/app.js
import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import { Server as IOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import methodOverride from "method-override";

// Import your routers
import productsRouter from "./routes/products.js";
import cartsRouter from "./routes/carts.js";
import viewsRouter from "./routes/views.js";

dotenv.config();
const PORT = process.env.PORT || 8081;

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// --- Handlebars setup with helpers ---
let globalVars = {};

app.engine(
  "handlebars",
  engine({
    helpers: {
      // Basic comparison helpers
      eq: (a, b) => a === b,
      ne: (a, b) => a !== b,
      lt: (a, b) => a < b,
      gt: (a, b) => a > b,
      lte: (a, b) => a <= b,
      gte: (a, b) => a >= b,

      // JSON stringify helper (debugging)
      json: (context) => JSON.stringify(context),

      // Math & variable helpers for cart totals
      multiply: (a, b) => a * b,
      setVar: (varName, value) => {
        globalVars[varName] = value;
      },
      addToVar: (varName, value) => {
        globalVars[varName] = (globalVars[varName] || 0) + value;
      },
      getVar: (varName) => globalVars[varName] || 0,
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
// --------------------------------------

// Routers
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const httpServer = app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );

    // Set up Socket.IO (real-time updates)
    const io = new IOServer(httpServer);
    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
