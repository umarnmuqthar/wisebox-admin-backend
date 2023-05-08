const Subscription = require('../models/Subscription_model')
const createError = require('http-errors')

const SUBSCRIPTION_ACTIVE = +process.env.SUBSCRIPTION_ACTIVE

module.exports = {
    verifySubscription: async (req, res, next) => {
        try {
            const {subscription_id} = req.query

            if(!subscription_id) throw createError.BadRequest('Subscription id is required!')
            
            const subscription = await Subscription.findById(subscription_id)

            if (subscription.isActive || !SUBSCRIPTION_ACTIVE) {
                next()
            } else {
                const error = {
                    message: "Unsubscribed",
                    subscriptionState: subscription.status,
                    status: 403
                }
                throw error
            }
        } catch (err) {
            const error = {
                message: err.message ?? "Internal server error",
                status: err.status ?? 500
            }
            return res.status(error.status).json({ error });
        }
    },
}