const Subject = require('../../models/Subject_model')
const Slab_service = require('./Slab_service')
const mongooseObjId = require('mongoose').Types.ObjectId

module.exports = {
    getSubject: async (params) => {
        try {

            const subscriptionId = params.subscriptionId
            
            const subjects = await Subject.aggregate([
                { $match: { _id: mongooseObjId(params._id), deleted: false, active: true } },
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
                                                    subscriptionId: mongooseObjId(subscriptionId) 
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
                                        { $project: { 
                                            progress: { $arrayElemAt: ["$progress", 0] }, 
                                            idx: 1, 
                                            title: 1, 
                                            slug: 1 
                                        }},
                                        { $project: { 
                                            status: { $ifNull: ["$progress.status", null] }, 
                                            idx: 1, 
                                            title: 1, 
                                            slug: 1 
                                        }}
                                    ],
                                }
                            },
                            { $addFields: { slabCount: { $size: "$slabs" } } },
                            { $project: { 
                                active: 0, 
                                deleted: 0, 
                            }}
                        ]
                    }
                },
                { $addFields: { 
                    totalSlabs: { $sum: "$chapters.slabCount" }, 
                    totalChapters: { $size: "$chapters" } 
                }},
                { $project: { 
                    active: 0, 
                    deleted: 0, 
                    createdBy: 0,
                    updatedAt: 0,
                    createdAt: 0,
                    __v: 0
                }}
            ])

            const suggestedTopic = await Slab_service.getSuggestedTopic({subjectId: params._id, subscriptionId})

            const subject = {
                ...subjects[0],
                suggestedTopic
            }

            return subject
        } catch (error) {
            throw error
        }
    }
}