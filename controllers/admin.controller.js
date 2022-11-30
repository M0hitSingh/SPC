const express = require("express");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const User = require("../model/User");
const Product = require("../model/product")
const asyncWrapper = require("../utils/asyncWrapper");


const addproduct = async (req, res, next) => {
  try{
    const id = req.user.userId;
    const {
      name,
      category,
      quantity,
      description,
      price
      } = req.body;
    const image = req.files;
      console.log(req.files)
    const imageUrl=[];
    if(image){
    image.forEach(image=>{
      imageUrl.push("/public/"+image.originalname);
    })
  }
  const toStore = {
    name,
    category,
    quantity,
    description,
    price,
    imageUrl
  };
  const user = await User.findById(id);
  if (!user) {
    const message = "Not registered";
    return next(createCustomError(message, 403));
  }
  else if(user.role != "Admin"){
    const message = "Not an admin";
    return next(createCustomError(message, 403));
  }
  else{
    console.log(1)
    const product = await Product.create(toStore);
    res.json(sendSuccessApiResponse(product, 201));
  }
}
catch(err){
  return createCustomError(err,400);
}
};


const updateproduct = async (req, res, next) => {
  try{
      const id = req.user.userId;
      const {
        name,
        category,
        quantity,
        description,
        price,
        productid
      } = req.body;
console.log(name);
      const image = req.files;
        
      const imageUrl=[];
      if(image){
    
        image.forEach(image=>{
          imageUrl.push(image.path);
        })
      }
      
      const toStore = {
        name,
        category,
        quantity,
        description,
        price,
        imageUrl
      };
      const user = await User.findById(id);
      if (!user) {
          const message = "Not registered";
          return next(createCustomError(message, 403));
      }
      else if(user.role != "Admin"){
        const message = "Not an admin";
        return next(createCustomError(message, 403));
      }
      else{
        console.log(1)
          const product = await Product.updateOne({_id:productid},toStore);
          res.json(sendSuccessApiResponse(product, 201));
      }
  }
  catch(err){
      return createCustomError(err,400);
  }
};

const deleteproduct = asyncWrapper(async(req,res,next)=>{
  const product = req.params.productid;
  const result = await Product.findByIdAndDelete(product);
  if(!result) return next(createCustomError(`${product} not found`,404));
  res.json(sendSuccessApiResponse(result,200));
})

module.exports = {
    addproduct,
    updateproduct,
    deleteproduct
};
