const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Payment = new Schema(
    {}, 
    {
        timestamps: true,
        strict: false
    },
)

module.exports = mongoose.model('payment', Payment)