const express = require("express");
const userRoute = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.get("/forgot-password", (req, res) => {
  res.render("forgotPassword.ejs");
});

router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.render("resetPassword.ejs", { token });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userRoute.findOne({ email });
    if (!user) {
      req.flash("error_msg", "No account with the email found");
      return res.redirect("/forgot-password");
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetURL = `https://snapmood.onrender.com/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `You are receiving this email because you (or someone else) requested to reset your password.
Click the link below to reset your password:
${resetURL}
If you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    req.flash("success_msg", "Password reset email sent! Check your inbox.");
    res.redirect("/forgot-password");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/forgot-password");
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await userRoute.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error_msg", "Invalid or expired token.");
      return res.redirect("/forgot-password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    req.flash("success_msg", "Password has been reset successfully");
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "An error occurred. Please try again.");
    res.redirect(`/reset-password/${token}`);
  }
});

module.exports = router;
