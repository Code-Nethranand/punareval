  const mongoose = require("mongoose");

  const userSchema = new mongoose.Schema({
    usn: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: false },
    name: { type: String, required: false },
    semester: { type: Number, required: false },
    branch: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model("User", userSchema);
