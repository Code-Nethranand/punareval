const mongoose = require("mongoose");
require("dotenv").config();
module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
  }
};
