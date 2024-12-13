const mongoose = require("mongoose");

// mongoose
//   .connect("mongodb://127.0.0.1:27017/pinterestClone", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Database connection error:", err));

const postSchema = new mongoose.Schema(
  {
    imageText: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v && v.trim().length > 0; // Ensure it's not just spaces
        },
        message: "imageText cannot be empty or whitespace.",
      },
    },
    media: {
      type: String,
      required: true, // Stores the URL or file path of the image or video
    },
    mediaType: {
      type: String,
      enum: ["image", "video"], // Restricts to either "image" or "video"
      required: true,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Refers to the User model
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Post", postSchema);
