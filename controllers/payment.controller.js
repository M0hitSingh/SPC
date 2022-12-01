const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Payment = require("../model/Payment");
const User = require("../model/User");
const Razorpay = require('razorpay');
const asyncWrapper = require("../utils/asyncWrapper");
const crypto = require('crypto');

let instance = new Razorpay({
    key_id:'rzp_test_OJiQYnuFVOUynK',
    key_secret:'NpjldKMut5vojNuW5XWDFgFo'
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
        console.log(order);
        paymentData = {
            currency:order.currency,
            amount: order.amount,
            razorpay: order,
            createdBy: createdBy,
        };
    })
    const payment = await Payment.create(paymentData);

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

    const payment = await Payment.findById(id);
    if (!payment) {
        const message = `Cannot find payment with id: ${id}`;
        return next(createCustomError(message, 400));
    }
    let body = payment.razorpay.id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
    .createHmac("sha256", "Wok5mJv2F0pa5HKLeXZfUr9r")
    .update(body.toString())
    .digest("hex");
    console.log(expectedSignature);
    console.log(razorpay_signature);
    const isVerified = expectedSignature===razorpay_signature? true:false;
    console.log(isVerified);
    if (isVerified) {
        const updateData = {
            paid: true,
            "razorpay.paymentId": razorpay_payment_id,
            "razorpay.singature": razorpay_signature,
            "status": "Completed"
        };
        await Payment.findByIdAndUpdate(id, updateData);
        const user = await User.findById(req.user.userId);
        user.cart=[];
        user.orderhistory.push_back(id);
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
