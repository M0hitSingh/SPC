const express =  require("express");
const { createOrder, verifyPayment } = require("../controllers/payment.controller");
import authorization from "../middleware/authorization";

/**
 * Endpoint: /api/payment
 */
const router = express.Router();

router
    .route("/order") //
    .post(authorization, createOrder);

router
    .route("/verify") //
    .post(authorization, verifyPayment);

module.exports = router;

