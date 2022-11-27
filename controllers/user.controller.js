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



const ratingandreview = asyncWrapper(async (req,res,next)=>{
 const {productid} = req.params;
    const userId = req.user.userId;
    const {rating, review}= req.body;

    const user = await User.findById(userId);
    if(!user)
    {
        const message = "Not registered";
        return next(createCustomError(message, 403));
    }
    const prodindex = user.orderhistory.findIndex(i => i==productid);
    if(prodindex == -1)
    {
        const message = "Can't rate or review. Buy first";
        return next(createCustomError(message, 400));
    }
    const product = await Product.findById(productid);
    if(!product)
    {
        const message = "Not found";
        return next(createCustomError(message, 403));
    }
    let total = product.avgrating * product.eachrating.length;

    const ratingindex = product.eachrating.findIndex(i=>(i.user)==userId)
    
    if(ratingindex == -1)
    product.eachrating[product.eachrating.length] = {user:userId, rate:rating,userreview:review};
    else
    {
        total-= product.eachrating[ratingindex].rate;
        product.eachrating[ratingindex] = {user:userId, rate:rating,userreview:review};
    }

    total += rating;
    total /= product.eachrating.length;
    user.avgrating = total;
    await product.save();
    const response = sendSuccessApiResponse(product,200);
    res.json(response);
})


module.exports = {
    getAllwishlist,
    addWishlist,
    removeWishlist,
    getCart,
    removeCart,
    addCart,
    ratingandreview
};