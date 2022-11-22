const express = require("express");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Product = require("../model/product")
const asyncWrapper = require("../utils/asyncWrapper");

const listproduct = async (req, res, next) => {
    try{
  
        const products = await Product.find({});
        if (!products) {
            const message = "No products to show";
            return next(createCustomError(message, 403));
        }
        else{
          console.log(1);
            res.json(sendSuccessApiResponse(products, 200));
        }
    }
    catch(err){
        return createCustomError(err,400);
    }
};


const viewproduct = async (req, res, next) => {
  try{
      const {
        id
      } = req.params;

      const product = await Product.findById(id);
      if (!product) {
          const message = "Product not found";
          return next(createCustomError(message, 403));
      }
      else{
        console.log(1);
          res.json(sendSuccessApiResponse(product, 201));
      }
  }
  catch(err){
      return createCustomError(err,400);
  }
};


module.exports = {
    listproduct,
    viewproduct
};
