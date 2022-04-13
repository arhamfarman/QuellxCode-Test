const express = require("express");
const router = express.Router({});

const user = require("../controllers/user");
const { protect } = require("../middleware/auth");

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

module.exports = router;
