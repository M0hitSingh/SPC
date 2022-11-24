const express =  require("express");
const { listproduct, viewproduct, searchProduct } = require("../controllers/product.controller");
const { authorization } = require("../middleware/authorization");

const router = express.Router();


// User
router.route("/list").get(listproduct);
router.route("/view/:id").get(authorization,viewproduct);
router.route("/search").get(searchProduct);




module.exports = router;
