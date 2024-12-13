document.addEventListener("DOMContentLoaded", () => {
  // Add event listener to all like and save icons
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

  const saveIcons = document.querySelectorAll(".save-icon");
  saveIcons.forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const postId = e.target.getAttribute("data-post-id");

      try {
        const response = await fetch(`/save/${postId}`, { method: "post" });

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
});
