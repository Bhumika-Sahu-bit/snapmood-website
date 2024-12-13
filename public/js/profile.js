document.querySelector("#uploadicon").addEventListener("click", function () {
  document.querySelector("#uploadform input").click();

  document
    .querySelector("#uploadform input")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      fetch("/fileupload", {
        method: "post",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
              return response.json();
            } else {
              return response.text();
            }
          }
          throw new Error("failed to upload post");
        })
        .then((data) => {
          console.log("Success", data);
          window.location.href = "/profile";
        })
        .catch((error) => {
          console.error("Error", error);
        });
    });
});

document
  .querySelector("#uploadform input")
  .addEventListener("change", function () {
    document.querySelector("#uploadform").submit();
  });

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

  //delete work
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const postId = e.target.getAttribute("data-post-id");

      try {
        const confirmDelete = confirm(
          "Are you sure you want to delete the post?"
        );
        if (!confirmDelete) return;

        //send delete request to the server
        const response = await fetch(`/posts/${postId}/delete`, {
          method: "POST",
        });

        if (response.ok) {
          alert("Post deleted successfully.");
          e.target.closest(".post-card").remove(); // Optionally remove the post from UI
        } else {
          console.error("Failed to delete post:", response.statusText);
          alert("Failed to delete post.");
        }
      } catch (error) {
        console.error("Error saving post:", error);
      }
    });
  });
});
