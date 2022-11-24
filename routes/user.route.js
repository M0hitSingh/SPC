const express =  require("express");
const { getAllwishlist } = require("../controllers/user.controller");
const { authorization } = require("../middleware/authorization");

const router = express.Router();


// User
router.route("/wishlist").get(authorization,getAllwishlist);
// router.route("/viewproduct/:id").get(viewproduct);


module.exports = router;
