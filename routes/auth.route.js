const express =  require("express");
const {
    forgotPassword,
    loginUser,
    refreshToken,
    registerUser,
    otpValid
} = require("../controllers/auth.controller");

/**
 * Endpoint: /api/v1/auth
 */
const router = express.Router();


router.route("/refresh-token").get(refreshToken);

// User
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/otp-verify").post(otpValid); 
    




module.exports = router;
