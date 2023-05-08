const Progress = require('../../models/Progress_model')

module.exports = {
    getProgress: async (params) => {
        try {
            const progress = await Progress.findOne({...params}).exec()
            
            return progress
        } catch (error) {
            throw error
        }
    },

    createProgress: async (data) => {
        /* 
        - slab 
        - subscription
        - subject
        */
        try {
            const {subjectId, slabId, subscriptionId, levels} = data
            const newProgress = Progress({
                slab: slabId,
                subscriptionId,
                subject: subjectId,
                levels
            })

            const progress = await newProgress.save()

            return progress

        } catch (error) {
            throw error
        }


    }
}