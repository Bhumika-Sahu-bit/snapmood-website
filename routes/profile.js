const express = require("express");
const path = require("path");
const userRoute = require("../models/user");
const postRoute = require("../models/post");
const { ensureAuthenticated } = require("../middleware/protect");
const upload = require("./multer");
const user = require("../models/user");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const mongoose = require("mongoose");

router.get("/profile", ensureAuthenticated, async (req, res, next) => {
  try {
    const user = await userRoute.findById(req.user.id).populate("posts");

    if (!user) {
      return res.status(404).send("User not found.");
    }

    console.log("User Object:", user); // Log the user object
    console.log("User's Posts:", user.posts); // This should show an array of posts
    res.render("profile", { user: user, posts: user.posts });
  } catch (error) {
    console.error("Error fetching user:", error);
    next(error);
  }
});

//update profile image
router.post(
  "/fileupload",
  ensureAuthenticated,
  upload.single("profileImage"),
  async (req, res, next) => {
    try {
      if (req.file) {
        // const imageUrl = "/uploads/" + req.file.filename;
        const filePath = req.file.path;

        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: "auto",
        });

        const imageUrl = result.secure_url;
        const user = await userRoute.findByIdAndUpdate(req.user.id, {
          profileImage: imageUrl,
        });

        fs.unlinkSync(filePath);
      }

      res.redirect("/profile"); // Redirect back to the profile page
    } catch (error) {
      console.error("Error updating profile image:", error);
      next(error);
    }
  }
);

//create route
router.get("/create", ensureAuthenticated, async (req, res, next) => {
  try {
    const user = await userRoute.findById(req.user.id).populate("posts");
    console.log(user);
    res.render("create", { user });
  } catch (error) {
    console.error("Error fetching user:", error);
    next(error);
  }
});

router.post(
  "/createpost",
  ensureAuthenticated,
  upload.single("media"),
  async (req, res, next) => {
    try {
      if (!req.body.imageText || !req.body.imageText.trim()) {
        return res.status(400).send("imageText is required.");
      }

      const user = await userRoute.findById(req.user.id).populate("posts");

      const tagArray = req.body.tags
        ? req.body.tags.split(",").map((tag) => tag.trim())
        : [];

      const filePath = req.file.path;

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
      });

      const mediaUrl = result.secure_url;

      const post = await postRoute.create({
        author: user._id,
        media: mediaUrl,
        mediaType: req.body.mediaType,
        imageText: req.body.imageText,
        description: req.body.description,
        tags: tagArray,
      });
      console.log(post);
      user.posts.push(post._id);
      await user.save();

      fs.unlinkSync(filePath);

      res.redirect("/profile");
    } catch (error) {
      console.error("Error fetching user:", error);
      next(error);
    }
  }
);

//save route
router.get("/save", ensureAuthenticated, async (req, res, next) => {
  try {
    const user = await userRoute.findById(req.user.id).populate({
      path: "savedpost",
      model: "Post",
      populate: { path: "author", select: "username" },
    });

    res.render("save.ejs", { user, savedpost: user.savedpost });
  } catch (error) {
    console.error("Error fetching feed:", error);
    next(error); // Pass the error to the error handler
  }
});

// Route to handle save/unsave post

router.post("/save/:postId", ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.postId;

    const user = await userRoute.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if the post is already saved
    const isSaved = user.savedpost.includes(postId);

    if (isSaved) {
      //remove the post from savedpost
      user.savedpost = user.savedpost.filter((id) => id.toString() !== postId);
    } else {
      // add the post to savedpost
      user.savedpost.push(postId);
    }

    await user.save();
    res.redirect("/save");
    // res.json({ success: true, saved: !isSaved });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/posts/:id/like", ensureAuthenticated, async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await postRoute.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" }); // Handle case when post doesn't exist
    }

    if (!post.likes) {
      post.likes = [];
    }

    const userId = req.user._id.toString(); //for user id

    // const isLiked = post.likes.some((like) => like.toString() === userId);
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((like) => like.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({ success: true, isLiked: !isLiked });
  } catch (error) {
    console.error("Error in liking/unliking post:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

//delete button
router.post(
  "/posts/:id/delete",
  ensureAuthenticated,
  async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user._id;

    console.log("Delete request received for postId:", postId);

    try {
      const post = await postRoute.findByIdAndDelete(postId);

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      const mediaUrl = post.media;
      const publicId = mediaUrl.split("/").pop().split(".")[0];
      const resourceType = post.mediaType;

      const cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      console.log("Cloudinary deletion result:", cloudinaryResult);
      await postRoute.findByIdAndDelete(postId);
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

//edit section
router.get("/edit", async (req, res) => {
  try {
    const user = await userRoute.findById(req.user.id);
    res.render("edit.ejs", { user });
  } catch (error) {
    console.error("edit profile update error", error.message);
  }
});

router.post(
  "/editprofile",
  ensureAuthenticated,
  upload.single("profileImage"),
  async (req, res, next) => {
    try {
      const user = await userRoute.findById(req.user.id);
      const { description } = req.body;

      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/profile");
      }

      if (description) {
        user.description = description;
      }
      if (req.file) {
        user.profileImage = `${req.file.filename}`;
      }

      await user.save();

      req.flash("success", "Your profile has been updated successfully!");
      res.redirect("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      req.flash("error", "An error occurred while updating your profile.");
      res.redirect("/profile");
    }
  }
);

router.delete("/profileImage", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userRoute.findByIdAndUpdate(userId, {
      $unset: { profileImage: 1 },
    });
    res.redirect("profile.ejs");
  } catch (error) {
    console.log("Error deleting photo:", error);
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

router.get("/about", (req, res) => {
  res.render("about.ejs");
});

router.get("/profile/:userId/share", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid User ID");
    }

    const user = await userRoute.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("shareProfile.ejs", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
