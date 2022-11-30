const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Payment = require("../model/Payment");
const { Transaction } = require("../model/Transaction");
const Razorpay = require('razorpay');
let instance = new Razorpay({
    key_id:'rzp_test_OJiQYnuFVOUynK',
    key_secret:'NpjldKMut5vojNuW5XWDFgFo'
})

const createOrder = asyncWrapper(async (req, res, next) => {
    const createdBy = req.user.userId;
    const order = req.body;

    const transaction = Transaction.findById(order.transaction);
    if (!transaction) {
        const message = "Please provide valid transactionId";
        return next(createCustomError(message, 400));
    }

    const razorpayService = new RazorpayService();
    const orderReponse = await razorpayService.createOrder(order);

    const paymentData = {
        transaction: order.transaction,
        currency: order.currency,
        amount: order.amount,
        razorpay: orderReponse,
        createdBy: createdBy,
        modifiedBy: createdBy,
    };
    const payment = await Payment.create(paymentData);

    try {
        await payment.save({ validateBeforeSave: false });
    } catch (error) {
        const message = `There was an Error: ${error}`;
        return next(createCustomError(message, 400));
    }

    const response = sendSuccessApiResponse(payment);
    res.status(200).json(response);
});
