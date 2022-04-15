const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");
const passport = require("passport");

const dotenv = require("dotenv");
const connectDB = require("./config/database");
const app = express();

//Route files
const users = require("././api/routes/user");

//Body Parser
app.use(express.json());

// // Cookie Parser
app.use(cookieParser());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use(
  require("express-session")({
    secret: "apple cat",
    resave: true,
    saveUninitialized: true,
  })
);

//Load the env variables
dotenv.config({ path: "./config/.env" });

//Connect to database
connectDB();

//Mount Routers
app.use("/api/users", users);

const PORT = process.env.PORT || 7000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// handle Unhandled Promise rejections
process.on("unhandleRejection", (err, promise) => {
  console.log(`Error ${err.message}`.red);
  //close server and exit process
  server.close(() => process.exit(1));
});
