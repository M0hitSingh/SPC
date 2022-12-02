const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Payment = require("../model/Payment");
const Transaction = require("../model/Transaction");
const User = require("../model/User");
const Razorpay = require('razorpay');
const asyncWrapper = require("../utils/asyncWrapper");
const crypto = require('crypto');
const Product = require("../model/product");

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

    const payment = await Transaction.findById(id);
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
            paid: true,
            "razorpay.paymentId": razorpay_payment_id,
            "razorpay.singature": razorpay_signature,
            "status": "Completed"
        };
        await Transaction.findByIdAndUpdate(id, updateData);
        const obj = new Payment(
            payment
        )
        await obj.save();
        payment.remove();
        const user = await User.findById(req.user.userId);
        await Promise.all(user.cart.map(async (x) => {
            const prod = await Product.findByIdAndUpdate(x.product,{quantity:quantity-x.quantity});
          }));
        user.cart=[];
        user.orderhistory.push(id);
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
