const mongoose = require("mongoose");
const createCustomError = require("../errors/customAPIError")

const transactionSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            default:Date.now()
        },
        method: {
            type: String,
            trim: true,
        },
        razorpayDetails: {
            amount: {
                type: Number,
            },
            paymentMode: {
                type: String,
                trim: true,
            },
            referenceNumber: {
                type: String,
                trim: true,
            },
            remarks: {
                type: String,
                trim: true,
            },
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "onHold", "completed", "cancelled"],
                message: "Please provide status value pending, onHold, completed, cancelled",
            },
            default: "pending",
        },
        amount: {
            type: Number,
        },
        Item:[{
            quantity:{
                type:Number
            },
            product:{
                type:schema.Types.ObjectId,
                ref:"product"
            }
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            required: [true, "Please provide createdBy"],
            ref: "User",
        },
    },
    { timestamps: true }
);

transactionSchema.pre("save", function (next) {
    switch (this.method) {
        case "cheque": {
            if (!this.chequeDetails.amount) {
                return next(createCustomError("Please provide cheque amount", 400));
            }
            if (!this.chequeDetails.chequeNumber) {
                return next(createCustomError("Please provide cheque number", 400));
            }
            if (!this.chequeDetails.dateOfIssue) {
                return next(createCustomError("Please provide date of issue", 400));
            }
            if (!this.chequeDetails.bankName) {
                return next(createCustomError("Please provide bank name", 400));
            }
            if (!this.chequeDetails.ifscCode) {
                return next(createCustomError("Please provide ifsc code", 400));
            }
            if (!this.chequeDetails.branch) {
                return next(createCustomError("Please provide branch name", 400));
            }
            this.cashDetails = undefined;
            this.razorpayDetails = undefined;
            this.bankTransferDetails = undefined;
            next();
            break;
        }
        case "bankTransfer": {
            if (!this.bankTransferDetails.amount) {
                return next(createCustomError("Please provide amount", 400));
            }
            if (!this.bankTransferDetails.accountNumber) {
                return next(createCustomError("Please provide account number", 400));
            }
            if (!this.bankTransferDetails.ifscCode) {
                return next(createCustomError("Please provide IFSC code", 400));
            }
            if (!this.bankTransferDetails.paymentMode) {
                return next(createCustomError("Please provide payment mode", 400));
            }
            if (!this.bankTransferDetails.referenceNumber) {
                return next(createCustomError("Please provide reference number", 400));
            }
            this.razorpayDetails = undefined;
            this.chequeDetails = undefined;
            this.cashDetails = undefined;
            next();
            break;
        }
        case "cash": {
            if (!this.cashDetails.amount) {
                return next(createCustomError("Please provide amount", 400));
            }
            if (!this.cashDetails.date) {
                return next(createCustomError("Please provide date", 400));
            }
            if (!this.cashDetails.memoNumber) {
                return next(createCustomError("Please provide memo number", 400));
            }
            if (!this.cashDetails.receiverName) {
                return next(createCustomError("Please provide receiver name", 400));
            }

            this.status = "Completed";
            this.chequeDetails = undefined;
            this.razorpayDetails = undefined;
            this.bankTransferDetails = undefined;
            next();
            break;
        }
        case "razorpay": {
            if (!this.razorpayDetails.amount) {
                return next(createCustomError("Please provide amount", 400));
            }
            this.cashDetails = undefined;
            this.chequeDetails = undefined;
            this.bankTransferDetails = undefined;
            next();
            break;
        }
        default: {
            // next(createCustomError("Please provide valid payment method", 400));
            next();
            break;
        }
    }
});

module.exports = mongoose.model("Transaction",transactionSchema);

