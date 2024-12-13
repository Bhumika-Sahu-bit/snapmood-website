document.addEventListener("DOMContentLoaded", () => {
  // Like Icon Functionality
  const likeIcons = document.querySelectorAll(".like-icon");
  likeIcons.forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const postId = e.target.getAttribute("data-post-id");

      try {
        const response = await fetch(`/posts/${postId}/like`, {
          method: "POST",
        });

        if (response.ok) {
          e.target.classList.toggle("liked");
        } else {
          console.error("failed to like the post");
        }
      } catch (error) {
        console.error("Error like post", error);
      }
    });
  });

  // Save Icon Functionality
  const saveIcons = document.querySelectorAll(".save-icon");
  saveIcons.forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const postId = e.target.getAttribute("data-post-id");

      try {
        const response = await fetch(`/save/${postId}`, {
          method: "POST",
        });

        if (response.ok) {
          e.target.classList.toggle("saved");
        } else {
          console.error("Failed to save/unsave post");
        }
      } catch (error) {
        console.error("Error saving post:", error);
      }
    });
  });
  //for follow/unfollow button
  const followButton = document.querySelector("#follow-btn");

  followButton.addEventListener("click", async (e) => {
    const userIdtofollow = e.target.getAttribute("data-user-id");

    try {
      const response = await fetch(`/follow/${userIdtofollow}`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Server Response:", result);
        if (result.success) {
          if (result.following) {
            e.target.textContent = "Following";
            e.target.classList.remove("btn-primary");
            e.target.classList.add("btn-secondary");
          } else {
            e.target.textContent = "Follow";
            e.target.classList.remove("btn-secondary");
            e.target.classList.add("btn-primary");
          }
          const followerCountElement =
            document.getElementById("follower-count");
          if (followerCountElement) {
            followerCountElement.textContent = result.followerCount;
          }

          const followingCountElement =
            document.getElementById("following-count");
          if (followingCountElement) {
            followingCountElement.textContent = result.followingCount;
          }
        }
      } else {
        alert("An error occurred. Please try again later.");
      }
      console.log(document.querySelectorAll("#follow-btn").length); // Should output 1
    } catch (error) {
      console.error("Error in follow/unfollow action:", error);
    }
  });
});
