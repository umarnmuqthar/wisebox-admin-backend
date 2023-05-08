const createError = require('http-errors')
const Subscription = require('../../models/Subscription_model')
const Student = require('../../models/Student_model')
const Payment = require('../../models/Payment_model')
const RazorpayInstance = require('../../utils/razorpay_helper')
const shortId = require('shortid')
const mongooseObjId = require('mongoose').Types.ObjectId
const moment = require('moment')
const Progress = require('../../models/Progress_model')

const { RAZORPAY_VALIDATE_SECRET } = process.env


/* Subscription state 
    - UNSUBSCRIBED
    - PENDING
    - SUBSCRIBED    
    - EXPIRED
*/

module.exports = {
    addSubscription: async (req, res, next) => {
        try {
            const { stream, classId } = req.body
            const studentId = req.payload.id

            if (!stream && !classId) throw createError.BadRequest('Stream / class for subscription is missing')


            const newSubscription = new Subscription({
                stream: stream,
                classId: classId,
                studentId: studentId,
            })

            const subscription = await newSubscription.save()

            const student = await Student.findOne({ _id: studentId })
            student.subscriptions.push(subscription._id)
            await student.save()

            res.send(subscription)
        } catch (err) {
            next(err)
        }
    },

    order_payment: async (req, res, next) => {
        try {
            //get course or stream id from req.body
            const { stream, classId } = req.body
            const studentId = req.payload.id

            if (!stream && !classId) throw createError.BadRequest('Stream / class for subscription is missing')

            //check whether already subscribed
            let subscription = await Subscription.findOne({
                stream: stream,
                classId: classId,
                studentId: studentId,
            })

            if (subscription) {
                subscription.status = "PENDING"
                subscription = await subscription.save()
            }

            if (subscription && subscription?.isActive) {
                throw createError.BadRequest("Already Subscribed")
            } else if (!subscription) {
                const newSubscription = new Subscription({
                    stream: stream,
                    classId: classId,
                    studentId: studentId,
                    status: "PENDING"
                })

                subscription = await newSubscription.save()
                // const phone = paymentInfo.payload.payment.entity
                const student = await Student.findOne({ _id: studentId })
                student.subscriptions.push(subscription._id)
                await student.save()
            }

            //identify course and fetch amount info from config/db

            const payment_capture = true
            const amount = 700

            const student = await Student.findById(studentId)
            const { name, email, phone } = student

            const options = {
                amount: (amount * 100).toString(),
                payment_capture,
                receipt: shortId.generate(),
                currency: "INR",
            }
            const razorpayOrder = await RazorpayInstance.instance.orders.create(options)

            res.send({
                id: razorpayOrder.id,
                subscriptionId: subscription._id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                prefill: {
                    email,
                    contact: phone,
                    name,
                },
                notes: {
                    studentId,/* TODO: change later(remove) */
                    classId,
                    stream,
                    subscriptionId: subscription._id,
                },
            })
        } catch (err) {
            next(err)
        }
    },

    verify_payment: async (req, res, next) => {
        try {
            const paymentInfo = req.body

            const crypto = require('crypto')
            const shasum = crypto.createHmac('sha256', RAZORPAY_VALIDATE_SECRET)
            shasum.update(JSON.stringify(req.body))
            const digest = shasum.digest('hex')

            if (digest === req.headers['x-razorpay-signature']) {

                const notes = paymentInfo.payload.payment.entity.notes

                // store the payment info in db
                const payment = new Payment({ ...paymentInfo, studentId: notes.studentId })
                await payment.save()


                // create new subscription and add to the student data
                //TODO: if same subscription exits dont create one, instead update active->true
                let subscription = await Subscription.findOne({
                    _id: notes.subscriptionId,
                    stream: notes.stream,
                    classId: notes.classId,
                    studentId: notes.studentId,
                })


                const YEAR_VALIDITY = 1
                let oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + YEAR_VALIDITY);
                const VALIDITY = new Date(oneYearFromNow);

                if (subscription) {
                    subscription.isActive = true
                    subscription.status = "SUBSCRIBED"
                    subscription.validity = VALIDITY
                    subscription = await subscription.save()
                } else {

                    const newSubscription = new Subscription({
                        stream: notes.stream,
                        classId: notes.classId,
                        studentId: notes.studentId,
                        validity: VALIDITY,
                        status: "SUBSCRIBED"
                    })

                    subscription = await newSubscription.save()
                    // const phone = paymentInfo.payload.payment.entity
                    const student = await Student.findOne({ _id: notes.studentId })
                    student.subscriptions.push(subscription._id)
                    await student.save()
                }


                res.send({ status: 'ok' })
            } else {
                throw createError.BadRequest()
            }
        } catch (err) {
            next(err)
        }
    },

    getSubscription: async (req, res, next) => {
        try {
            const { subscriptionId } = req.params

            if (!subscriptionId) throw createError.BadRequest('SubscriptonId is required')

            let subscription = await Subscription.findById(subscriptionId)
                .populate([{
                    path: 'stream',
                    match: { active: true, deleted: false },
                    select: '-deleted',
                    populate: [{
                        path: 'subjects',
                        match: { active: true, deleted: false },
                        select: "-chapters -previousQuestions"
                    }, {
                        path: 'classId',
                        match: { active: true, deleted: false },
                        select: '_id name',
                    }]
                }, {
                    path: 'classId',
                    match: { active: true, deleted: false },
                    select: '-deleted',
                    populate: {
                        path: 'subjects',
                        match: { active: true, deleted: false },
                        select: "-chapters -previousQuestions"
                    }
                }]).exec()

            subscription = subscription.toObject()
            if (subscription.stream) {
                subscription.subjects = subscription.stream.subjects
                delete subscription.classId
                delete subscription.stream.subjects
            } else {
                subscription.subjects = subscription.classId.subjects
                delete subscription.stream
                delete subscription.classId.subjects
            }
            delete subscription.__v

            res.send(subscription)
        } catch (err) {
            next(err)
        }
    },

    getProgress: async (req, res, next) => {
        try {
            const { subscription_id } = req.query
            const studentId = req.payload.id

            if (!subscription_id) throw createError.BadRequest('Subscripton id is required')

            /* 
                response
                - progress of each subjects
                    - total chapters
                    - total slabs
                    - percentage completion
                - total accuracy
                - avg time / qn
                - total slabs
                - slabs attended
            */

            const data = await Subscription.aggregate([
                { $match: { _id: mongooseObjId(subscription_id), studentId: mongooseObjId(studentId) } },
                {
                    $lookup: {
                        from: "streams",
                        let: { streamId: "$stream" },
                        as: "stream",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$$streamId", "$_id"] },
                                            { $eq: ["$active", true] },
                                            { $eq: ["$deleted", false] },
                                        ]
                                    },
                                }
                            },
                        ]
                    }
                },
                {
                    $addFields: {
                        subjects: { $arrayElemAt: ["$stream.subjects", 0] },
                        stream: { $arrayElemAt: ["$stream", 0] },
                    }
                },
                {
                    /* NOTE: what to exclude in subscription */
                    $project: {
                        "stream.subjects": 0,
                        "__v": 0,
                        "createdAt": 0,
                        "updatedAt": 0,
                        wiseCoins: 0,
                        bookmarkedQuestions: 0,
                        crowns: 0,
                    }
                },


                /* after getting subjects ids from stream or class */
                {
                    $lookup: {
                        from: "subjects",
                        let: { classId: "$classId", subjects: "$subjects" },
                        as: "subjects",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$$classId", "$classId"] },
                                            { $eq: ["$active", true] },
                                            { $eq: ["$deleted", false] },
                                            { $in: ["$_id", "$$subjects"] }
                                        ]
                                    },
                                }
                            },
                            /* NOTE: chapters  */
                            {
                                $lookup: {
                                    from: "chapters",
                                    let: { subjectId: "$_id" },
                                    as: "chapters",
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$$subjectId", "$subject"] },
                                                        { $eq: ["$active", true] },
                                                        { $eq: ["$deleted", false] },
                                                    ]
                                                },
                                            }
                                        },
                                        {
                                            $sort: { idx: 1 }
                                        },
                                        { $project: { slug: 0, createdAt: 0, createdBy: 0, __v: 0, updatedAt: 0 } },

                                        /* NOTE: Slabs population ==================== */
                                        {
                                            $lookup: {
                                                from: "slabs",
                                                let: { chapterId: "$_id" },
                                                as: "slabs",
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ["$$chapterId", "$chapter"] },
                                                                    { $eq: ["$active", true] },
                                                                    { $eq: ["$deleted", false] },
                                                                ]
                                                            },
                                                        }
                                                    },
                                                    {
                                                        $sort: { idx: 1 }
                                                    },
                                                    // { $project: { questions: 0, active:0, deleted: 0, createdBy: 0, points: 0 }},
                                                    {
                                                        $lookup: {
                                                            from: "progresses",
                                                            let: {
                                                                slabId: "$_id",
                                                                subscriptionId: mongooseObjId(subscription_id)
                                                            },
                                                            as: "progress",
                                                            pipeline: [
                                                                {
                                                                    $match: {
                                                                        $expr: {
                                                                            $and: [
                                                                                { $eq: ["$$slabId", "$slab"] },
                                                                                { $eq: ["$$subscriptionId", "$subscriptionId"] }
                                                                            ]
                                                                        }
                                                                    }
                                                                },
                                                                // { $project: { status: 1, levels: 1, currentLevel: 1 }}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            progress: { $arrayElemAt: ["$progress", 0] },
                                                            idx: 1,
                                                            title: 1,
                                                            slug: 1
                                                        }
                                                    },
                                                    {
                                                        $addFields: {
                                                            // attended: { $cond: [{ $ifNull: ["$progress.status", false] }, 1, 0] },
                                                            attended: { $cond: [{ $in: ["$progress.status", ['BRAINSTORM', 'CROWN', 'COMPLETED']] }, 1, 0] },/* TODO: check */
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            status: { $ifNull: ["$progress.status", null] },
                                                            completion: { $ifNull: ["$progress.completion", 0] },
                                                            accuracy: { $ifNull: ["$progress.accuracy", 0] },
                                                            idx: 1,
                                                            title: 1,
                                                            slug: 1,
                                                            attended: 1
                                                        }
                                                    },
                                                ],
                                            }
                                        },
                                        {
                                            $addFields: { 
                                                slabCount: { $size: "$slabs" },
                                                slabsAttended: {
                                                    $sum: "$slabs.attended"
                                                },/* NOTE: changed to solve accuracy */
                                            },
                                        },
                                        {
                                            $addFields: {
                                                totalCompletion: {
                                                    $round: [
                                                        {
                                                            $divide: [
                                                                { $sum: "$slabs.completion" },
                                                                { $cond: [{ $eq: ["$slabCount", 0] }, 1, "$slabCount"] }
                                                            ]
                                                        },
                                                        0
                                                    ]
                                                },
                                                // slabsAttended: {
                                                //     $sum: "$slabs.attended"
                                                // },
                                                chapterWithAccuracy: { 
                                                    $cond: [{ $gt: ["$slabsAttended", 0] }, 1, 0] 
                                                },/* TODO: for accuracy */
                                                totalAccuracy: {
                                                    $round: [
                                                        {
                                                            $divide: [
                                                                { $sum: "$slabs.accuracy" },
                                                                // { $cond: [{ $eq: ["$slabCount", 0] }, 1, "$slabCount"] }
                                                                { $cond: [{ $eq: ["$slabsAttended", 0] }, 1, "$slabsAttended"] }
                                                            ]
                                                        },
                                                        0
                                                    ]
                                                },
                                                
                                            }
                                        },
                                        {
                                            $project: {
                                                active: 0,
                                                deleted: 0,
                                            }
                                        }
                                    ]
                                },
                            },

                            /* NOTE: end chapter */
                            {
                                $addFields: {
                                    totalSlabs: { $sum: "$chapters.slabCount" },
                                    totalChapters: { $size: "$chapters" },
                                    totalSlabsAttended: { $sum: "$chapters.slabsAttended" },
                                    totalChaptersWithAccuracy: { $sum: "$chapters.chapterWithAccuracy"}/* NOTE: to find subject level accuracy */
                                },
                            },
                            {
                                $addFields: {
                                    totalCompletion: {
                                        $round: [
                                            {
                                                $divide: [
                                                    { $sum: "$chapters.totalCompletion" },
                                                    { $cond: [{ $eq: ["$totalChapters", 0] }, 1, "$totalChapters"] }
                                                ]
                                            },
                                            0
                                        ]
                                    },
                                    totalAccuracy: {
                                        $round: [
                                            {
                                                $divide: [
                                                    { $sum: "$chapters.totalAccuracy" },
                                                    // { $cond: [{ $eq: ["$totalChapters", 0] }, 1, "$totalChapters"] }
                                                    { $cond: [{ $eq: ["$totalChaptersWithAccuracy", 0] }, 1, "$totalChaptersWithAccuracy"] }/* NOTE: =============== */
                                                ]
                                            },
                                            0
                                        ]
                                    },
                                    subjectWithAccuracy: { 
                                        $cond: [{ $gt: ["$totalChaptersWithAccuracy", 0] }, 1, 0] 
                                    },/* TODO: for accuracy */
                                }
                            },
                            {
                                $project: {
                                    slug: 0, createdAt: 0, createdBy: 0, __v: 0,
                                    updatedAt: 0, active: 0, deleted: 0, createdAt: 0, updatedAt: 0, __v: 0,
                                    chapters: 0, previousQuestions: 0, classId: 0/* TODO: cross check */
                                }
                            },
                        ],

                    }
                },

                /* End of Subject  pipe */
                {
                    $addFields: {
                        totalSlabs: { $sum: "$subjects.totalSlabs" },
                        totalChapters: { $sum: "$subjects.totalChapters" },
                        totalSlabsAttended: { $sum: "$subjects.totalSlabsAttended" },
                        totalSubjectsWithAccuracy: { $sum: "$subjects.subjectWithAccuracy" }/* NOTE: =============== */
                    }
                },
                {
                    $addFields: {
                        totalCompletion: {
                            $round: [
                                {
                                    $divide: [
                                        { $sum: "$subjects.totalCompletion" },
                                        { $cond: [{ $eq: [{ $size: "$subjects" }, 0] }, 1, { $size: "$subjects" }] }
                                    ]
                                },
                                0
                            ]
                        },
                        totalAccuracy: {
                            $round: [
                                {
                                    $divide: [
                                        { $sum: "$subjects.totalAccuracy" },
                                        // { $cond: [{ $eq: [{ $size: "$subjects" }, 0] }, 1, { $size: "$subjects" }] }
                                        { $cond: [{ $eq: ["$totalSubjectsWithAccuracy", 0] }, 1, "$totalSubjectsWithAccuracy"] }/* NOTE: ============ */
                                    ]
                                },
                                0
                            ]
                        },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        isActive: 1,
                        status: 1,
                        subjects: 1,
                        totalSlabs: 1,
                        totalChapters: 1,
                        totalSlabsAttended: 1,
                        // totalSubjectsWithAccuracy: 1,
                        totalCompletion: 1,
                        totalAccuracy: 1
                    }
                },
                {
                    /* exclude */
                    $project: {
                        "subjects.totalSlabsAttended": 0,
                        "subjects.totalAccuracy": 0,
                        "subjects.totalChaptersWithAccuracy": 0
                    }
                }
            ])

            res.send(data[0])
        } catch (err) {
            next(err)
        }
    },

    getLeaderboard: async (req, res, next) => {
        try {
            const { subscription_id } = req.query
            // const studentId = req.payload.id

            if (!subscription_id) throw createError.BadRequest('Subscripton id is required')

            const subscription = await Subscription.findById(subscription_id)

            if (!subscription) throw createError.NotFound('Subscription not found')

            const { stream, classId } = subscription

            //TODO: start time from 12am monday
            const firstday = moment().startOf('isoweek');

            const data = await Subscription.aggregate([
                {
                    $match: { /* _id: mongooseObjId(subscription_id), status: 'SUBSCRIBED', isActive*/ stream: mongooseObjId(stream), classId: mongooseObjId(classId), }
                },
                {
                    $addFields: { weeklyCoins: { $filter: { input: "$wiseCoins.weeklyCoins", as: 'coins', cond: { $gte: ["$$coins.date", new Date(firstday)] } } } }
                },
                {
                    $addFields: {
                        totalWeeklyCoins: {
                            $sum: "$weeklyCoins.coins"
                        },
                        weeklyCoins: { $cond: [{ $ifNull: ["$weeklyCoins", false] }, "$weeklyCoins", []] },
                    }
                },
                {
                    $addFields: {
                        lastWiseCoinTime: {
                            $let: {
                                vars: {
                                    last: {
                                        $arrayElemAt: ["$weeklyCoins", -1]
                                    }
                                },
                                in: "$$last.date"
                            }
                        }
                    }
                },
                { $sort: { totalWeeklyCoins: -1, lastWiseCoinTime: 1 } },/* NOTE: based on updation evaluation */
                {
                    $lookup: {
                        from: "students",
                        let: { studentId: "$studentId" },
                        as: "student",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$$studentId", "$_id"] },
                                            // { $eq: ["$active", true] },
                                            // { $eq: ["$deleted", false] },
                                            // { $in: ["$_id", "$$subjects"] }
                                        ]
                                    },
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    phone: 1,
                                    name: 1,
                                    email: 1,
                                    school: 1,
                                    profileImage: 1
                                }
                            }
                        ]
                    },
                },
                {
                    $project: {
                        _id: 1,
                        student: { $arrayElemAt: ["$student", 0] },
                        crowns: 1,
                        stream: 1,
                        classId: 1,
                        weeklyCoins: 1,
                        totalWeeklyCoins: 1,
                        // lastWiseCoinTime: 1
                    }
                },
                { $limit: 10 }
            ])

            res.send(data)
        } catch (err) {
            next(err)
        }
    }
}