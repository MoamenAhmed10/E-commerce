const app = require("./app");
const connectDB = require("./config/db");
const { port, nodeEnv } = require("./config/env");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to MongoDB
connectDB().then(() => {
  // Start server
  const server = app.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     E-Commerce Backend Server Started      ║
╠════════════════════════════════════════════╣
║  Environment: ${nodeEnv.padEnd(27)}║
║  Port: ${port.toString().padEnd(34)}║
║  API: http://localhost:${port}/api/v1       ║
╚════════════════════════════════════════════╝
    `);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("Process terminated.");
    });
  });
});
