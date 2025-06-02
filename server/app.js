require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

module.exports = app;
