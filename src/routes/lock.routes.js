const express = require("express");
const router = express.Router();
const { lockSeats } = require("../controllers/lock.controller");

router.post("/", lockSeats);

module.exports = router;
