const bcrypt =  require("bcryptjs");
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
const schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "Please provide first name"],
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please provide email"],
            match: [
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
                "Please provide valid email",
            ],
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Please provide password"],
        },
        passwordChangedAt: {
            type: Date,
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: Date,
        },
        phoneNumber: {
            type: String,
            required: [true, "Please provide phone number"],
            trim: true,
        },
        gender: {
            type: String,
            required: [true, "Please provide gender"],
            enum: {
                values: ["Male", "Female", "Others"],
                message: "Please choose from Male, Female or Others",
            },
        },
        location:{
            type:String
        },
        role: {
            type:String,
            enum :{
                values: ["User", "Admin"],
                message: "Please select User or Admin",
            },
            default:"User"
        },
        isVerified: {
            type:Boolean,
            default:false
        },
        avatar: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

userSchema.methods.generateJWT = function () {
    return jwt.sign({ userId: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
};


userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports =  mongoose.model("User", userSchema, "user");
