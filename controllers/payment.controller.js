const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Payment = require("../model/Payment");
const { Transaction } = require("../model/Transaction");
const Razorpay = require('razorpay');
const asyncWrapper = require("../utils/asyncWrapper");
let instance = new Razorpay({
    key_id:'rzp_test_OJiQYnuFVOUynK',
    key_secret:'NpjldKMut5vojNuW5XWDFgFo'
})

const createOrder = asyncWrapper(async (req, res, next) => {
    const createdBy = req.user.userId;
    const order = req.body;

    const transaction = await Transaction.findById(order.transaction);
    if (!transaction) {
        const message = "Please provide valid transactionId";
        return next(createCustomError(message, 400));
    }
    let options = {
        amount: req.body.amount,
        currency:"INR",
        receipt:"rcp1"
    }
    const orderResponse = await instance.orders.create(options,function (err,order){
        if(err){
            const message = "Cannot create Order";
            return next(createCustomError(message, 400));
        }
        console.log(order);
    })

    const paymentData = {
        transaction: order.transaction,
        amount: order.amount,
        razorpay: orderResponse,
        createdBy: createdBy,
    };
    const payment = await Payment.create(paymentData);

    try {
        await payment.save();
    } catch (error) {
        const message = `There was an Error: ${error}`;
        return next(createCustomError(message, 400));
    }

    const response = sendSuccessApiResponse(payment);
    res.status(200).json(response);
});


const verifyPayment = asyncWrapper(async (req, res, next) => {
    const createdBy = req.user.userId;
    const { id, orderId, paymentId, signature } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
        const message = `Cannot find payment with id: ${id}`;
        return next(createCustomError(message, 400));
    }

    const verifyData = {
        orderId: payment.razorpay.id,
        paymentId: paymentId,
        signature: signature,
    };

    const razorpayService = new RazorpayService();
    const isVerified = await razorpayService.verify(verifyData);

    if (isVerified) {
        const updateData = {
            paid: true,
            "razorpay.paymentId": paymentId,
            "razorpay.singature": signature
        };
        await Payment.findByIdAndUpdate(id, updateData);
        await Transaction.findByIdAndUpdate(payment.transaction, { status: "Completed" });
    }

    const response = sendSuccessApiResponse({ verfied: isVerified });
    res.status(200).json(response);
});

module.exports = {
    createOrder,
    verifyPayment
};
