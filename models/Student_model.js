const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const StudentSchema = new Schema(
    {
        email: {
            type: String,
            lowercase: true,
            trim: true
        },
        phone: {
            type: Number,
            required: true,
            min: 1000000000,
            max: 9999999999,
            unique: true,
            /*  */
        },
        password: {
            type: String,
            minLength: 8,
            trim: true
        },
        name: {
            type: String,
        },
        gender: {
            type: String
        },
        dob: {
            type: Date
        },
        fcmToken: {
            type: String
        },
        profileImage: {
            imageUrl: {type: String},
            imageKey: {type: String}
        },
        address: {
            district: {type: String},
            State: {type: String},
            zip: {type: Number}
        },
        school: {
            type: String,
        },
        subscriptions: [{
            type: mongoose.Types.ObjectId,
            ref: 'subscription'
        }],
        wallet: {
            type: Number,
            default: 0
        },
        referrals: [{
            username: {type: String, required: true},/*  */
            amount: {type: Number, required: true}
        }],
        referrer: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

StudentSchema.pre('save', async function (next) {
    try {
        if(this.password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPass = await bcrypt.hash(this.password, salt)
            this.password = hashedPass
        }
        next()
    } catch(err) {
        next(err)
    }
})

StudentSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch(err) {
        throw err
    }
}

module.exports = mongoose.model('student', StudentSchema)