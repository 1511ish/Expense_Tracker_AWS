const Razorpay = require('razorpay');
const Order = require('../models/Order')
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.purchasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const amount = 2500;
        rzp.orders.create({ amount: amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            req.user.createOrder({ orderid: order.id, status: 'PENDING' }).then(() => {
                return res.status(201).json({ order, key_id: rzp.key_id });
            }).catch(err => {
                throw new Error(err);
            });
        })
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err });
    }
}

function generateAccessToken(id, ispremiumuser) {
    return jwt.sign({ userId: id, isPremium: ispremiumuser }, 'secretkey');
}

exports.updateTransactionStatus = async (req, res, next) => {
    try {
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ where: { orderId: order_id } })
        const promise1 = order.update({ paymentid: payment_id, status: 'COMPLETED' })
        const promise2 = req.user.update({ ispremiumuser: true })

        Promise.all([promise1, promise2])
            .then(() => {

                return res.status(202).json({ success: true, message: 'Payment successful!', token: generateAccessToken(req.user.id, req.user.ispremiumuser) })
            })
            .catch((err) => {
                throw new Error(err)
            })
    } catch (err) {
        console.log(err)
        res.status(403).json({ message: 'updating transaction failed!', error: err })
    }
}

exports.updateFailedTransactionStatus = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        const order = await req.user.getOrders({ where: { orderId: order_id } })
        order[0].paymentId = 'N/A'
        order[0].status = 'FAILED'
        await order[0].save()
        res.status(402).json({ message: 'payment failed!' })
    } catch (err) {
        console.log(err)
        res.status(403).json({ message: 'updating transaction failed!', error: err })
    }
}