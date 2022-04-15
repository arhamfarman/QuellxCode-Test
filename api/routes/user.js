const express = require("express");
const router = express.Router({});
const passport = require("passport");
const user = require("../controllers/user");
const User = require("../models/user");
const AppleStrategy = require("passport-appleid").Strategy;
const { protect } = require("../middleware/auth");

router.use(passport.initialize());
router.use(passport.session());

//POST
router.post("/register", user.register);
router.post("/login", user.login);
router.post("/addEmployee", protect, user.addEmployee);
router.post("/employeeRadius", protect, user.employeeRadius);

//PUT
router.put("/updateEmployee", protect, user.updateEmployee);

//DELETE
router.delete("/deleteEmployee", protect, user.deleteEmployee);

//GET
router.get("/getEmployees", protect, user.getEmployees);
router.get("/employeeMinMaxSalary", protect, user.employeeMinMaxSalary);
router.get("/getWeather", protect, user.getWeather);

//OAuth

passport.use(
  new AppleStrategy(
    {
      clientID: "client_id",
      callbackURL: "redirect_uri",
      teamId: "team_id",
      keyIdentifier: "key_identifier",
      //   privateKeyPath: path.join(__dirname, "./AuthKey_RBXXXXXXXX.p8"),
    },
    function (accessToken, refreshToken, profile, done) {
      let user = profile;
      const { id, email } = profile;

      User.findOrCreate(
        { appleId: id, email: email, appleVerified: true },
        function (err, user) {
          done(err, user);
        }
      );

      return done(null, user);
    }
  )
);

router.get("/auth/apple", passport.authenticate("apple"));

router.get(
  "/auth/apple/callback",
  passport.authenticate("apple", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

router.get("/login", function (req, res) {
  res.render("./login");
});

router.get("/", function (req, res) {
  if (!req.user) return res.redirect("/login");
  res.json(req.user);
});

router.post("/removeAppleId", protect, user.removeAppleId);
module.exports = router;
