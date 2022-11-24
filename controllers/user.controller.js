const express = require("express");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Product = require("../model/product");
const User = require("../model/User");
const asyncWrapper = require("../utils/asyncWrapper");


const getAllwishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const doc = await User.findById(userId).populate("products");
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})



module.exports = {
    getAllwishlist
};