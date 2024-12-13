const express = require("express");
const router = express.Router();
const userRoute = require("../models/user");
const passport = require("passport");
const { hashSync } = require("bcrypt");

router.get("/register", (req, res) => {
  res.render("register.ejs");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await userRoute.create({
      username,
      email,
      password: hashSync(password, 10),
    });
    user.save().then((user) => console.log(user));
    return res.redirect("/login");
  } catch (error) {
    console.log("registration error", error);
    req.flash("error_msg", "Registration failed. Please try again.");
    res.redirect("/register");
  }
});

// Login route (GET)
router.get("/login", (req, res, next) => {
  res.render("login", { error: req.flash("error") });
});

// Login route (POST)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/", // Redirect upon successful login
    failureRedirect: "/login", // Redirect upon failed login
    failureFlash: "Incorrect username or password", // Custom flash message
  }),
  (req, res) => {
    console.log(req.session); // Log the session object to check if user data is being stored
  }
);

module.exports = router;
