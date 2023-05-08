const ClassModel = require('../../models/Class_model')

module.exports = {

    getAllCourses: async () => {
        try {
            const courses = await ClassModel.aggregate([
                { $match: { deleted: false, active: true } },
                {
                    $lookup: {
                        from: "subjects",
                        let: { classId: "$_id" },
                        as: "subjects",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$$classId", "$classId"] },
                                            { $eq: ["$active", true] },
                                            { $eq: ["$deleted", false] },
                                        ]
                                    },
                                }
                            },
                            { $project: { _id: 1, name: 1 } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "streams",
                        let: { classId: "$_id" },
                        as: "streams",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$$classId", "$classId"] },
                                            { $eq: ["$active", true] },
                                            { $eq: ["$deleted", false] },
                                        ]
                                    },
                                }
                            },
                            {
                                $lookup: {
                                    from: "subjects",
                                    let: { classId: "$classId" },
                                    as: "subjects",
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$$classId", "$classId"] },
                                                        { $eq: ["$active", true] },
                                                        { $eq: ["$deleted", false] },
                                                    ]
                                                },
                                            }
                                        },
                                        { $project: { _id: 1, name: 1 } }
                                    ]
                                }
                            },
                            { $project: { _id: 1, subjects: 1, name: 1 } },
                        ]
                    }
                },
                { $project: { _id: 1, subjects: 1, name: 1, idx: 1, streams: 1 } },
            ])

            return courses
        } catch (err) {
            throw err
        }
    },

}