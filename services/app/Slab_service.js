const ProgressService = require('./Progress_service')
const Slab = require('../../models/Slab_model')
const Question = require('../../models/Question_model')
const Chapter = require('../../models/Chapter_model')
const shortid = require('shortid')
const Subject = require('../../models/Subject_model')
const Progress = require('../../models/Progress_model')
const mongooseObjId = require('mongoose').Types.ObjectId

//TODO: store in config
const QUESTION_COUNT = 10

module.exports = {
    getSlabs: async () => { },

    getSlab: async (params) => {
        try {
            const { subscriptionId, _id } = params
            const slab = await Slab.findOne({ _id, deleted: false, active: true }, "-active -deleted -createdBy")
                .populate([
                    // {
                    //     path: 'questions',
                    //     select: '-deleted -active'
                    // },
                    {
                        path: 'chapter',
                        select: 'name idx _id'
                    }
                ])
                .exec()

            let progress
            const slabId = slab._id

            /* TODO: review response  */
            if (slab.questions.length === 0) {
                return { slab, progress: {} }
            }

            progress = await ProgressService.getProgress({ slab: slabId, subscriptionId })

            const chapter = await Chapter.findById(slab.chapter)
            const subjectId = chapter.subject

            if (!progress) {
                /* subjectId, subscriptionId, slabId */
                const questions = slab?.questions?.length ?? 0
                const val = Math.ceil(questions / 10)
                let levels = val < 2 ? 2 : val
                /* TODO: review */
                if (slab?.questions?.length <= 10) {
                    levels = 1
                }
                /* TODO: review */

                progress = await ProgressService.createProgress({ subjectId, subscriptionId, slabId, levels })
            }

            progress = progress.toObject()
            delete progress.currentLevel.questions
            delete progress.correctQuestions
            delete progress.attemptedQuestions
            delete progress.__v

            /* TODO: if current Level is 0 -- add random 10 quesitions */

            return { slab, progress }
        } catch (err) {
            throw err
        }
    },

    getSlabQuestions: async (params) => {
        try {
            /* TODO: logic for generating questions for levels */
            const { subscriptionId, ...rest } = params
            const slab = await Slab.findOne({ ...rest, deleted: false, active: true }, "-active -deleted -createdBy")
            // .populate([
            //     {
            //         path: 'questions',
            //         select: "-deleted -active"
            //     }
            // ]).exec()

            /* TODO: review response  */
            if (slab.questions.length === 0) {
                return { questions: [], progress: {} }
            }

            const slabId = slab._id

            const progress = await ProgressService.getProgress({ slab: slabId, subscriptionId })

            const questions = new Set(slab.questions.map(id => id.toString()))

            const correctQuestions = new Set(progress.correctQuestions.map(id => id.toString()))
            // const wrongQuestions = new Set(progress.wrongQuestions)

            /* NOTE: remaining_questions = questions - correctQuestions */
            const difference = (setA, setB) => {
                let _difference = new Set(setA)
                for (let elem of setB) {
                    _difference.delete(elem)
                }
                return _difference
            }
            const remaining_questions = difference(questions, correctQuestions)


            /* 
                NOTE: len(random_remaining_questions) =  10 - len(wrong_questions)
                     new_questions = wrongQuestions + remaining_questions = 10
             */
            /* OR */
            /* 
                new_questions = random(remaining_questions, 10) 
            
                if(len(new_questions) < 10) {
                        remaning = 10 - len
                        new_questions = random(correctQuestions, 10)
                }
            */
            const getRandomIds = (array, n) => {
                const shuffled = array.sort(() => { return .5 - Math.random() })
                const selected = shuffled.slice(0, n)
                return selected
            }
            let new_questions = getRandomIds(Array.from(remaining_questions), QUESTION_COUNT)

            if (new_questions.length < QUESTION_COUNT) {
                const remaining_count = QUESTION_COUNT - new_questions.length
                const random_questions = getRandomIds(progress.correctQuestions, remaining_count)

                new_questions = [...new_questions, ...random_questions]
            }

            /* store the current qns in progress */
            progress.currentLevel.questions = new_questions
            progress.currentLevel.track_id = shortid.generate()/* NOTE: to check whether evaluation for this set of qns */
            // progress.currentLevel.value = 0
            let new_progress = await progress.save()
            // new_progress.currentLevel = {value: new_progress.currentLevel.value}

            new_questions = await Question.find(
                {
                    active: true, deleted: false
                },
                "-active -deleted -createdBy"
            )
                .where('_id')
                .in(new_questions)
                .exec();

            /* filter out progress data */
            new_progress = new_progress.toObject()
            delete new_progress.currentLevel.questions
            delete new_progress.correctQuestions
            delete new_progress.attemptedQuestions
            delete new_progress.__v

            return { questions: new_questions, progress: new_progress }

        } catch (error) {
            throw error
        }
    },

    getSuggestedTopic: async (params) => {
        try {
            const { subscriptionId, subjectId } = params

            const enumOrder = [ 'CROWN', 'BRAINSTORM', 'COMPLETED' ]

            let matchQuery 
            if (subjectId) {
                matchQuery = { subscriptionId: mongooseObjId(subscriptionId), subject: mongooseObjId(subjectId), status: { $in: enumOrder } } 
            } else {
                matchQuery = { subscriptionId: mongooseObjId(subscriptionId), status: { $in: enumOrder } }
            }

            const topic = await Progress.aggregate([
                { $match: matchQuery },
                { "$addFields" : { "__order" : { "$indexOfArray" : [ enumOrder, "$status" ] } } },
                { "$sort" : { "__order" : 1 } },
                {
                    $lookup: {
                        from: "subjects",
                        let: { subjectId: "$subject" },
                        as: "subject",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$$subjectId", "$_id"] },
                                            { $eq: ["$active", true] },
                                            { $eq: ["$deleted", false] },
                                        ]
                                    },
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    slug: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "slabs",
                        let: { slabId: "$slab" },
                        as: "slab",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$$slabId", "$_id"] },
                                            // { $eq: ["$active", true] },
                                            // { $eq: ["$deleted", false] },
                                        ]
                                    },
                                }
                            },
                            {
                                $lookup: {
                                    from: "chapters",
                                    let: { chapterId: "$chapter" },
                                    as: "chapter",
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$$chapterId", "$_id"] },
                                                        // { $eq: ["$active", true] },
                                                        // { $eq: ["$deleted", false] },
                                                    ]
                                                },
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                idx: 1,
                                                name: 1,
                                                slug: 1,
                                                active: 1, 
                                                deleted: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    idx: 1,
                                    title: 1,
                                    slug: 1,
                                    chapter: { $arrayElemAt: ["$chapter", 0] },
                                    active: 1,
                                    deleted: 1
                                }
                            }
                        ]
                    }
                },
                { 
                    $project: {
                        _id: 1,
                        status: 1,
                        // subscriptionId: 1,
                        slab: { $arrayElemAt: ["$slab", 0] },
                        chapter: { $arrayElemAt: ["$slab.chapter", 0] },
                        subject: { $arrayElemAt: ["$subject", 0] }
                    }
                },
                {
                    $project: {
                        "slab.chapter": 0
                    }
                },
                /* TODO: should check subject is in the course or stream in subscription */
                // {
                //     $lookup: {
                //         from: "subscriptions",
                //         let: { subscriptionId: "$subscriptionId" },
                //         as: "subscription",
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $and: [
                //                             { $eq: ["$$subscriptionId", "$_id"] },
                //                             // { $eq: ["$isActive", true] },
                //                         ]
                //                     },
                //                 }
                //             },
                //         ]
                //     }
                // },
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$slab.active", true] },
                                { $eq: ["$slab.deleted", false] },
                                { $eq: ["$chapter.active", true] },
                                { $eq: ["$chapter.deleted", false] },
                            ]
                        },
                    }
                },
                {
                    $project: {
                        "slab.active": 0,
                        "slab.deleted": 0,
                        "chapter.active": 0,
                        "chapter.deleted": 0,
                    }
                },
            ])

            return topic[0]
        } catch (error) {
            throw error
        }
    }
}