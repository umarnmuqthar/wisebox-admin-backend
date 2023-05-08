// const createError = require('http-errors')
// const slugify = require('slugify')
// const shortId = require('shortid')
// const { generateSlug } = require('../../utils/generateSlug')
const Student = require('../../models/Student_model')
const firebase = require('../../utils/communication/notification_helper')

module.exports = {
    registerNotificationService: async (req, res, next) => {
        try {
            const {token} = req.body
            const userId = req.payload.id
            
            if(!token) throw createError.BadRequest('Token is required!')

            await Student.findByIdAndUpdate(userId, {fcmToken: token})

            res.send({ message: 'Device registered successfully' })
        } catch(err) {
            next(err)
        }
    },
}

