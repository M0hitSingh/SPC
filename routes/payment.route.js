const express =  require("express");
const { createOrder, verifyPayment } = require("../controllers/payment.controller");
const { authorization } = require("../middleware/authorization");

/**
 * Endpoint: /payment
 */
const router = express.Router();

router.route("/order").post(authorization,createOrder);
router.route("/verify").post(authorization,verifyPayment);

module.exports = router;

