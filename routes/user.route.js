const express =  require("express");
const { getAllwishlist,addWishlist,removeWishlist, getCart, addCart, removeCart } = require("../controllers/user.controller");
const { authorization } = require("../middleware/authorization");

const router = express.Router();


//wishlist
router.route("/wishlist").get(authorization,getAllwishlist);
router.route("/wishlist").post(authorization,addWishlist);
router.route("/wishlist").delete(authorization,removeWishlist);
//cart
router.route("/cart").get(authorization,getCart);
router.route("/cart").post(authorization,addCart);
router.route("/cart").delete(authorization,removeCart);


// router.route("/viewproduct/:id").get(viewproduct);


module.exports = router;
