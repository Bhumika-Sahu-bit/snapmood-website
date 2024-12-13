const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const userRoute = require("../models/user");
const { ensureAuthenticated } = require("../middleware/protect");

router.get("/:userId/followers", ensureAuthenticated, async (req, res) => {
  try {
    const user = await userRoute
      .findById(req.params.userId)
      .populate("followers", "username profileImage");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("followersPage", {
      followers: user.followers,
      pageTitle: "followers",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/:userId/following", ensureAuthenticated, async (req, res) => {
  try {
    const user = await userRoute
      .findById(req.params.userId)
      .populate("following", "username profileImage");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("followingPage", {
      following: user.following,
      pageTitle: "Following",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//this route allow a user to follow or following  another user
router.post("/follow/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const userIdtofollow = req.params.userId; //the id of user which user want to follow
    const currentUserId = req.user._id; // the logged- in user id

    if (currentUserId === userIdtofollow) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    // const userIdtofollowobjectId = new mongoose.Types.ObjectId(userIdtofollow);
    // const currentUserIdobjectId = new mongoose.Types.ObjectId(currentUserId);

    const targetUser = await userRoute.findById(userIdtofollow);
    const currentUser = await userRoute.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if logged-in user is already follow the target user
    const isfollowing = targetUser.followers.some((id) =>
      id.equals(currentUserId)
    );

    if (isfollowing) {
      //for unfollow the another user
      targetUser.followers = targetUser.followers.filter(
        (id) => !id.equals(currentUserId)
      );
      //or ushe hamari following list se hatana keliye
      currentUser.following = currentUser.following.filter(
        (id) => !id.equals(userIdtofollow)
      );
    } else {
      targetUser.followers.push(currentUserId);

      currentUser.following.push(userIdtofollow);
    }

    await targetUser.save();
    await currentUser.save();

    // res.redirect(`/profilesearh/${userIdtofollow}`);
    res.json({
      success: true,
      following: !isfollowing,
      followerCount: targetUser.followers.length, // Total followers of the target user
      followingCount: currentUser.following.length, // Total following of the current user
    });
  } catch (error) {
    console.error("Error in follow/unfollow route:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;
