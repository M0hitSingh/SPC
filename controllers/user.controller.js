const express = require("express");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Product = require("../model/product");
const User = require("../model/User");
const asyncWrapper = require("../utils/asyncWrapper");


const getAllwishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const doc = await User.findById(userId).populate("wishlist")
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})

const addWishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const wishlist = req.body.wishlist;
    const doc = await User.findOneAndUpdate({_id:userId},{"$addToSet":{wishlist:wishlist}});
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})

const removeWishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const wishlist = req.body.wishlist;
    const doc = await User.findOneAndUpdate({_id:userId},{"$pull":{wishlist:wishlist}});
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})

const getCart = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const doc = await User.findById(userId).populate("cart")
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})

const addCart = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const cart = req.body.cart;
    const doc = await User.findOneAndUpdate({_id:userId},{"$addToSet":{cart:cart}});
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse("Added to Cart",200);
    res.json(response);
})

const removeCart = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const cart = req.body.cart;
    const doc = await User.findOneAndUpdate({_id:userId},{"$pull":{cart:cart}});
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse("Remove from cart",200);
    res.json(response);
})



module.exports = {
    getAllwishlist,
    addWishlist,
    removeWishlist,
    getCart,
    removeCart,
    addCart
};