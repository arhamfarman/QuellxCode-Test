const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/user");
const Employee = require("../models/employee");
const { json } = require("body-parser");
const { request } = require("@octokit/request");
const jwt = require("jsonwebtoken");
const { getDistance } = require("geolib");

//@route   POST /api/users/register
//@access  Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const em = await User.findOne({ email });

  if (em) {
    return next(new ErrorResponse("User with that email already exists", 404));
  }

  const user = await User.create({ email, name, password, role });

  try {
    sendTokenResponse(user, 200, res);

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);

    await user.save();

    return next(new ErrorResponse(err, 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@route   POST /api/users/login
//@access  Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const pass = await User.findOne({ email });

  if (!pass) {
    return next(new ErrorResponse("Email not verified", 400));
  }

  //Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide an email and a password", 400)
    );
  }

  const verifStatus = pass.verificationStatus;

  if (verifStatus == "unverified") {
    return next(new ErrorResponse("User not Verified", 400));
  }

  //Check for the user

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  //Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  sendTokenResponse(user, 200, res);
});

//@route   POST /api/users/addEmployee
//@access  Private

exports.addEmployee = asyncHandler(async (req, res, next) => {
  let { email, name, salary, location } = req.body;
  const tax = (4 / 100) * salary;
  const employeeCheck = await Employee.findOne({ email: email });

  if (employeeCheck) {
    res.status(400).json({
      message: "Employee with this email already exists",
    });
  } else {
    const user = await Employee.create({
      email,
      name,
      salary,
      tax,
      location,
    });

    try {
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      return next(new ErrorResponse(err, 400));
    }
  }
});

//@route   PUT /api/users/updateEmployee
//@access  Private

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  let { email, salary } = req.body;
  const tax = (4 / 100) * salary;
  const fieldsToUpdate = {
    salary: salary,
    tax: tax,
  };
  try {
    const user = await Employee.findOneAndUpdate(email, fieldsToUpdate, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
});

//@route   GET /api/users/getEmployees
//@access  Private

exports.getEmployees = asyncHandler(async (req, res, next) => {
  try {
    const user = await Employee.find();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
});

//@route   POST /api/users/employeeRadius
//@access  Private

exports.employeeRadius = asyncHandler(async (req, res, next) => {
  const dist = Employee.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [req.body.lat, req.body.long],
        },
        $maxDistance: 1000 * 1000,
      },
    },
  }).exec((err, location) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        status: false,
        data: err,
      });
    }

    if (location) {
      console.log(location);
      return res.status(500).send({
        status: true,
        data: location,
      });
    }
  });
});

//@route   DELETE /api/users/deleteEmployee
//@access  Private

exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  let { email } = req.body;
  try {
    const user = await Employee.findOneAndDelete(email);

    if (!user) {
      return next(new ErrorResponse("No User Found", 400));
    }

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
});

//@route   GET /api/users/employeeMinMaxSalary
//@access  Private

exports.employeeMinMaxSalary = asyncHandler(async (req, res, next) => {
  try {
    const salary = await Employee.aggregate([
      {
        $group: {
          _id: null,
          max_val: { $max: "$salary" },
          min_val: { $min: "$salary" },
        },
      },
    ]);

    if (!salary) {
      return next(new ErrorResponse("No User Found", 400));
    }

    const highestSalary = salary[0].max_val;
    const minimumSalary = salary[0].min_val;

    res.status(200).json({
      success: true,
      message: `Highest salary among employees is ${highestSalary}, and the lowest is ${minimumSalary}`,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
});

//@route   GET /api/users/getWeather
//@access  Private

exports.getWeather = asyncHandler(async (req, res, next) => {
  try {
    const URL = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=Islamabad&aqi=no`;
    const result = await request(URL);

    res.status(200).json({
      success: true,
      data: result.data.current,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
});

// JWT Token Assign Method

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtTokens();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    user: user,
    success: true,
    token,
  });
};
