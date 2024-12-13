const express = require("express");
const router = express.Router();
const userRoute = require("../models/user");
const postRoute = require("../models/post");
const { ensureAuthenticated } = require("../middleware/protect");

//search route
router.get("/search", ensureAuthenticated, async (req, res) => {
  const { query } = req.query; // Get search query from request req.query me hum jo bhi naam likanga tho iski help se vho ushe hold karke rakegha

  try {
    const user = await userRoute.find({
      username: { $regex: query, $options: "i" },
    });

    const post = await postRoute.find({
      tags: { $regex: query, $options: "i" },
    });

    res.render("searchResults", { user, post, query });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const user = await userRoute.findById(req.params.userId).populate("posts");
    const posts = user.posts;
    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log(user.posts);
    // const posts = await postRoute.find({ userId: user._id });
    if (currentUserId && currentUserId.toString() === user._id.toString()) {
      res.render("profile", { user, posts, currentUserId });
    } else {
      res.render("profilesearch", { user, posts, currentUserId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
