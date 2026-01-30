const mongoose = require("mongoose");
const { mongodbUri } = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
