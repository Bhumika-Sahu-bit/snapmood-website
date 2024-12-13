const express = require("express");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3000;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
require("./config/passport");
const flash = require("connect-flash");
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const mongoURI = process.env.mongoURI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection error:", err));

//view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//connect flash
app.use(flash());

// app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI,
      collectionName: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

//routes
const adminroute = require("./routes/admin");
const profileroute = require("./routes/profile");
const feedroute = require("./routes/feed");
const logoutroute = require("./routes/logout");
const searchroute = require("./routes/search");
const followroute = require("./routes/follow.");
const forgotroute = require("./routes/forgetPW");

app.use((req, res, next) => {
  // res.locals.messages = req.flash();
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  // res.locals.error = req.flash("error");
  next();
});

app.use("/", adminroute);
app.use("/", profileroute);
app.use("/", feedroute);
app.use("/", logoutroute);
app.use("/", searchroute);
app.use("/", followroute);
app.use("/", forgotroute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
