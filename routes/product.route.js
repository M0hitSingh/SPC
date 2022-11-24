const express =  require("express");
const { listproduct, viewproduct } = require("../controllers/product.controller");
const { authorization } = require("../middleware/authorization");

const router = express.Router();


// User
router.route("/list").get(listproduct);
router.route("/view/:id").get(authorization,viewproduct);


module.exports = router;
