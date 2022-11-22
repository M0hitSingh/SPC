const express =  require("express");
const upload = require("../middleware/fileupload");
const {authorization} = require("../middleware/authorization")
const { addproduct, updateproduct } = require("../controllers/admin.controller");

const router = express.Router();

// admin
router.route("/addproduct").post(authorization, upload.array( 'image', 5 ), addproduct);
router.route("/updateproduct").patch( authorization,upload.array( 'image', 5 ),updateproduct);
    

module.exports = router;
