const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  acceptance: String,
  difficulty: String,
  frequency: String,
  url: String,
  done: { type: Boolean, default: false },
  revision: { type: Boolean, default: false },
  note: { type: String, default: "" },
});

const collectionSchema = new mongoose.Schema({
  title: String,
  collectionId: { type: String, unique: true },
  email: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model("Collection", collectionSchema);
