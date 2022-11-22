const express = require("express");
const auth = require("./auth.route");

const router = express.Router();

router.get("/", (req, res) => {
    res.send("SPC API server is running!!!");
});
router.use("/auth",auth);

module.exports = router;
