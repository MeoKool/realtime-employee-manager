const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getEmployee,
  deleteEmployee,
  updateEmployee,
  getAllEmployees,
} = require("../controllers/employeeController");

router.post("/create", createEmployee);

router.post("/", getAllEmployees);

router.post("/get", getEmployee);

router.post("/delete", deleteEmployee);

router.post("/update", updateEmployee);

module.exports = router;
