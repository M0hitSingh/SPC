const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Payment = require("../model/Payment");
const Transaction = require("../model/Transaction");
const User = require("../model/user");
const Razorpay = require('razorpay');
const asyncWrapper = require("../utils/asyncWrapper");
const crypto = require('crypto');
const Product = require("../model/product");
const mongoose = require("mongoose");

let instance = new Razorpay({
    key_id:process.env.key_id,
    key_secret:process.env.key_secret
})

const createOrder = asyncWrapper(async (req, res, next) => {
    const createdBy = req.user.userId;
    const order = req.body;

    let options = {
        amount: req.body.amount,
        currency:req.body.currency,
        receipt:"rcp1"
    }
    let paymentData;
    await instance.orders.create(options,function (err,order){
        if(err){
            const message = "Cannot create Order";
            return next(createCustomError(message, 400));
        }
        paymentData = {
            currency:order.currency,
            amount: order.amount,
            razorpay: order,
            createdBy: createdBy,
        };
    })
    const payment = await Transaction.create(paymentData);

    try{
        const user = await User.findById(req.user.userId);
        user.cart.forEach(element => {
            payment.Item.push(element);
        });
        await payment.save();
    }
    catch (error)
    {
        const message = `There was an Error: ${error}`;
        return next(createCustomError(message, 400));
    }

    const response = sendSuccessApiResponse(payment);
    res.status(200).json(response);
});


const verifyPayment = asyncWrapper(async (req, res, next) => {
    const createdBy = req.user.userId;
    const { id, razorpay_payment_id, razorpay_signature } = req.body;
    const Id = mongoose.Types.ObjectId(id);
    const payment = await Transaction.findById(Id);
    const orid = payment.razorpay.id;
    if (!payment) {
        const message = `Cannot find payment with id: ${id}`;
        return next(createCustomError(message, 400));
    }
    let body = payment.razorpay.id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
    .createHmac("sha256", process.env.key_secret)
    .update(body.toString())
    .digest("hex");
    const isVerified = expectedSignature===razorpay_signature? true:false;
    if (isVerified) {
        const updateData = {
            "razorpay.paymentId": razorpay_payment_id,
            "razorpay.singature": razorpay_signature,
        };
        // console.log(payment);
        
        const pay={ 
     razorpay:payment.razorpay,
  currency:payment.currency,
  amount :payment.amount,
  createdBy:payment.createdBy,
  Item:payment.Item,
  paid: true,
  status: "Completed"
    }
        const obj = await Payment.create(pay);
        await payment.remove();
        const pId = await Payment.findOneAndUpdate({'razorpay.id': orid},updateData)
        // console.log(pId);
        const user = await User.findById(req.user.userId).populate('cart.product');
        console.log("hello");
        await Promise.all(user.cart.map(async (x) => {
            const pro = await Product.findByIdAndUpdate((x.product._id).toString(),{
               $inc:{
                   quantity: -x.quantity
                }
            }
            );
         }));
        user.cart=[];
        user.orderhistory.push(pId);
        // console.log(user);
        await user.save();
        const response = sendSuccessApiResponse({ verfied: isVerified });
        res.status(200).json(response);
    }
    else return next(createCustomError("Not a valid Signature",402));

});

module.exports = {
    createOrder,
    verifyPayment
};
