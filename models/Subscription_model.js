const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* Subscription state 
    - UNSUBSCRIBED
    - PENDING
    - SUBSCRIBED    
    - EXPIRED
*/

const SubscriptionSchema = new Schema(
    {
            stream: {
                type: mongoose.Types.ObjectId,
                ref: 'stream'
            },
            studentId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'student'
            },
            classId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'class'
            },
            validity: {
                type: Date,
            },
            isActive: {
                type: Boolean,
                default: false
            },
            status: {
                type: String,
                enum: ['UNSUBSCRIBED', 'PENDING', 'SUBSCRIBED', 'EXPIRED'],
                default: 'UNSUBSCRIBED'
            },
            bookmarkedQuestions: [{
                type: mongoose.Types.ObjectId,
                ref: 'question'
            }],
            wiseCoins: {
                weeklyCoins: [{coins: {type: Number, required: true}, date: {type: Date, required: true}}],
                totalCoins: {type: Number, default: 0}
            },
            crowns: {
                type: Number,
                default: 0
            },
            /* TODO:
            - payment info 
            */
           
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('subscription', SubscriptionSchema)