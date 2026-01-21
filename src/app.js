const express = require("express");
require("express-async-errors");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const errorHandler = require("./middlewares/error.middleware");
app.use(errorHandler);

module.exports = app;
