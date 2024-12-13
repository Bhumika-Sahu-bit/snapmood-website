const express = require("express");
const { ensureAuthenticated } = require("../middleware/protect");
const userRoute = require("../models/user");
const postRoute = require("../models/post");
const router = express.Router();

router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch the user
    const user = await userRoute.findById(req.user.id);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Fetch posts and populate the author field
    const posts = await postRoute.find().populate("author");

    // Render the feed page with user and posts data
    res.render("feed", { user, posts });
  } catch (error) {
    console.error("Error fetching feed:", error);
    next(error); // Pass the error to the error handler
  }
});

module.exports = router;
