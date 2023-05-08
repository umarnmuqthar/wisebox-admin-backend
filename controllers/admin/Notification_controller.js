// const createError = require('http-errors')
// const slugify = require('slugify')
const shortId = require('shortid')
// const { generateSlug } = require('../../utils/generateSlug')
const Student = require('../../models/Student_model');
const admin = require('../../utils/communication/notification_helper')

module.exports = {
    sendNotification: async (req, res, next) => {
        try {
            const { title, body } = req.body

            const students = await Student.find({ fcmToken: { $exists: true } }, 'fcmToken')
            const tokens = students.map(student => student.fcmToken);

            const resp = await admin.firebase.messaging().sendMulticast({
                tokens,
                data: {
                    notifee: JSON.stringify({
                        title,
                        body,
                        android: {
                            channelId: "default",
                            // actions: [
                            //     {
                            //         title: 'Mark as Read',
                            //         pressAction: {
                            //             id: 'read',
                            //         },
                            //     },
                            // ],
                        },
                    }),
                },
            });

            res.send({
                data: {
                    message: "Notifications send successfully",
                    users: tokens.length,
                    resp
                }
            })
        } catch (err) {
            next(err)
        }
    },
}

