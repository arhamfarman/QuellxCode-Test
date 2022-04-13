const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const app = express();

//Route files
const users = require("././api/routes/user");

//Body Parser
app.use(express.json());

// // Cookie Parser
app.use(cookieParser());

//Load the env variables
dotenv.config({ path: "./config/.env" });

//Connect to database
connectDB();

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount Routers
app.use("/api/users", users);

const PORT = process.env.PORT || 6900;

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
