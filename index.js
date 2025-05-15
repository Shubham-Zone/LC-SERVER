const express = require('express');
const mongoose = require('mongoose');
const uploadRoute = require('./routes/upload');
const collectionRoute = require("./routes/collection");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./utils/authMiddleware");
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api", collectionRoute);
app.use("/api/auth", authRoutes);

app.use(authMiddleware);
app.use('/api/upload', uploadRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
