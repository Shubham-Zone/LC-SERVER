const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Step 1: Request OTP
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  console.log("New req", req.body);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const user = await User.findOneAndUpdate(
    { email },
    { otp, otpExpiresAt },
    { upsert: true, new: true }
  );

  await sendEmail(email, "Your OTP", `Your OTP is: ${otp}`);
  res.json({ message: "OTP sent to email" });
});

// Step 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || Date.now() > user.otpExpiresAt) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }

  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

module.exports = router;
