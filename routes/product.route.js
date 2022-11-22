const express =  require("express");
const { listproduct, viewproduct } = require("../controllers/product.controller");

const router = express.Router();


// User
router.route("/listproduct").get(listproduct);
router.route("/viewproduct/:id").get(viewproduct);
    

module.exports = router;
