const express = require("express");
const router = express.Router();

const { createPaymentIntent } = require("../controllers/payment.controller");

router.post("/intent", createPaymentIntent);

module.exports = router;
