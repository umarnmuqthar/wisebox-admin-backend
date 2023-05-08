const Razorpay = require('razorpay')

const {RAZORPAY_KEY_ID, RAZORPAY_SECRET} = process.env

const instance = new Razorpay({  key_id: RAZORPAY_KEY_ID,  key_secret: RAZORPAY_SECRET,});

module.exports = { instance }