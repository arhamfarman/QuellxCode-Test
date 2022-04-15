const jwt = require("jsonwebtoken");
const ErrorResponse = require("../../utils/errorResponse");
const user = require(".././models/user");
const User = require(".././models/user");
const asyncHandler = require("./async");

//Protectt Routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    console.log("3");
    return next(new ErrorResponse("Apple ID not recognized", 401));
  }

  try {
    // Verify token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    var decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id);

    console.log({ user });

    if (user.appleVerified === false) {
      return next(new ErrorResponse("Apple ID Not Verified", 401));
    }
    next();
  } catch (err) {
    console.log({ err });
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});
