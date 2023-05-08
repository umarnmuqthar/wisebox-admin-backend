const createError = require('http-errors')
const { sendOtpSchema, verifyOtpSchema, updateStudentSchema } = require('../../utils/validation_schema/app/auth_schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt_helper')
const client = require('../../utils/redis_helper')
const imageResizer = require('../../utils/resize_Image')
//models
const Student = require('../../models/Student_model')
const { sendOTP, retryOTP } = require('../../utils/communication/sms_helper')
const { deleteFile, uploadFile } = require('../../utils/aws_s3_helper')

function generateOTP(length = 4) {
    // Declare a digits variable 
    // which stores all digits
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

module.exports = {
    send_otp: async (req, res, next) => {
        try {
            const { phone, email } = await sendOtpSchema.validateAsync(req.body, { abortEarly: false })

            if (!email && !phone) throw createError.BadRequest("Email / Phone required")

            //if phone send otp to phone no

            //elif email send otp to email

            //store otp in redis
            const key = email ? email : phone
            client.GET(key, async (err, result) => {
                if (err) {
                    let err = createError.InternalServerError()
                    next(err);
                }
                //check if exists
                if (result) {
                    //key exists
                    //send mail
                    if (email) {
                        // sendMail(result)
                    } else {
                        // retryOPT(result)
                        // if (process.env.NODE_ENV !== "development") {/* TODO: change condition later */
                        //     const options = {
                        //         phone
                        //     }
                        //     const state = await retryOTP(options)
                        //     if (!state) {
                        //         let error = createError.InternalServerError()
                        //         return next(error)
                        //     }
                        // }
                        if (process.env.NODE_ENV !== "development") {
                            const options = {
                                otp: result,
                                phone
                            }
                            const state = await sendOTP(options)
                            if (!state) {
                                let error = createError.InternalServerError()
                                return next(error)
                            }
                        }
                    }
                    //TODO: remove
                    res.send({
                        message: "Otp has been send Successfully",
                        success: true
                    })
                } else {
                    //key doesnot exist
                    //generate new otp and send
                    let otp = process.env.NODE_ENV === "development" ? 1234 : generateOTP(4)
                    //   let otp = 1234/* TODO: remove later */

                    client.SET(key, otp, "EX", /* 24 * 60 * 60 */ 10 * 60, async (err, _) => {
                        if (err) {
                            let err = createError.InternalServerError()
                            next(err);
                        }

                        if (email) {
                            //send email with OTP
                            //   sendMail(otp)
                        } else {
                            // Send SMS OTP
                            if (process.env.NODE_ENV !== "development") {
                                const options = {
                                    otp,
                                    phone
                                }
                                const state = await sendOTP(options)
                                if (!state) {
                                    let error = createError.InternalServerError()
                                    return next(error)
                                }
                            }
                        }

                        res.send({
                            message: "Otp has been send Successfully",
                            success: true,
                        })
                    });
                }
            })

        } catch (err) {
            next(err)
        }
    },

    verify_otp: async (req, res, next) => {
        try {
            const { otp, phone, email } = await verifyOtpSchema.validateAsync(req.body, { abortEarly: false })

            if (!email && !phone) throw createError.BadRequest("Email / Phone required")

            //verify otp from redis
            const key = email ? email : phone
            client.GET(key, async (err, result) => {
                try {

                    if (err) {
                        let err = createError.InternalServerError()
                        next(err);
                    }

                    let isVerified = +result === otp;
                    //otp check
                    if (isVerified) {
                        client.DEL(key, (err, _) => {
                            if (err) {
                                let err = createError.InternalServerError()
                                next(err);
                            }
                        });

                        //checking for new user
                        let student = await Student.findOne({ phone })
                        if (!student) {
                            //create student
                            const newStudent = new Student({ phone })
                            student = await newStudent.save()
                        }

                        //tokens
                        const accessToken = await signAccessToken(student._id);
                        const refreshToken = await signRefreshToken(student._id);
                        res.send({ accessToken, refreshToken });
                    } else {
                        throw createError.BadRequest("Invalid OTP")
                    }

                } catch (err) {
                    next(err);
                }
            });
        } catch (err) {
            next(err)
        }
    },

    refresh_token: async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) throw createError.BadGateway()
            const student = await verifyRefreshToken(refreshToken)
            const accessToken = await signAccessToken(student.id)
            res.send({ accessToken })
        } catch (err) {
            next(err)
        }
    },

    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) throw createError.BadRequest()
            const studentId = await verifyRefreshToken(refreshToken)

            client.DEL(studentId, (err, val) => {
                if (err) {
                    // console.log(err.message)
                    throw createError.InternalServerError()
                }
                res.sendStatus(204)
            })
        } catch (err) {
            next(err)
        }
    },

    get_student: async (req, res, next) => {
        try {
            const id = req.payload.id

            if (!id) throw createError.BadRequest()

            const student = await Student.findById(id)
                .populate({
                    path: 'subscriptions',
                    select: "-__v -updatedAt -createdAt",
                })

            /*TODO: 
                - if not student return error 401
                - remove refresh token
                - so that student gets auto logged out
            */

            res.send(student)
        } catch (err) {
            console.log(err)
            next(err)
        }
    },

    update_student: async (req, res, next) => {
        try {
            const id = req.payload.id

            if (!id) throw createError.BadRequest()

            const result = await updateStudentSchema.validateAsync(req.body, { abortEarly: false })

            const student = await Student.findByIdAndUpdate(id, result, { new: true })
                .populate({
                    path: 'subscriptions',
                    select: "-__v -updatedAt -createdAt",
                })

            res.send(student)
        } catch (err) {
            console.log(err)
            next(err)
        }
    },

    update_profile_pic: async (req, res, next) => {
        try {
            const id = req.payload.id

            if (!id || !req.files?.image) throw createError.BadRequest()

            const student = await Student.findById(id)

            /* delete if already exists */
            if(student.profileImage.imageKey) {
                await deleteFile(student.profileImage.imageKey)
            }

            const file = req.files['image'][0]
            const resizedImage = await imageResizer(file)
            
            file.filename = resizedImage.filename
            file.path = resizedImage.filepath
            // file.filename= (await resized_image).filename
            // file.path = (await resized_image).path

            const qImage = await uploadFile(file, '/images/profile')
            student.profileImage.imageUrl = qImage.Location
            student.profileImage.imageKey = qImage.Key

            await student.save()

            res.send({ message: 'Profile image uploaded successfully!', url:  qImage.Location})
        } catch(err) {
            next(err)
        }
    }
}